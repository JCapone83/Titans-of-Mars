import { Factory, HeartPulse, Radiation } from 'lucide-react'
import { manifestsForSponsor } from '../game/manifests.js'

const ICONS = { power: Radiation, life: HeartPulse, industry: Factory }

export default function ManifestCouncil({ state, onSelect }) {
  const manifests = manifestsForSponsor(state.sponsorId)
  return (
    <div className="manifest-backdrop">
      <section className="manifest-council" role="dialog" aria-modal="true" aria-labelledby="manifest-title">
        <header>
          <p>{state.transferAuthority} · {state.earthYear}</p>
          <h1 id="manifest-title">Choose the First Transfer Manifest</h1>
          <span>One launch window. Three competing definitions of what the first city needs most.</span>
        </header>
        <div className="manifest-grid">
          {manifests.map((manifest) => {
            const id = manifest.id
            const Icon = ICONS[manifest.icon]
            return (
              <button type="button" className="manifest-option" key={id} onClick={() => onSelect(id)} aria-label={`Commit ${manifest.title}`}>
                <div className="manifest-proposer"><Icon aria-hidden="true" /><span><small>Proposed by</small><strong>{manifest.proposer}</strong></span></div>
                <h2>{manifest.title}</h2>
                <p>{manifest.thesis}</p>
                <div className="manifest-allocation">
                  {manifest.allocations.map(([label, value]) => <span key={label}><small>{label}</small><strong>{value}</strong></span>)}
                </div>
                <dl>
                  <div><dt>Strength</dt><dd>{manifest.strength}</dd></div>
                  <div><dt>Risk</dt><dd>{manifest.risk}</dd></div>
                </dl>
                <span className="manifest-command">Commit manifest</span>
              </button>
            )
          })}
        </div>
        <footer>Payload allocation is permanent for this campaign. Surface construction begins after authorization.</footer>
      </section>
    </div>
  )
}
