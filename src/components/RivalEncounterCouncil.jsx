import { ArrowRight, Orbit } from 'lucide-react'
import { rivalEncounterById, rivalSettlementFor } from '../game/rivalSettlements.js'

function effectLabel(key, value) {
  const labels = { food: 'Food', parts: 'Parts', cargo: 'Cargo', confidence: 'Confidence' }
  const units = { food: ' kg', cargo: ' t', confidence: '%' }
  return `${labels[key] ?? key} ${value > 0 ? '+' : ''}${value}${units[key] ?? ''}`
}

export default function RivalEncounterCouncil({ sponsorId, encounterId, onChoose }) {
  const encounter = rivalEncounterById(encounterId)
  const rival = rivalSettlementFor(sponsorId)
  if (!encounter || !rival) return null
  return (
    <div className="manifest-backdrop rival-backdrop">
      <section className="rival-council" role="dialog" aria-modal="true" aria-labelledby="rival-encounter-title">
        <header>
          <Orbit aria-hidden="true" />
          <p>{encounter.authority} · Sol {encounter.sol}</p>
          <h1 id="rival-encounter-title">{encounter.title}</h1>
          <blockquote>{encounter.brief}</blockquote>
          <span>{encounter.stakes}</span>
          <strong>{rival.name} · {rival.site}</strong>
        </header>
        <div className="rival-choice-grid">
          {encounter.choices.map((choice) => (
            <button type="button" className="rival-choice" key={choice.id} onClick={() => onChoose(choice.id)} aria-label={`Choose ${choice.title}`}>
              <span className="rival-choice-posture">{choice.posture}</span>
              <h2>{choice.title}</h2>
              <p>{choice.description}</p>
              <div className="rival-effects">
                {Object.entries(choice.effects).map(([key, value]) => <strong className={value >= 0 ? 'positive' : 'negative'} key={key}>{effectLabel(key, value)}</strong>)}
                <strong className={choice.relations >= 0 ? 'positive' : 'negative'}>Relations {choice.relations > 0 ? '+' : ''}{choice.relations}</strong>
                <strong className={choice.position >= 0 ? 'positive' : 'negative'}>Position {choice.position > 0 ? '+' : ''}{choice.position}</strong>
              </div>
              <span className="rival-commit">Set Mars policy <ArrowRight aria-hidden="true" /></span>
            </button>
          ))}
        </div>
        <footer>This policy will shape the final Mars-order assessment.</footer>
      </section>
    </div>
  )
}
