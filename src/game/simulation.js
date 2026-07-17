import { BUILDINGS } from './buildings.js'
import { advanceCrewStatus, applyCrewEffects, crewLead, ensureCrewMembers } from './crewMembers.js'
import { CROSS_TRAINING_ROLES, DEFAULT_CREW_COHORTS, crewLabor, inferLegacyCohorts, mergeCohorts } from './crewLabor.js'
import { followOnManifestById } from './followOnManifests.js'
import { LEGACY_MANIFEST, manifestById } from './manifests.js'
import { DEFAULT_ROVER_ASSIGNMENTS, ROVER_ROUTES, roverOperations } from './roverOperations.js'
import { advanceSiteSurvey, iceDepositAt, siteForSponsor, solarRidgeAt, terrainSupportsBuilding } from './siteFeatures.js'
import { sponsorById } from './sponsors.js'
import { sponsorEventAt, sponsorEventById } from './sponsorEvents.js'
import { rivalEncounterAt, rivalEncounterById, rivalSettlementFor } from './rivalSettlements.js'
import { operationalIncidentAt, operationalIncidentById } from './operationalIncidents.js'
import { buildUtilityNetwork, cellWithinUtilityReach } from './utilityNetwork.js'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const round = (value) => Math.round(value * 10) / 10
const SPONSOR_DAMAGE_OFFSET = { 'american-compact': 0, 'china-directorate': 2, 'europe-cooperative': 4, 'russia-directorate': 6 }

export function buildingEfficiency(integrity) {
  return clamp((integrity ?? 0) / 100, 0, 1)
}

export function isStormActive(sol) {
  return sol >= 18 && sol <= 21
}

export function isDebrisActive(sol) {
  return sol >= 34 && sol <= 36
}

export function colonyStats(state) {
  const storm = isStormActive(state.sol)
  const debris = isDebrisActive(state.sol)
  const network = buildUtilityNetwork(state.buildings)
  const connected = new Set(network.connectedUids)
  const labor = crewLabor(state, network.connectedUids)
  let powerCapacity = 0
  let powerDemand = 0
  let waterOutput = 0
  let waterUse = state.crew * 4.8
  let oxygenOutput = 0
  let oxygenUse = state.crew * 7.2
  let partsOutput = 0
  let foodOutput = 0
  let maintenance = 0
  let crewCapacity = 0
  let waterCapacity = 4000
  let oxygenCapacity = 3000
  let waterRecovery = 0
  let batteryCapacity = 0
  let batteryChargeRate = 0
  let batteryDischargeRate = 0
  const iceRigYields = []
  const siteProfile = siteForSponsor(state.sponsorId)
  const stormSolarFactor = clamp(0.28 / siteProfile.dustSeverity, 0.18, 0.38)

  state.buildings.forEach((placed) => {
    const building = BUILDINGS[placed.type]
    const operating = placed.integrity > 0 && connected.has(placed.uid)
    if (!operating) return
    const efficiency = buildingEfficiency(placed.integrity)
    if (building.power) {
      const ridgeMultiplier = placed.type === 'solar' ? (solarRidgeAt(state, placed.col, placed.row)?.multiplier ?? 1) : 1
      const multiplier = placed.type === 'solar' && storm ? stormSolarFactor * ridgeMultiplier : ridgeMultiplier
      powerCapacity += building.power * multiplier * efficiency
    }
    powerDemand += building.powerUse ?? 0
    if (placed.type === 'ice') {
      iceRigYields.push((iceDepositAt(state, placed.col, placed.row)?.yield ?? building.water) * efficiency)
    } else {
      waterOutput += (building.water ?? 0) * efficiency
    }
    waterUse += building.waterUse ?? 0
    oxygenOutput += (building.oxygen ?? 0) * efficiency
    foodOutput += (building.food ?? 0) * efficiency
    oxygenUse += building.oxygenUse ?? 0
    partsOutput += (building.parts ?? 0) * efficiency
    maintenance += building.maintenance ?? 0
    maintenance += (1 - efficiency) * 1.5
    crewCapacity += building.crewCapacity ?? 0
    waterCapacity += building.waterCapacity ?? 0
    oxygenCapacity += building.oxygenCapacity ?? 0
    waterRecovery = Math.max(waterRecovery, (building.waterRecovery ?? 0) * efficiency)
    batteryCapacity += (building.batteryCapacity ?? 0) * efficiency
    batteryChargeRate += (building.batteryChargeRate ?? 0) * efficiency
    batteryDischargeRate += (building.batteryDischargeRate ?? 0) * efficiency
  })

  const rovers = roverOperations(state)
  const activeIceRigs = iceRigYields.length
  const supportedIceRigs = Math.min(activeIceRigs, rovers.assignments.water)
  if (activeIceRigs) {
    const rankedYields = [...iceRigYields].sort((a, b) => b - a)
    waterOutput += rankedYields.reduce((total, fieldYield, index) => total + (index < supportedIceRigs ? fieldYield : fieldYield * 0.3), 0)
  }
  waterOutput *= labor.ratios.operations
  oxygenOutput *= labor.ratios.operations
  partsOutput *= labor.ratios.operations
  foodOutput *= Math.min(labor.ratios.operations, labor.ratios.support)
  waterUse *= 1 - waterRecovery
  if (storm) maintenance += 2.5
  if (debris) maintenance += 4
  maintenance = Math.max(0, maintenance - rovers.maintenanceRelief)
  maintenance += (1 - labor.ratios.engineering) * 5
  const basePowerCapacity = powerCapacity
  const powerDeficit = Math.max(0, powerDemand - basePowerCapacity)
  const batteryDispatch = Math.min(powerDeficit, state.batteryCharge ?? 0, batteryDischargeRate)
  powerCapacity += batteryDispatch
  const powerRatio = powerDemand === 0 ? 1 : clamp(powerCapacity / powerDemand, 0, 1)

  return {
    storm,
    debris,
    powerCapacity: round(powerCapacity),
    basePowerCapacity: round(basePowerCapacity),
    powerDemand: round(powerDemand),
    powerRatio,
    waterNet: round((waterOutput * powerRatio) - waterUse),
    oxygenNet: round((oxygenOutput * powerRatio) - oxygenUse),
    foodNet: round((foodOutput * powerRatio) - (state.crew * 1.15)),
    partsNet: round((partsOutput * powerRatio) - maintenance),
    crewCapacity,
    waterCapacity,
    oxygenCapacity,
    waterRecovery: round(waterRecovery),
    batteryCapacity: round(batteryCapacity),
    batteryChargeRate: round(batteryChargeRate),
    batteryDischargeRate: round(batteryDischargeRate),
    batteryDispatch: round(batteryDispatch),
    network,
    rovers: { ...rovers, activeIceRigs, supportedIceRigs },
    labor,
  }
}

