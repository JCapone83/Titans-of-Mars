import { Check, Circle, CloudLightning, RadioTower } from 'lucide-react'
import { followOnManifestById } from '../game/followOnManifests.js'
import { manifestById } from '../game/manifests.js'

export default function MissionRail({ state, objectives }) {
  const manifest = manifestById(state.manifestId)
  const followOnManifest = followOnManifestById(state.secondManifestId)
  const expansion = state.phase === 'expansion'
  const untilStorm = 18 - state.sol
  const dustStatus = state.sol < 18
    ? `Dust front in ${untilStorm} sol${untilStorm === 1 ? '' : 's'}`
    : state.sol <= 21 ? 'Dust front overhead' : 'Dust front passed'
  const debrisStatus = state.sol < 34
    ? `Debris front in ${34 - state.sol} sols`
    : state.sol <= 36 ? 'Debris front overhead' : 'Debris front passed'
  const hazardStatus = expansion ? debrisStatus : dustStatus
  const hazardActive = expansion ? state.sol >= 34 && state.sol <= 36 : state.sol >= 18 && state.sol <= 21
  const reviewStatus = state.pendingEventId
    ? 'Command decision required'
    : state.pendingRivalEncounterId
    ? 'Mars policy decision required'
    : state.pendingOperationalIncidentId
    ? 'Settlement incident decision required'
    : state.transferWindowPending
    ? 'Sponsor review pending'
    : expansion ? `Sol 42 audit in ${Math.max(0, 42 - state.sol)} sols` : `Sol 24 review in ${Math.max(0, 24 - state.sol)} sols`
  const objectiveBrief = expansion
    ? 'Turn the landing site into a maintainable permanent city before the Sol 42 review.'
    : `Turn ${state.settlementName} into a settlement that can endure when Earth cannot intervene.`

  return (
    <aside className="mission-rail">
      <div className={`hazard-callout ${hazardActive ? 'active' : ''}`}>
        <CloudLightning aria-hidden="true" />
        <span><small>{expansion ? 'Orbital debris watch' : 'Orbital weather'}</small><strong>{hazardStatus}</strong></span>
      </div>
      <div className="window-callout">
        <RadioTower aria-hidden="true" />
        <span><small>Transfer authority</small><strong>{reviewStatus}</strong></span>
      </div>
      <section className="objective-panel">
        <h2>Mission Objectives</h2>
        <p><strong>{state.earthYear ?? 2033} · {state.sponsor}</strong><em>{followOnManifest?.title ?? manifest?.title ?? 'Manifest awaiting authorization'}</em>{objectiveBrief}</p>
        <div className="objective-list">
          {objectives.map((objective) => (
            <div className={objective.complete ? 'complete' : ''} key={objective.id}>
              {objective.complete ? <Check aria-hidden="true" /> : <Circle aria-hidden="true" />}
              <span>{objective.label}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="integrity-panel">
        <div><span>Colony integrity</span><strong>{Math.round(state.resources.integrity)}%</strong></div>
        <div className="meter"><i style={{ width: `${state.resources.integrity}%` }} /></div>
        <small>Power loss and depleted life support damage the entire settlement.</small>
      </section>
    </aside>
  )
}
