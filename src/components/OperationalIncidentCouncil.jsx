import { AlertOctagon, ArrowRight } from 'lucide-react'
import { operationalIncidentById } from '../game/operationalIncidents.js'

function effectLabel(key, value) {
  const labels = { water: 'Water', oxygen: 'Oxygen', food: 'Food', parts: 'Parts', cargo: 'Cargo', confidence: 'Confidence', integrity: 'Integrity' }
  const units = { water: ' L', oxygen: ' L', food: ' kg', cargo: ' t', confidence: '%', integrity: '%' }
  return `${labels[key] ?? key} ${value > 0 ? '+' : ''}${value}${units[key] ?? ''}`
}

export default function OperationalIncidentCouncil({ incidentId, onChoose }) {
  const incident = operationalIncidentById(incidentId)
  if (!incident) return null
  return (
    <div className="manifest-backdrop incident-backdrop">
      <section className="event-council incident-council" role="dialog" aria-modal="true" aria-labelledby="incident-title">
        <header>
          <AlertOctagon aria-hidden="true" />
          <p>Settlement operations · {incident.system}</p>
          <h1 id="incident-title">{incident.title}</h1>
          <blockquote>{incident.brief}</blockquote>
          <span>{incident.stakes}</span>
        </header>
        <div className="event-choice-grid">
          {incident.choices.map((choice) => (
            <button type="button" className="event-choice" key={choice.id} onClick={() => onChoose(choice.id)}>
              <span className="event-choice-command">Operations order</span>
              <h2>{choice.title}</h2>
              <p>{choice.description}</p>
              <div className="event-effects">
                {Object.entries(choice.effects ?? {}).map(([key, value]) => <strong className={value >= 0 ? 'positive' : 'negative'} key={key}>{effectLabel(key, value)}</strong>)}
                {choice.science ? <strong className="positive">Science +{choice.science}</strong> : null}
                {choice.damage ? <strong className="negative">{choice.damageType} integrity -{choice.damage}</strong> : null}
              </div>
              <span className="event-commit">Issue operations order <ArrowRight aria-hidden="true" /></span>
            </button>
          ))}
        </div>
        <footer>This incident follows from the current colony state and will be recorded in the campaign chronicle.</footer>
      </section>
    </div>
  )
}