export function missionObjectives(state) {
  const network = buildUtilityNetwork(state.buildings)
  const connected = new Set(network.connectedUids)
  const has = (type) => state.buildings.some((building) => building.type === type && building.integrity > 0 && connected.has(building.uid))
  if (state.phase === 'expansion') {
    const storageCount = state.buildings.filter((building) => building.type === 'storage' && building.integrity > 0 && connected.has(building.uid)).length
    const stats = colonyStats(state)
    return [
      { id: 'housing', label: `House the ${state.crew}-person permanent crew`, complete: stats.crewCapacity >= state.crew },
      { id: 'industry', label: 'Operate a machine workshop', complete: has('workshop') },
      { id: 'food', label: 'Produce food in a sealed greenhouse', complete: has('greenhouse') },
      { id: 'recycling', label: 'Reclaim settlement water', complete: has('recycling') },
      { id: 'reserves', label: 'Protect a second reserve-tank site', complete: storageCount >= 2 },
      { id: 'parts', label: 'Hold 60 replacement parts', complete: state.resources.parts >= 60 },
      { id: 'debris', label: 'Survive the Sol 34 debris front', complete: state.debrisSurvived },
      { id: 'labor', label: 'Staff essential engineering and surface operations', complete: stats.labor.ratios.engineering >= 0.75 && stats.labor.ratios.operations >= 0.75 },
    ]
  }
  return [
    { id: 'habitat', label: 'Commission a pressure habitat', complete: has('habitat') },
    { id: 'water', label: 'Begin local ice extraction', complete: has('ice') },
    { id: 'oxygen', label: 'Produce oxygen locally', complete: has('oxygen') },
    { id: 'power', label: 'Secure storm-resilient power', complete: has('nuclear') || (has('battery') && state.buildings.filter((item) => item.type === 'solar').length >= 2) || state.buildings.filter((item) => item.type === 'solar').length >= 4 },
    { id: 'storm', label: 'Survive the Sol 18 dust front', complete: state.stormSurvived },
  ]
}

export function buildingCost(state, type) {
  const base = BUILDINGS[type]?.cost
  if (!base) return null
  const discount = state.buildDiscounts?.[type] ?? {}
  const roverDiscount = roverOperations(state).constructionDiscount
  const logisticsDiscount = crewLead(state)?.trait === 'logistics' ? { parts: 3, cargo: 0.1 } : { parts: 0, cargo: 0 }
  return {
    parts: Math.max(0, round(base.parts - (discount.parts ?? 0) - roverDiscount.parts - logisticsDiscount.parts)),
    cargo: Math.max(0, round(base.cargo - (discount.cargo ?? 0) - roverDiscount.cargo - logisticsDiscount.cargo)),
  }
}

export function buildingRepairCost(state, uid) {
  const building = state.buildings.find((item) => item.uid === uid)
  if (!building || building.integrity >= 100) return 0
  const maintenanceRovers = roverOperations(state).assignments.maintenance
  const rate = Math.max(0.27, 0.45 - (maintenanceRovers * 0.06))
  return Math.max(1, Math.ceil((100 - building.integrity) * rate))
}

