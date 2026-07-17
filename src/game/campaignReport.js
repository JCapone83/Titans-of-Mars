import { crewWelfare } from './crewMembers.js'
import { marsOrder } from './rivalSettlements.js'
import { surveyStatus } from './siteFeatures.js'
import { colonyProfile, colonyStats } from './simulation.js'

const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)))

export function letterGrade(score) {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

export function campaignReport(state, objectives) {
  const stats = colonyStats(state)
  const welfare = crewWelfare(state)
  const survey = surveyStatus(state)
  const has = (type) => state.buildings.some((building) => building.type === type && building.integrity > 0)
  const completion = objectives.length ? objectives.filter((objective) => objective.complete).length / objectives.length : 0
  const resilience = clampScore((state.resources.integrity * 0.55) + (completion * 35) + (state.stormSurvived ? 5 : 0) + (state.debrisSurvived ? 5 : 0))
  const independence = clampScore(25 + (has('workshop') ? 18 : 0) + (has('greenhouse') ? 16 : 0) + (has('recycling') ? 16 : 0) + ((has('nuclear') || has('battery')) ? 15 : 0) + Math.min(10, state.resources.parts / 12))
  const science = clampScore(30 + (survey.discovered.length / Math.max(1, survey.total)) * 45 + Math.min(25, (state.sciencePoints ?? 0) * 1.2))
  const sponsor = clampScore(state.resources.confidence)
  const diplomacy = clampScore(((state.rivalRelations ?? 50) * 0.55) + ((state.strategicPosition ?? 50) * 0.45))
  const grades = [
    { id: 'resilience', label: 'Resilience', score: resilience, grade: letterGrade(resilience) },
    { id: 'independence', label: 'Independence', score: independence, grade: letterGrade(independence) },
    { id: 'science', label: 'Science', score: science, grade: letterGrade(science) },
    { id: 'crew', label: 'Crew welfare', score: welfare.score, grade: letterGrade(welfare.score) },
    { id: 'sponsor', label: 'Sponsor legitimacy', score: sponsor, grade: letterGrade(sponsor) },
    { id: 'diplomacy', label: 'Mars diplomacy', score: diplomacy, grade: letterGrade(diplomacy) },
  ]
  const overall = clampScore(grades.reduce((sum, item) => sum + item.score, 0) / grades.length)
  return {
    grades,
    overall,
    overallGrade: letterGrade(overall),
    profile: colonyProfile(state),
    order: marsOrder(state),
    welfare,
    survey,
    stats,
  }
}

export function campaignShareText(state, report) {
  const gradeLine = report.grades.map((item) => `${item.label} ${item.grade}`).join(' | ')
  return `I founded ${state.settlementName} in Titans of Mars: First City. ${report.profile}; ${report.order.title}. Overall ${report.overallGrade} (${report.overall}/100). ${gradeLine}.`
}

export function downloadCampaignCard(state, report) {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 675
  const context = canvas.getContext('2d')
  context.fillStyle = '#0b1011'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#141b1d'
  context.fillRect(56, 54, 1088, 567)
  context.strokeStyle = '#caa43a'
  context.lineWidth = 2
  context.strokeRect(56, 54, 1088, 567)
  context.fillStyle = '#caa43a'
  context.font = '700 22px Arial'
  context.fillText('TITANS OF MARS: FIRST CITY', 96, 105)
  context.fillStyle = '#f1eee4'
  context.font = '52px Georgia'
  context.fillText(state.settlementName, 96, 178)
  context.fillStyle = '#7fc4c4'
  context.font = '20px Arial'
  context.fillText(`${report.profile}  /  ${report.order.title}`, 96, 218)
  context.fillStyle = '#caa43a'
  context.font = '700 120px Georgia'
  context.fillText(report.overallGrade, 952, 196)
  context.fillStyle = '#9b9992'
  context.font = '15px Arial'
  context.fillText(`OVERALL ${report.overall}/100`, 932, 225)
  report.grades.forEach((item, index) => {
    const col = index % 3
    const row = Math.floor(index / 3)
    const x = 96 + (col * 330)
    const y = 315 + (row * 130)
    context.fillStyle = '#0e1415'
    context.fillRect(x, y - 46, 292, 96)
    context.strokeStyle = '#343d3f'
    context.strokeRect(x, y - 46, 292, 96)
    context.fillStyle = '#9b9992'
    context.font = '14px Arial'
    context.fillText(item.label.toUpperCase(), x + 18, y - 17)
    context.fillStyle = '#f1eee4'
    context.font = '700 42px Georgia'
    context.fillText(item.grade, x + 18, y + 31)
    context.fillStyle = '#caa43a'
    context.font = '16px Arial'
    context.fillText(`${item.score}/100`, x + 72, y + 27)
  })
  context.fillStyle = '#777d7d'
  context.font = '14px Arial'
  context.fillText(`Sol ${state.sol}  |  ${state.sponsor}  |  Local-first strategy simulation`, 96, 582)
  const link = document.createElement('a')
  link.download = `titans-of-mars-${state.settlementName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-report.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
