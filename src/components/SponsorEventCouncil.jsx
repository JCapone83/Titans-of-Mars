import { AlertTriangle, ArrowRight } from 'lucide-react'
import { sponsorEventById } from '../game/sponsorEvents.js'

function effectLabel(key, value) {
  const labels = { water: 'Water', oxygen: 'Oxygen', food: 'Food', parts: 'Parts', cargo: 'Cargo', confidence: 'Confidence' }
  const units = { water: ' L', oxygen: ' L', food: ' kg', cargo: ' t', confidence: '%' }
  return `${labels[key] ?? key} ${value > 0 ? '+' : ''}${value}${units[key] ?? ''}`
}

export default function SponsorEventCouncil({ eventId, onChoose }) {
  const event = sponsorEventById(eventId)
  if (!event) return null
  return (
    <div className="manifest-backdrop event-backdrop">
      <section className="event-council" role="dialog" aria-modal="true" aria-labelledby="event-title">
        <header>
          <AlertTriangle aria-hidden="true" />
          <p>{event.authority} · Sol {event.sol}</p>
          <h1 id="event-title">{event.title}</h1>
          <blockquote>{event.brief}</blockquote>
          <span>{event.stakes}</span>
        </header>
        <div className="event-choice-grid">
          {event.choices.map((choice) => (
            <button type="button" className="event-choice" key={choice.id} onClick={() => onChoose(choice.id)} aria-label={`Choose ${choice.title}`}>
              <span className="event-choice-command">Command option</span>
              <h2>{choice.title}</h2>
              <p>{choice.description}</p>
              <div className="event-effects">
                {Object.entries(choice.effects).map(([key, value]) => <strong className={value >= 0 ? 'positive' : 'negative'} key={key}>{effectLabel(key, value)}</strong>)}
              </div>
              <span className="event-commit">Issue directive <ArrowRight aria-hidden="true" /></span>
            </button>
          ))}
        </div>
        <footer>The decision is permanent and will be recorded in the mission log.</footer>
      </section>
    </div>
  )
}