export function repairBuilding(state, uid) {
  if (state.outcome) return { state, error: 'The mission has concluded.' }
  if (state.transferWindowPending || state.pendingEventId || state.pendingRivalEncounterId || state.pendingOperationalIncidentId) return { state, error: 'Resolve the active command decision first.' }
  const building = state.buildings.find((item) => item.uid === uid)
  if (!building) return { state, error: 'Select a valid structure.' }
  if (building.integrity >= 100) return { state, error: 'That structure is already at full integrity.' }
  const cost = buildingRepairCost(state, uid)
  if (state.resources.parts < cost) return { state, error: `Repairs require ${cost} parts.` }
  const definition = BUILDINGS[building.type]
  return {
    error: '',
    state: {
      ...state,
      resources: { ...state.resources, parts: round(state.resources.parts - cost) },
      buildings: state.buildings.map((item) => item.uid === uid ? { ...item, integrity: 100 } : item),
      log: [{ sol: state.sol, tone: 'success', message: `${definition.name} restored to full operating integrity for ${cost} parts.` }, ...state.log].slice(0, 12),
    },
  }
}

export function updateCrewLead(state, memberId) {
  if (!ensureCrewMembers(state).some((member) => member.id === memberId)) return { state, error: 'Select an active mission officer.' }
  return { state: { ...state, crewLeadId: memberId }, error: '' }
}

export function updateRoverAssignment(state, routeId, delta) {
  if (!ROVER_ROUTES[routeId] || !Number.isInteger(delta) || Math.abs(delta) !== 1) {
    return { state, error: 'Select a valid rover dispatch change.' }
  }
  const operations = roverOperations(state)
  const current = operations.assignments[routeId]
  if (delta < 0 && current === 0) return { state, error: 'No rover is assigned to that route.' }
  if (delta > 0 && operations.available === 0) return { state, error: 'Recall a rover before assigning another route.' }
  return {
    error: '',
    state: {
      ...state,
      roverAssignments: { ...operations.assignments, [routeId]: current + delta },
    },
  }
}

export function updateCrossTraining(state, role) {
  if (!CROSS_TRAINING_ROLES.includes(role)) return { state, error: 'Select a valid cross-training focus.' }
  return { error: '', state: { ...state, crossTraining: role } }
}

export function applySponsorEventChoice(state, choiceId) {
  const event = sponsorEventById(state.pendingEventId)
  if (!event || event.sponsorId !== state.sponsorId) return { state, error: 'No sponsor decision is pending.' }
  const choice = event.choices.find((item) => item.id === choiceId)
  if (!choice) return { state, error: 'Select a valid command option.' }
  const stats = colonyStats(state)
  const resources = { ...state.resources }
  Object.entries(choice.effects).forEach(([key, value]) => {
    resources[key] = round((resources[key] ?? 0) + value)
  })
  resources.water = clamp(resources.water, 0, stats.waterCapacity)
  resources.oxygen = clamp(resources.oxygen, 0, stats.oxygenCapacity)
  resources.food = clamp(resources.food, 0, 1000)
  resources.parts = clamp(resources.parts, 0, 999)
  resources.cargo = clamp(resources.cargo, 0, 99)
  resources.confidence = clamp(resources.confidence, 0, 100)
  return {
    error: '',
    state: {
      ...state,
      pendingEventId: null,
      resolvedEventIds: [...(state.resolvedEventIds ?? []), event.id],
      resources,
      decisionLog: [...(state.decisionLog ?? []), { sol: state.sol, category: 'Sponsor directive', title: event.title, choice: choice.title }],
      speed: 0,
      log: [{ sol: state.sol, tone: 'warning', message: choice.consequence }, ...state.log].slice(0, 12),
    },
  }
}

export function applyRivalEncounterChoice(state, choiceId) {
  const encounter = rivalEncounterById(state.pendingRivalEncounterId)
  const rival = rivalSettlementFor(state.sponsorId)
  if (!encounter || !rival || rival.encounter.id !== encounter.id) return { state, error: 'No rival-settlement decision is pending.' }
  const choice = encounter.choices.find((item) => item.id === choiceId)
  if (!choice) return { state, error: 'Select a valid Mars policy.' }
  const stats = colonyStats(state)
  const resources = { ...state.resources }
  Object.entries(choice.effects).forEach(([key, value]) => {
    resources[key] = round((resources[key] ?? 0) + value)
  })
  resources.water = clamp(resources.water, 0, stats.waterCapacity)
  resources.oxygen = clamp(resources.oxygen, 0, stats.oxygenCapacity)
  resources.food = clamp(resources.food, 0, 1000)
  resources.parts = clamp(resources.parts, 0, 999)
  resources.cargo = clamp(resources.cargo, 0, 99)
  resources.confidence = clamp(resources.confidence, 0, 100)
  return {
    error: '',
    state: {
      ...state,
      pendingRivalEncounterId: null,
      resolvedRivalEncounterIds: [...(state.resolvedRivalEncounterIds ?? []), encounter.id],
      rivalRelations: clamp((state.rivalRelations ?? rival.startingRelations) + choice.relations, 0, 100),
      strategicPosition: clamp((state.strategicPosition ?? rival.startingPosition) + choice.position, 0, 100),
      resources,
      decisionLog: [...(state.decisionLog ?? []), { sol: state.sol, category: 'Mars relations', title: encounter.title, choice: choice.title }],
      speed: 0,
      log: [{ sol: state.sol, tone: choice.relations >= 0 ? 'success' : 'warning', message: choice.consequence }, ...state.log].slice(0, 12),
    },
  }
}

