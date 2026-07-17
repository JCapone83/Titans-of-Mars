import { BriefcaseBusiness, Crosshair, HeartPulse, Minus, Users, Wrench, X } from 'lucide-react'
import { CROSS_TRAINING_ROLES, crewLabor } from '../game/crewLabor.js'
import { ensureCrewMembers, TRAIT_LABELS } from '../game/crewMembers.js'

const COHORTS = [
  { id: 'engineering', title: 'Systems Engineers', icon: Wrench, effect: 'Reactor, workshop, and grid maintenance' },
  { id: 'operations', title: 'Surface Operators', icon: Crosshair, effect: 'Water, oxygen, and manufacturing throughput' },
  { id: 'support', title: 'Science & Medical', icon: HeartPulse, effect: 'Crew health, research, and civic continuity' },
  { id: 'residents', title: 'Residents', icon: Users, effect: 'Population without a dedicated technical billet' },
]

const FOCUS_LABELS = { engineering: 'Engineering', operations: 'Surface Ops', support: 'Medical & Civic' }

export default function CrewRoster({ state, stats, onTraining, onLead, onClose }) {
  const labor = crewLabor(state, stats.network.connectedUids)
  const members = ensureCrewMembers(state)

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="crew-roster" role="dialog" aria-modal="true" aria-labelledby="crew-title">
        <button className="modal-close" onClick={onClose} title="Close crew roster" aria-label="Close crew roster"><X /></button>
        <header>
          <BriefcaseBusiness aria-hidden="true" />
          <div><p>Settlement Labor Office</p><h1 id="crew-title">Crew Roster</h1></div>
          <span className={labor.fullyStaffed ? 'ready' : 'strained'}><strong>{state.crew}</strong>{labor.fullyStaffed ? 'fully staffed' : 'labor constrained'}</span>
        </header>
        <div className="cohort-grid">
          {COHORTS.map(({ id, title, icon: Icon, effect }) => {
            const demand = labor.demand[id]
            const available = labor.available[id] ?? labor.cohorts[id]
            const ratio = labor.ratios[id]
            return (
              <article className="cohort-row" key={id}>
                <Icon aria-hidden="true" />
                <div><h2>{title}</h2><p>{effect}</p></div>
                <span><strong>{labor.cohorts[id]}</strong><small>{id === 'residents' ? 'residents' : `${available.toFixed(1)} available · ${(demand ?? 0).toFixed(1)} required`}</small></span>
                {id !== 'residents' ? <i className={ratio >= 1 ? 'ready' : 'strained'} style={{ width: `${Math.max(8, ratio * 100)}%` }} /> : null}
              </article>
            )
          })}
        </div>
        <section className="crew-officers">
          <div className="officer-heading"><h2>Mission Officer</h2><p>Select one active lead. Their specialty changes a narrow part of settlement operations.</p></div>
          <div className="officer-grid" role="radiogroup" aria-label="Mission officer">
            {members.map((member) => (
              <button type="button" role="radio" aria-checked={state.crewLeadId === member.id} className={state.crewLeadId === member.id ? 'active' : ''} key={member.id} onClick={() => onLead(member.id)}>
                <span><strong>{member.name}</strong><small>{member.role}</small></span>
                <i>{member.health}% health · {Math.round(member.fatigue)}% fatigue</i>
                <p>{TRAIT_LABELS[member.trait]}</p>
              </button>
            ))}
          </div>
        </section>
        <section className="training-focus">
          <div><h2>Cross-Training Focus</h2><p>Half of one rotating duty shift reinforces the selected labor pool.</p></div>
          <div className="training-segments" role="group" aria-label="Cross-training focus">
            {CROSS_TRAINING_ROLES.map((role) => (
              <button aria-pressed={labor.focus === role} className={labor.focus === role ? 'active' : ''} key={role} onClick={() => onTraining(role)}>{FOCUS_LABELS[role]}</button>
            ))}
          </div>
        </section>
        <footer><span><Minus aria-hidden="true" /> Shortages reduce output or increase colony strain.</span><button className="primary-command" onClick={onClose}>Confirm roster</button></footer>
      </section>
    </div>
  )
}
