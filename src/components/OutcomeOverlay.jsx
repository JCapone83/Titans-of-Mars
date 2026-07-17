import { Building2, Clipboard, Download, RotateCcw, ShieldAlert, TentTree } from 'lucide-react'
import { campaignReport, campaignShareText, downloadCampaignCard } from '../game/campaignReport.js'

const OUTCOMES = {
  'first-city': {
    icon: Building2,
    title: 'The First City Takes Root',
    body: (state) => `${state.settlementName} survived its first isolation crisis with local water, oxygen and storm-resilient power. It is still dependent on Earth, but it is no longer merely a landing party.`,
  },
  'dependent-outpost': {
    icon: TentTree,
    title: 'An Outpost on Earth’s Clock',
    body: 'The crew survived, but the settlement remains structurally dependent on the next launch window. Missing cargo or political support would place the mission in immediate danger.',
  },
  'permanent-city': {
    icon: Building2,
    title: 'Mars Keeps Its Own Clock',
    body: (state) => `${state.settlementName} now houses its permanent crew, fabricates replacement parts, and carries enough protected reserve to survive a closed launch window. Earth still matters, but the city no longer waits helplessly for every decision from home.`,
  },
  'fragile-city': {
    icon: TentTree,
    title: 'Expansion Without Margin',
    body: 'The settlement grew beyond its first landing party, but the Sol 42 review found a critical weakness in housing, reserves, maintenance capacity, or replacement-parts margin. Mars has a city in name, but not yet in resilience.',
  },
  failure: {
    icon: ShieldAlert,
    title: (state) => `${state.settlementName} Lost`,
    body: 'Cascading shortages overwhelmed the settlement before relief could arrive. Mars punished efficiency without redundancy.',
  },
}

export default function OutcomeOverlay({ outcome, state, objectives, onReset }) {
  if (!outcome) return null
  const result = OUTCOMES[outcome]
  const Icon = result.icon
  const title = typeof result.title === 'function' ? result.title(state) : result.title
  const body = typeof result.body === 'function' ? result.body(state) : result.body
  const completed = objectives.filter((objective) => objective.complete).length
  const report = campaignReport(state, objectives)
  const copySummary = async () => navigator.clipboard.writeText(campaignShareText(state, report))
  return (
    <div className="outcome-backdrop">
      <section className="outcome-panel" role="dialog" aria-modal="true" aria-labelledby="outcome-title">
        <Icon aria-hidden="true" />
        <p>Mission Audit · Sol {state.sol}</p>
        <h1 id="outcome-title">{title}</h1>
        <blockquote>{body}</blockquote>
        <div className="outcome-scores">
          <div className="profile-score"><span>Colony profile</span><strong>{report.profile}</strong></div>
          <div className="profile-score"><span>Mars order</span><strong>{report.order.title}</strong></div>
          <div><span>Overall</span><strong>{report.overallGrade}</strong><small>{report.overall}/100</small></div>
        </div>
        <div className="campaign-grades">
          {report.grades.map((item) => <div key={item.id}><span>{item.label}</span><strong>{item.grade}</strong><small>{item.score}/100</small></div>)}
        </div>
        <p className="mars-order-summary">{report.order.summary} {completed}/{objectives.length} final objectives completed.</p>
        {state.decisionLog?.length ? (
          <details className="campaign-chronicle">
            <summary>Campaign chronicle · {state.decisionLog.length} entries</summary>
            <ol>{state.decisionLog.map((entry, index) => <li key={`${entry.sol}-${index}`}><time>Sol {entry.sol}</time><span><strong>{entry.title}</strong>{entry.choice}</span></li>)}</ol>
          </details>
        ) : null}
        <div className="outcome-actions">
          <button onClick={copySummary}><Clipboard /> Copy result</button>
          <button onClick={() => downloadCampaignCard(state, report)}><Download /> Result card</button>
          <button className="primary-command" onClick={onReset}><RotateCcw /> Begin another mission</button>
        </div>
      </section>
    </div>
  )
}