export function applyOperationalIncidentChoice(state, choiceId) {
  const incident = operationalIncidentById(state.pendingOperationalIncidentId)
  const choice = incident?.choices.find((item) => item.id === choiceId)
  if (!incident || !choice) return { state, error: 'Select a valid settlement response.' }
  const stats = colonyStats(state)
  const resources = { ...state.resources }
  Object.entries(choice.effects ?? {}).forEach(([key, value]) => { resources[key] = round((resources[key] ?? 0) + value) })
  resources.water = clamp(resources.water, 0, stats.waterCapacity)
  resources.oxygen = clamp(resources.oxygen, 0, stats.oxygenCapacity)
  resources.food = clamp(resources.food, 0, 1000)
  resources.parts = clamp(resources.parts, 0, 999)
  resources.cargo = clamp(resources.cargo, 0, 99)
  resources.confidence = clamp(resources.confidence, 0, 100)
  resources.integrity = clamp(resources.integrity, 0, 100)
  let buildings = state.buildings
  if (choice.damageType && choice.damage) {
    const target = buildings.find((building) => building.type === choice.damageType && building.integrity > 0)
    if (target) buildings = buildings.map((building) => building.uid === target.uid ? { ...building, integrity: clamp(building.integrity - choice.damage, 0, 100) } : building)
  }
  return {
    error: '',
    state: {
      ...state,
      pendingOperationalIncidentId: null,
      resolvedOperationalIncidentIds: [...(state.resolvedOperationalIncidentIds ?? []), incident.id],
      resources,
      sciencePoints: (state.sciencePoints ?? 0) + (choice.science ?? 0),
      batteryCharge: Math.max(0, (state.batteryCharge ?? 0) + (choice.batteryCharge ?? 0)),
      crewMembers: applyCrewEffects(ensureCrewMembers(state), choice.crewEffects),
      buildings,
      speed: 0,
      decisionLog: [...(state.decisionLog ?? []), { sol: state.sol, category: 'Operational incident', title: incident.title, choice: choice.title }],
      log: [{ sol: state.sol, tone: 'warning', message: choice.consequence }, ...state.log].slice(0, 12),
    },
  }
}

export function applyManifest(state, manifestId) {
  if (state.manifestId) return { state, error: 'A transfer manifest is already committed.' }
  if (!state.sponsorId) return { state, error: 'Choose a founding mission first.' }
  const manifest = manifestById(manifestId)
  if (!manifest || manifest.id === LEGACY_MANIFEST.id) return { state, error: 'Select a valid transfer manifest.' }
  if (manifest.sponsorId !== state.sponsorId) return { state, error: 'That payload doctrine belongs to another founding sponsor.' }

  const resources = { ...state.resources }
  Object.entries(manifest.effects).forEach(([key, value]) => {
    resources[key] = round((resources[key] ?? 0) + value)
  })
  const roverAssignments = { ...state.roverAssignments }
  Object.entries(manifest.roverAssignments ?? {}).forEach(([routeId, delta]) => {
    roverAssignments[routeId] = (roverAssignments[routeId] ?? 0) + delta
  })

  return {
    error: '',
    state: {
      ...state,
      manifestId: manifest.id,
      manifestDoctrine: manifest.doctrine,
      buildDiscounts: manifest.discounts ?? {},
      roverFleet: state.roverFleet + (manifest.rovers ?? 0),
      roverAssignments,
      resources,
      decisionLog: [...(state.decisionLog ?? []), { sol: state.sol, category: 'Founding manifest', title: manifest.title, choice: manifest.doctrine }],
      log: [{ sol: state.sol, tone: 'success', message: manifest.consequence }, ...state.log].slice(0, 12),
    },
  }
}

function mergeDiscounts(current, incoming) {
  const merged = { ...(current ?? {}) }
  Object.entries(incoming ?? {}).forEach(([type, discount]) => {
    merged[type] = {
      parts: Math.max(merged[type]?.parts ?? 0, discount.parts ?? 0),
      cargo: Math.max(merged[type]?.cargo ?? 0, discount.cargo ?? 0),
    }
  })
  return merged
}

