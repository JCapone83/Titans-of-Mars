import Phaser from 'phaser'
import { useEffect, useRef } from 'react'
import { BUILDINGS } from '../game/buildings.js'
import { knownSiteFeatures, terrainSupportsBuilding, unknownSurveyProspects } from '../game/siteFeatures.js'
import { cellWithinUtilityReach } from '../game/utilityNetwork.js'

const WIDTH = 1200
const HEIGHT = 680
const COLS = 9
const ROWS = 6
const TILE_W = 100
const TILE_H = 50
const ORIGIN_X = 600
const ORIGIN_Y = 178

const cellToPoint = (col, row) => ({
  x: ORIGIN_X + (col - row) * TILE_W / 2,
  y: ORIGIN_Y + (col + row) * TILE_H / 2,
})

function pointToCell(x, y) {
  const dx = x - ORIGIN_X
  const dy = y - ORIGIN_Y
  const col = Math.round(((dx / (TILE_W / 2)) + (dy / (TILE_H / 2))) / 2)
  const row = Math.round(((dy / (TILE_H / 2)) - (dx / (TILE_W / 2))) / 2)
  return { col, row }
}

function diamond(graphics, col, row, fillColor, fillAlpha, lineColor, lineAlpha = 1) {
  const { x, y } = cellToPoint(col, row)
  const points = [
    new Phaser.Geom.Point(x, y - TILE_H / 2),
    new Phaser.Geom.Point(x + TILE_W / 2, y),
    new Phaser.Geom.Point(x, y + TILE_H / 2),
    new Phaser.Geom.Point(x - TILE_W / 2, y),
  ]
  graphics.fillStyle(fillColor, fillAlpha).fillPoints(points, true)
  graphics.lineStyle(1, lineColor, lineAlpha).strokePoints(points, true)
}

class ColonyScene extends Phaser.Scene {
  constructor(callbacks) {
    super('colony')
    this.callbacks = callbacks
    this.buildings = []
    this.network = { connectedUids: [], isolatedUids: [], edges: [], online: 0, total: 0 }
    this.buildMode = null
    this.spriteGroup = null
    this.siteState = { sponsorId: null, surveyedFeatureIds: [] }
  }

  preload() {
    this.load.image('terrain', './assets/mars-terrain.png')
    this.load.spritesheet('building-atlas', './assets/building-atlas.png', { frameWidth: 443, frameHeight: 443 })
    this.load.spritesheet('building-expansion', './assets/building-atlas-expansion.png', { frameWidth: 443, frameHeight: 443 })
  }

  create() {
    this.add.image(WIDTH / 2, HEIGHT / 2, 'terrain').setDisplaySize(WIDTH, HEIGHT)
    this.features = this.add.graphics()
    this.grid = this.add.graphics()
    this.coverage = this.add.graphics()
    this.links = this.add.graphics()
    this.hover = this.add.graphics()
    this.spriteGroup = this.add.group()
    this.drawSiteFeatures()
    this.drawGrid()
    this.syncBuildings(this.buildings)
    this.input.on('pointermove', (pointer) => this.drawHover(pointer.worldX, pointer.worldY))
    this.input.on('pointerdown', (pointer) => {
      const { col, row } = pointToCell(pointer.worldX, pointer.worldY)
      if (this.buildMode && col >= 0 && col < COLS && row >= 0 && row < ROWS) {
        this.callbacks.onPlace.current(this.buildMode, col, row)
      }
    })
  }

