import { Orbit, Wrench } from 'lucide-react'
import { BUILDINGS } from '../game/buildings.js'
import { rivalSettlementFor } from '../game/rivalSettlements.js'
import { iceDepositAt, siteForSponsor, solarRidgeAt } from '../game/siteFeatures.js'
import { buildingEfficiency, buildingRepairCost } from '../game/simulation.js'

function Stat({ label, value }) {
  return <div className="inspector-stat"><span>{label}</span><strong>{value}</strong></div>
}

function relationsLabel(value) {
  if (value >= 70) return 'Trusted'
  if (value >= 55) return 'Open'
  if (value >= 40) return 'Guarded'
  return 'Hostile'
}

function positionLabel(value) {
  if (value >= 70) return 'Leading'
  if (value >= 55) return 'Advantaged'
  if (value >= 40) return 'Balanced'
  return 'Trailing'
}

export default function Inspector({ state, stats, onRepair }) {
  const selected = state.buildings.find((building) => building.uid === state.selectedUid) ?? state.buildings[0]
  const definition = selected ? BUILDINGS[selected.type] : null
  const connected = selected ? stats.network.connectedUids.includes(selected.uid) : false
  const iceDeposit = selected?.type === 'ice' ? iceDepositAt(state, selected.col, selected.row) : null
  const solarRidge = selected?.type === 'solar' ? solarRidgeAt(state, selected.col, selected.row) : null
  const efficiency = buildingEfficiency(selected?.integrity)
  const dustFactor = Math.max(0.18, Math.min(0.38, 0.28 / siteForSponsor(state.sponsorId).dustSeverity))
  const powerOutput = definition?.power ? Math.round(definition.power * efficiency * (solarRidge?.multiplier ?? 1) * (stats.storm && selected?.type === 'solar' ? dustFactor : 1)) : null
  const rival = rivalSettlementFor(state.sponsorId)
  const repairCost = selected ? buildingRepairCost(state, selected.uid) : 0

  return (
    <aside className="inspector-rail">
      <section className="building-inspector">
        <p>{definition?.category ?? 'mission system'}</p>
        <h2>{definition?.name ?? 'No structure selected'}</h2>
        <span className={`status-line ${connected ? '' : 'offline'}`}><i /> {connected ? selected?.integrity < 100 ? 'Grid linked - degraded' : 'Utility grid linked' : 'Isolated - offline'}</span>
        <div className="inspector-stats">
          <Stat label="Integrity" value={`${selected?.integrity ?? 0}%`} />
          {selected?.integrity < 100 ? <Stat label="Efficiency" value={`${Math.round(efficiency * 100)}%`} /> : null}
          {definition?.power ? <Stat label="Output" value={`${powerOutput} kW`} /> : null}
          {definition?.powerUse ? <Stat label="Demand" value={`${definition.powerUse} kW`} /> : null}
          {definition?.water && !iceDeposit ? <Stat label="Water" value={`+${definition.water}/sol`} /> : null}
          {iceDeposit ? <Stat label="Field yield" value={`+${iceDeposit.yield}/sol`} /> : null}
          {iceDeposit || solarRidge ? <Stat label="Survey site" value={(iceDeposit ?? solarRidge).title} /> : null}
          {definition?.oxygen ? <Stat label="Oxygen" value={`+${definition.oxygen}/sol`} /> : null}
          {definition?.parts ? <Stat label="Parts" value={`+${definition.parts}/sol`} /> : null}
          {definition?.food ? <Stat label="Food" value={`+${definition.food}/sol`} /> : null}
          {definition?.waterRecovery ? <Stat label="Water recovery" value={`${Math.round(definition.waterRecovery * 100)}%`} /> : null}
          {definition?.batteryCapacity ? <Stat label="Storage" value={`${definition.batteryCapacity} kWh`} /> : null}
          {definition?.crewCapacity ? <Stat label="Crew" value={`${state.crew}/${definition.crewCapacity}`} /> : null}
        </div>
        <p className="building-description">{definition?.description}</p>
        {selected?.integrity < 100 ? (
          <button className="repair-command" disabled={state.resources.parts < repairCost} onClick={() => onRepair(selected.uid)} title={`Restore ${definition.name} to full integrity`}>
            <Wrench aria-hidden="true" /><span>Repair structure</span><strong>{repairCost} parts</strong>
          </button>
        ) : null}
      </section>
      <section className="mission-log">
        <h2>Mission Log</h2>
        <div>
          {state.log.slice(0, 6).map((entry, index) => (
            <article className={`log-${entry.tone}`} key={`${entry.sol}-${index}`}>
              <time>Sol {String(entry.sol).padStart(3, '0')}</time>
              <p>{entry.message}</p>
            </article>
          ))}
        </div>
      </section>
      {state.phase === 'expansion' && rival ? (
        <section className="rival-status" aria-label={`Strategic relationship with ${rival.name}`}>
          <header><Orbit aria-hidden="true" /><span><small>Mars network</small><strong>{rival.name}</strong></span></header>
          <p>{rival.sponsor} · {rival.site}</p>
          <div className="rival-meter-row"><span>Relations</span><strong>{relationsLabel(state.rivalRelations)}</strong><div className="rival-meter"><i style={{ width: `${state.rivalRelations}%` }} /></div></div>
          <div className="rival-meter-row position"><span>Position</span><strong>{positionLabel(state.strategicPosition)}</strong><div className="rival-meter"><i style={{ width: `${state.strategicPosition}%` }} /></div></div>
        </section>
      ) : null}
      <section className="power-balance">
        <div><span>Power reserve</span><strong>{Math.round(stats.powerCapacity - stats.powerDemand)} kW</strong></div>
        <div><span>Utility network</span><strong>{stats.network.online}/{stats.network.total} online</strong></div>
        {stats.batteryCapacity > 0 ? <div><span>Battery reserve</span><strong>{Math.round(state.batteryCharge ?? 0)}/{Math.round(stats.batteryCapacity)} kWh</strong></div> : null}
      </section>
    </aside>
  )
}