export function followOnEligibility(state, manifestId) {
  const manifest = followOnManifestById(manifestId)
  if (!manifest) return { eligible: false, reason: 'Unknown follow-on manifest.' }
  if (manifest.sponsorId !== state.sponsorId) return { eligible: false, reason: 'That package belongs to another founding sponsor.' }
  if (!state.transferWindowPending) return { eligible: false, reason: 'The second transfer window is not open.' }
  if (state.resources.confidence < manifest.threshold) {
    return { eligible: false, reason: `Requires ${manifest.threshold}% sponsor confidence.` }
  }
  return { eligible: true, reason: `Authorized by ${state.transferAuthority}.` }
}

export function applyFollowOnManifest(state, manifestId) {
  if (state.secondManifestId) return { state, error: 'A follow-on manifest is already committed.' }
  const manifest = followOnManifestById(manifestId)
  const eligibility = followOnEligibility(state, manifestId)
  if (!manifest || !eligibility.eligible) return { state, error: eligibility.reason }

  const stats = colonyStats(state)
  const resources = { ...state.resources }
  Object.entries(manifest.effects).forEach(([key, value]) => {
    resources[key] = round((resources[key] ?? 0) + value)
  })
  resources.water = clamp(resources.water, 0, stats.waterCapacity)
  resources.oxygen = clamp(resources.oxygen, 0, stats.oxygenCapacity)
  resources.food = clamp(resources.food, 0, 1000)
  resources.parts = clamp(resources.parts, 0, 999)
  resources.confidence = clamp(resources.confidence, 0, 100)

  const nextCrewCount = state.crew + manifest.crew
  const expandedCrew = ensureCrewMembers({ ...state, crew: nextCrewCount })
  return {
    error: '',
    state: {
      ...state,
      phase: 'expansion',
      transferWindowPending: false,
      secondManifestId: manifest.id,
      secondManifestDoctrine: manifest.doctrine,
      crew: nextCrewCount,
      crewMembers: expandedCrew,
      crewCohorts: mergeCohorts(state.crewCohorts, manifest.cohorts),
      crossTraining: manifest.crossTraining ?? state.crossTraining,
      roverFleet: (state.roverFleet ?? 2) + (manifest.rovers ?? 0),
      buildDiscounts: mergeDiscounts(state.buildDiscounts, manifest.discounts),
      resources,
      decisionLog: [...(state.decisionLog ?? []), { sol: state.sol, category: 'Second transfer', title: manifest.title, choice: manifest.doctrine }],
      log: [{ sol: state.sol, tone: 'success', message: manifest.consequence }, ...state.log].slice(0, 12),
    },
  }
}

export function colonyProfile(state) {
  const types = state.buildings.map((building) => building.type)
  const solarCount = types.filter((type) => type === 'solar').length
  const storageCount = types.filter((type) => type === 'storage').length
  const followOnProfile = followOnManifestById(state.secondManifestId)?.profile
  if (followOnProfile) return followOnProfile
  if (types.includes('workshop') && types.includes('nuclear')) return 'Industrial Vanguard'
  if (storageCount >= 2 && types.includes('ice') && types.includes('oxygen')) return 'Resilient Habitat'
  if (!types.includes('nuclear') && solarCount >= 4) return 'Solar Autonomy'
  return manifestById(state.manifestId)?.profile ?? 'Uncommitted Outpost'
}

export function canPlaceBuilding(state, type, col, row) {
  const building = BUILDINGS[type]
  if (!state.manifestId) return { ok: false, reason: 'Authorize a sponsor transfer manifest first.' }
  if (state.transferWindowPending) return { ok: false, reason: 'Resolve the second sponsor transfer window first.' }
  if (state.pendingEventId) return { ok: false, reason: 'Resolve the command decision first.' }
  if (state.pendingRivalEncounterId) return { ok: false, reason: 'Set Mars policy before resuming construction.' }
  if (state.pendingOperationalIncidentId) return { ok: false, reason: 'Resolve the active settlement incident first.' }
  if (!building?.buildable) return { ok: false, reason: 'This structure cannot be constructed.' }
  if (state.outcome) return { ok: false, reason: 'The mission has concluded.' }
  if (col < 0 || col > 8 || row < 0 || row > 5) return { ok: false, reason: 'Select a surveyed construction cell.' }
  if (state.buildings.some((placed) => placed.col === col && placed.row === row)) return { ok: false, reason: 'That construction cell is occupied.' }
  if (!terrainSupportsBuilding(state, type, col, row)) {
    return { ok: false, reason: type === 'ice' ? 'Ice extraction rigs require a rover-confirmed ice lens.' : 'That cell is reserved as an orbital survey prospect.' }
  }
  const network = buildUtilityNetwork(state.buildings)
  if (!cellWithinUtilityReach(state.buildings, network, col, row)) {
    return { ok: false, reason: 'Outside utility-grid reach. Build within two cells of an online structure.' }
  }
  const cost = buildingCost(state, type)
  if (state.resources.parts < cost.parts) return { ok: false, reason: `Requires ${cost.parts} parts.` }
  if (state.resources.cargo < cost.cargo) return { ok: false, reason: `Requires ${cost.cargo} t imported cargo.` }
  return { ok: true, reason: '' }
}