  drawGrid() {
    this.grid.clear()
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        diamond(this.grid, col, row, 0xd48c52, 0.025, 0xf1c080, 0.28)
      }
    }
  }

  drawSiteFeatures() {
    this.features.clear()
    unknownSurveyProspects(this.siteState).forEach((feature) => {
      const color = 0x9b82c8
      const { x, y } = cellToPoint(feature.col, feature.row)
      diamond(this.features, feature.col, feature.row, color, 0.08, color, 0.62)
      this.features.lineStyle(2, color, 0.8)
      this.features.strokeCircle(x, y, 7)
    })
    knownSiteFeatures(this.siteState).forEach((feature) => {
      const color = feature.kind === 'ice' ? 0x64c3d3 : 0xe2ad38
      const { x, y } = cellToPoint(feature.col, feature.row)
      diamond(this.features, feature.col, feature.row, color, feature.kind === 'ice' ? 0.22 : 0.13, color, 0.9)
      if (feature.kind === 'ice') {
        this.features.fillStyle(color, 0.9)
        this.features.fillCircle(x - 10, y, 4).fillCircle(x, y - 5, 4).fillCircle(x + 10, y, 4)
      } else {
        this.features.lineStyle(3, color, 0.9)
        this.features.lineBetween(x - 15, y + 6, x, y - 8).lineBetween(x, y - 8, x + 15, y + 6)
      }
    })
  }

  drawHover(x, y) {
    this.hover.clear()
    const { col, row } = pointToCell(x, y)
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return
    const occupied = this.buildings.some((building) => building.col === col && building.row === row)
    const reachable = cellWithinUtilityReach(this.buildings, this.network, col, row)
    const terrainValid = !this.buildMode || terrainSupportsBuilding(this.siteState, this.buildMode, col, row)
    const color = occupied || (this.buildMode && (!reachable || !terrainValid)) ? 0xd84a40 : this.buildMode ? 0xf0b83f : 0x77c7d8
    diamond(this.hover, col, row, color, this.buildMode ? 0.18 : 0.08, color, 0.9)
  }

  drawCoverage() {
    this.coverage?.clear()
    if (!this.coverage || !this.buildMode) return
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        if (this.buildings.some((building) => building.col === col && building.row === row)) continue
        const reachable = cellWithinUtilityReach(this.buildings, this.network, col, row)
        const valid = reachable && terrainSupportsBuilding(this.siteState, this.buildMode, col, row)
        const color = valid ? 0x77c7d8 : 0x6f2b27
        diamond(this.coverage, col, row, color, valid ? 0.09 : 0.035, color, valid ? 0.5 : 0.18)
      }
    }
  }

  setBuildMode(type) {
    this.buildMode = type
    if (!type) this.hover?.clear()
    this.drawCoverage()
  }

  setSiteState(siteState) {
    this.siteState = siteState
    if (!this.features) return
    this.drawSiteFeatures()
    this.drawCoverage()
  }

  syncBuildings(buildings, network = this.network) {
    this.buildings = buildings
    this.network = network
    if (!this.spriteGroup) return
    this.spriteGroup.clear(true, true)
    this.links.clear()
    const byUid = new Map(buildings.map((building) => [building.uid, building]))

    network.edges.forEach((edge) => {
      const source = byUid.get(edge.fromUid)
      const target = byUid.get(edge.toUid)
      if (!source || !target) return
      const from = cellToPoint(source.col, source.row)
      const to = cellToPoint(target.col, target.row)
      this.links.lineStyle(7, 0x26383b, 0.78).lineBetween(from.x, from.y + 12, to.x, to.y + 12)
      this.links.lineStyle(2, 0x64c3d3, 0.86).lineBetween(from.x, from.y + 12, to.x, to.y + 12)
    })

    buildings.forEach((placed) => {
      const point = cellToPoint(placed.col, placed.row)
      const definition = BUILDINGS[placed.type]
      const sprite = this.add.sprite(point.x, point.y + 18, definition.atlas ?? 'building-atlas', definition.frame)
        .setOrigin(0.5, 0.73)
        .setDisplaySize(154, 154)
        .setDepth(point.y)
        .setInteractive({ useHandCursor: true })
      if (network.isolatedUids.includes(placed.uid)) sprite.setTint(0xbf5148).setAlpha(0.62)
      sprite.on('pointerdown', (pointer, _localX, _localY, event) => {
        event?.stopPropagation()
        if (this.buildMode) {
          const { col, row } = pointToCell(pointer.worldX, pointer.worldY)
          if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
            this.callbacks.onPlace.current(this.buildMode, col, row)
          }
          return
        }
        this.callbacks.onSelect.current(placed.uid)
      })
      this.spriteGroup.add(sprite)
    })
    this.drawCoverage()
  }
}

export default function MarsMap({ buildings, buildMode, storm, network, sponsorId, surveyedFeatureIds, settlementName, siteName, onPlace, onSelect }) {
  const hostRef = useRef(null)
  const gameRef = useRef(null)
  const sceneRef = useRef(null)
  const callbacksRef = useRef({ onPlace: { current: onPlace }, onSelect: { current: onSelect } })
  callbacksRef.current.onPlace.current = onPlace
  callbacksRef.current.onSelect.current = onSelect

  useEffect(() => {
    if (!hostRef.current || gameRef.current) return undefined
    const scene = new ColonyScene(callbacksRef.current)
    scene.buildings = buildings
    scene.network = network
    scene.buildMode = buildMode
    scene.siteState = { sponsorId, surveyedFeatureIds }
    sceneRef.current = scene
    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostRef.current,
      width: WIDTH,
      height: HEIGHT,
      backgroundColor: '#7a321f',
      scene,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      render: { antialias: true, pixelArt: false },
    })
    return () => {
      gameRef.current?.destroy(true)
      gameRef.current = null
      sceneRef.current = null
    }
  }, [])

  useEffect(() => { sceneRef.current?.syncBuildings(buildings, network) }, [buildings, network])
  useEffect(() => { sceneRef.current?.setBuildMode(buildMode) }, [buildMode])
  useEffect(() => { sceneRef.current?.setSiteState({ sponsorId, surveyedFeatureIds }) }, [sponsorId, surveyedFeatureIds])

  return (
    <div className={`mars-map ${buildMode ? 'placing' : ''} ${storm ? 'storm-active' : ''}`}>
      <div ref={hostRef} className="phaser-host" aria-label="Interactive isometric Mars construction site" />
      {buildMode ? <div className="placement-banner">{buildMode === 'ice' ? 'Choose confirmed ice lens' : 'Choose blue grid cell'}</div> : null}
      <div className="terrain-legend" aria-label="Surveyed terrain features"><span><i className="unknown-swatch" />Survey prospect</span><span><i className="ice-swatch" />Confirmed ice</span><span><i className="solar-swatch" />Solar ridge</span></div>
      <div className="site-label"><span>{settlementName}</span><strong>{siteName} · GRID {network.online}/{network.total}</strong></div>
    </div>
  )
}