export function placeBuilding(state, type, col, row) {
  const availability = canPlaceBuilding(state, type, col, row)
  if (!availability.ok) return { state, error: availability.reason }
  const definition = BUILDINGS[type]
  const cost = buildingCost(state, type)
  const uid = `${type}-${state.sol}-${state.buildings.length + 1}`
  return {
    error: '',
    state: {
      ...state,
      resources: {
        ...state.resources,
        parts: round(state.resources.parts - cost.parts),
        cargo: round(state.resources.cargo - cost.cargo),
      },
      buildings: [...state.buildings, { uid, type, col, row, integrity: 100 }],
      selectedUid: uid,
      buildMode: null,
      log: [{ sol: state.sol, tone: 'success', message: `${definition.name} linked to the utility grid at Grid ${col + 1}-${row + 1}.` }, ...state.log].slice(0, 12),
    },
  }
}

export function advanceSol(state) {
  if (state.outcome || !state.manifestId || state.transferWindowPending || state.pendingEventId || state.pendingRivalEncounterId || state.pendingOperationalIncidentId) return state
  const stats = colonyStats(state)
  const nextSol = state.sol + 1
  const next = {
    ...state,
    sol: nextSol,
    resources: {
      ...state.resources,
      water: clamp(round(state.resources.water + stats.waterNet), 0, stats.waterCapacity),
      oxygen: clamp(round(state.resources.oxygen + stats.oxygenNet), 0, stats.oxygenCapacity),
      food: clamp(round(state.resources.food + stats.foodNet), 0, 1000),
      parts: clamp(round(state.resources.parts + stats.partsNet), 0, 999),
      confidence: state.resources.confidence,
      integrity: state.resources.integrity,
    },
    log: [...state.log],
  }

  const storedPower = state.batteryCharge ?? 0
  if (stats.basePowerCapacity >= stats.powerDemand) {
    const surplus = stats.basePowerCapacity - stats.powerDemand
    next.batteryCharge = clamp(round(storedPower + Math.min(surplus, stats.batteryChargeRate)), 0, stats.batteryCapacity)
  } else {
    next.batteryCharge = clamp(round(storedPower - stats.batteryDispatch), 0, stats.batteryCapacity)
  }

  const surveyRovers = roverOperations(state).surveyEffort
  const surveyEffort = surveyRovers > 0 ? surveyRovers + (crewLead(state)?.trait === 'science' ? 1 : 0) : 0
  const survey = advanceSiteSurvey(state, surveyEffort)
  next.siteSurveyProgress = survey.progress
  next.surveyedFeatureIds = survey.surveyedFeatureIds
  if (survey.discoveries.length) {
    const scienceGain = survey.discoveries.reduce((total, feature) => total + feature.science, 0)
    next.sciencePoints = (state.sciencePoints ?? 0) + scienceGain
    survey.discoveries.forEach((feature) => {
      next.log = [{ sol: nextSol, tone: 'success', message: `${feature.title} confirmed: ${feature.purity}-purity ice, projected yield ${feature.yield} L per sol.` }, ...next.log].slice(0, 12)
      next.decisionLog = [...(next.decisionLog ?? []), { sol: nextSol, category: 'Science', title: 'Ground survey discovery', choice: feature.title }]
    })
  }

  if (stats.powerRatio < 1) {
    const shortage = Math.max(1, (stats.powerDemand - stats.powerCapacity) * 0.22)
    next.resources.integrity = clamp(round(next.resources.integrity - shortage), 0, 100)
    next.resources.confidence = clamp(round(next.resources.confidence - 1.5), 0, 100)
  }

  if (!state.buildings.some((building) => building.type === 'habitat') && nextSol > 5) {
    next.resources.confidence = clamp(round(next.resources.confidence - 1), 0, 100)
  }

  const depleted = ['water', 'oxygen', 'food'].some((key) => next.resources[key] <= 0)
  if (depleted) {
    next.resources.integrity = clamp(round(next.resources.integrity - 8), 0, 100)
    next.resources.confidence = clamp(round(next.resources.confidence - 3), 0, 100)
  }

  next.crewMembers = advanceCrewStatus(next, stats, depleted)
  if (crewLead(next)?.trait === 'command' && next.resources.confidence < state.resources.confidence) {
    next.resources.confidence = clamp(round(next.resources.confidence + 0.5), 0, 100)
  }

  if (state.phase === 'expansion' && next.resources.parts <= 0) {
    next.resources.integrity = clamp(round(next.resources.integrity - 3), 0, 100)
    next.resources.confidence = clamp(round(next.resources.confidence - 1), 0, 100)
  }

  if (state.phase === 'expansion' && stats.crewCapacity < state.crew) {
    next.resources.integrity = clamp(round(next.resources.integrity - 1.5), 0, 100)
    next.resources.confidence = clamp(round(next.resources.confidence - 1), 0, 100)
  }

  if (stats.labor.ratios.support < 1) {
    const supportShortage = 1 - stats.labor.ratios.support
    next.resources.integrity = clamp(round(next.resources.integrity - supportShortage), 0, 100)
    next.resources.confidence = clamp(round(next.resources.confidence - (supportShortage * 1.5)), 0, 100)
  }

  if (nextSol === 18) {
    next.log = [{ sol: nextSol, tone: 'danger', message: `The dust front has reached ${state.settlementName}. Solar output has collapsed.` }, ...next.log].slice(0, 12)
    const maintenanceRovers = roverOperations(state).assignments.maintenance
    const abrasion = Math.max(4, Math.round((12 * siteForSponsor(state.sponsorId).dustSeverity) - (maintenanceRovers * 4)))
    const solarCount = next.buildings.filter((building) => building.type === 'solar' && building.integrity > 0).length
    if (solarCount) {
      next.buildings = next.buildings.map((building) => building.type === 'solar' ? { ...building, integrity: clamp(round(building.integrity - abrasion), 0, 100) } : building)
      next.log = [{ sol: nextSol, tone: 'warning', message: `Dust abrasion reduced integrity across ${solarCount} solar array${solarCount === 1 ? '' : 's'} by ${abrasion} points.` }, ...next.log].slice(0, 12)
    }
  }
  if (nextSol === 22 && next.resources.integrity > 0) {
    next.stormSurvived = true
    next.resources.confidence = clamp(round(next.resources.confidence + 6), 0, 100)
    next.log = [{ sol: nextSol, tone: 'success', message: 'The dust front has passed. The colony remained pressurized and powered.' }, ...next.log].slice(0, 12)
  }
  if (nextSol === 34 && state.phase === 'expansion') {
    next.log = [{ sol: nextSol, tone: 'danger', message: `A micrometeoroid front is crossing ${state.siteName.split(' · ')[0]}. Inspection cycles and replacement-parts demand have surged.` }, ...next.log].slice(0, 12)
    const candidates = next.buildings.filter((building) => BUILDINGS[building.type]?.buildable && building.integrity > 0)
    if (candidates.length) {
      const target = candidates[(SPONSOR_DAMAGE_OFFSET[state.sponsorId] ?? 0) % candidates.length]
      const maintenanceRovers = roverOperations(state).assignments.maintenance
      const impact = Math.max(12, 28 - (maintenanceRovers * 8))
      next.buildings = next.buildings.map((building) => building.uid === target.uid ? { ...building, integrity: clamp(round(building.integrity - impact), 0, 100) } : building)
      next.selectedUid = target.uid
      next.log = [{ sol: nextSol, tone: 'danger', message: `${BUILDINGS[target.type].name} took a debris strike and lost ${impact} integrity. Repair crews are awaiting parts authorization.` }, ...next.log].slice(0, 12)
    }
  }
  if (nextSol === 37 && state.phase === 'expansion' && next.resources.integrity > 0) {
    next.debrisSurvived = true
    next.resources.confidence = clamp(round(next.resources.confidence + 3), 0, 100)
    next.log = [{ sol: nextSol, tone: 'success', message: 'The debris front has passed. Local maintenance teams kept every pressure system operational.' }, ...next.log].slice(0, 12)
  }

  const sponsorEvent = sponsorEventAt(state.sponsorId, nextSol, state.phase, state.resolvedEventIds)
  if (sponsorEvent) {
    next.pendingEventId = sponsorEvent.id
    next.speed = 0
    next.log = [{ sol: nextSol, tone: 'danger', message: `${sponsorEvent.authority} requires an immediate command decision: ${sponsorEvent.title}.` }, ...next.log].slice(0, 12)
  }

  const rivalEncounter = rivalEncounterAt(state.sponsorId, nextSol, state.phase, state.resolvedRivalEncounterIds)
  if (rivalEncounter) {
    next.pendingRivalEncounterId = rivalEncounter.id
    next.speed = 0
    next.log = [{ sol: nextSol, tone: 'warning', message: `${rivalEncounter.authority} requires a settlement policy: ${rivalEncounter.title}.` }, ...next.log].slice(0, 12)
  }

  if (!next.pendingEventId && !next.pendingRivalEncounterId) {
    const operationalIncident = operationalIncidentAt(next, nextSol)
    if (operationalIncident) {
      next.pendingOperationalIncidentId = operationalIncident.id
      next.speed = 0
      next.log = [{ sol: nextSol, tone: 'danger', message: `${operationalIncident.system} reports an immediate incident: ${operationalIncident.title}.` }, ...next.log].slice(0, 12)
    }
  }

  if (next.resources.integrity <= 0) {
    next.outcome = 'failure'
    next.speed = 0
  } else if (nextSol >= 24 && state.phase === 'survival') {
    const complete = missionObjectives(next).every((objective) => objective.complete)
    if (complete && !depleted) {
      next.phase = 'review'
      next.phaseOneCompleted = true
      next.transferWindowPending = true
      next.log = [{ sol: nextSol, tone: 'success', message: `The Sol 24 review confirms ${state.settlementName} as a viable city site. ${state.transferAuthority} has opened a second transfer window.` }, ...next.log].slice(0, 12)
    } else {
      next.outcome = 'dependent-outpost'
    }
    next.speed = 0
  } else if (nextSol >= 42 && state.phase === 'expansion') {
    const complete = missionObjectives(next).every((objective) => objective.complete)
    next.outcome = complete && next.resources.integrity >= 70 ? 'permanent-city' : 'fragile-city'
    next.speed = 0
  }

  return next
}

export function serializeState(state) {
  return JSON.stringify(state)
}

export function restoreState(value) {
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed?.buildings)) return null
    const legacySponsor = sponsorById('american-compact')
    const legacySponsorFields = {
      sponsorId: legacySponsor.id,
      sponsor: legacySponsor.name,
      earthYear: parsed.earthYear ?? legacySponsor.earthYear,
      settlementName: legacySponsor.settlementName,
      siteName: legacySponsor.siteName,
      transferAuthority: legacySponsor.transferAuthority,
    }
    const eventFields = { pendingEventId: null, resolvedEventIds: [] }
    const legacyRival = rivalSettlementFor(parsed.sponsorId ?? legacySponsor.id)
    const rivalFields = {
      rivalSettlementId: legacyRival?.id ?? null,
      rivalRelations: legacyRival?.startingRelations ?? 50,
      strategicPosition: legacyRival?.startingPosition ?? 50,
      pendingRivalEncounterId: null,
      resolvedRivalEncounterIds: [],
    }
    const upgradeToV9 = (candidate) => {
      const base = {
        siteSurveyProgress: 0,
        surveyedFeatureIds: [],
        sciencePoints: 0,
        batteryCharge: 0,
        pendingOperationalIncidentId: null,
        resolvedOperationalIncidentIds: [],
        decisionLog: [],
        ...candidate,
        version: 9,
        roverAssignments: { ...DEFAULT_ROVER_ASSIGNMENTS, ...(candidate.roverAssignments ?? {}) },
      }
      const crewMembers = ensureCrewMembers(base)
      return {
        ...base,
        crewMembers,
        crewLeadId: crewMembers.some((member) => member.id === base.crewLeadId) ? base.crewLeadId : crewMembers[0]?.id ?? null,
      }
    }
    if (parsed.version === 9) return upgradeToV9(parsed)
    if (parsed.version === 8) return upgradeToV9(parsed)
    if (parsed.version === 7) return upgradeToV9({ ...parsed, ...rivalFields })
    if (parsed.version === 6) return upgradeToV9({ ...parsed, ...eventFields, ...rivalFields })
    if (parsed.version === 5) {
      return upgradeToV9({ ...parsed, ...legacySponsorFields, ...eventFields, ...rivalFields })
    }
    if (parsed.version === 4) {
      return upgradeToV9({
        ...parsed,
        ...legacySponsorFields,
        ...eventFields,
        ...rivalFields,
        crewCohorts: inferLegacyCohorts(parsed),
        crossTraining: 'engineering',
      })
    }
    if (parsed.version === 3) {
      return upgradeToV9({
        ...parsed,
        ...legacySponsorFields,
        ...eventFields,
        ...rivalFields,
        roverFleet: 2,
        roverAssignments: { ...DEFAULT_ROVER_ASSIGNMENTS },
        crewCohorts: inferLegacyCohorts(parsed),
        crossTraining: 'engineering',
      })
    }
    if (parsed.version === 2) {
      return upgradeToV9({
        ...parsed,
        ...legacySponsorFields,
        ...eventFields,
        ...rivalFields,
        phase: 'survival',
        phaseOneCompleted: parsed.outcome === 'first-city',
        transferWindowPending: false,
        secondManifestId: null,
        secondManifestDoctrine: null,
        debrisSurvived: false,
        buildDiscounts: parsed.buildDiscounts ?? {},
        roverFleet: 2,
        roverAssignments: { ...DEFAULT_ROVER_ASSIGNMENTS },
        crewCohorts: { ...DEFAULT_CREW_COHORTS },
        crossTraining: 'engineering',
      })
    }
    if (parsed.version === 1) {
      return upgradeToV9({
        ...parsed,
        ...legacySponsorFields,
        ...eventFields,
        ...rivalFields,
        manifestId: LEGACY_MANIFEST.id,
        manifestDoctrine: LEGACY_MANIFEST.doctrine,
        buildDiscounts: {},
        phase: 'survival',
        phaseOneCompleted: parsed.outcome === 'first-city',
        transferWindowPending: false,
        secondManifestId: null,
        secondManifestDoctrine: null,
        debrisSurvived: false,
        roverFleet: 2,
        roverAssignments: { ...DEFAULT_ROVER_ASSIGNMENTS },
        crewCohorts: { ...DEFAULT_CREW_COHORTS },
        crossTraining: 'engineering',
      })
    }
    return null
  } catch {
    return null
  }
}
