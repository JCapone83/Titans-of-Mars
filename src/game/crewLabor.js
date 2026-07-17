import { BUILDINGS } from './buildings.js'
import { crewLead, crewReadinessByCohort } from './crewMembers.js'

export const DEFAULT_CREW_COHORTS = { engineering: 2, operations: 3, support: 1, residents: 0 }
export const CROSS_TRAINING_ROLES = ['engineering', 'operations', 'support']

export function cohortTotal(cohorts) {
  return Object.values(cohorts).reduce((total, count) => total + count, 0)
}

export function mergeCohorts(current, incoming) {
  const merged = { ...DEFAULT_CREW_COHORTS, ...(current ?? {}) }
  Object.entries(incoming ?? {}).forEach(([role, count]) => { merged[role] = (merged[role] ?? 0) + count })
  return merged
}

export function inferLegacyCohorts(state) {
  if (state.secondManifestId === 'permanent-crew') {
    return mergeCohorts(DEFAULT_CREW_COHORTS, { engineering: 1, operations: 1, support: 1, residents: 1 })
  }
  if (state.secondManifestId === 'machine-economy') {
    return mergeCohorts(DEFAULT_CREW_COHORTS, { engineering: 2 })
  }
  return { ...DEFAULT_CREW_COHORTS }
}

export function crewLabor(state, connectedUids) {
  const connected = new Set(connectedUids)
  const cohorts = { ...DEFAULT_CREW_COHORTS, ...(state.crewCohorts ?? {}) }
  const demand = { engineering: 0, operations: 0, support: Math.ceil(state.crew / 8) }

  state.buildings.forEach((placed) => {
    if (placed.integrity <= 0 || !connected.has(placed.uid)) return
    const labor = BUILDINGS[placed.type]?.labor ?? {}
    demand.engineering += labor.engineering ?? 0
    demand.operations += labor.operations ?? 0
  })

  const readiness = crewReadinessByCohort(state)
  const available = {
    engineering: cohorts.engineering * readiness.engineering,
    operations: cohorts.operations * readiness.operations,
    support: cohorts.support * readiness.support,
  }
  const focus = CROSS_TRAINING_ROLES.includes(state.crossTraining) ? state.crossTraining : 'engineering'
  available[focus] += 0.5
  const lead = crewLead(state)
  if (lead?.trait === 'systems') available.engineering += 0.35
  if (lead?.trait === 'surface') available.operations += 0.35
  if (lead?.trait === 'medical') available.support += 0.35
  const ratioFor = (role) => demand[role] === 0 ? 1 : Math.min(1, available[role] / demand[role])
  const ratios = {
    engineering: ratioFor('engineering'),
    operations: ratioFor('operations'),
    support: ratioFor('support'),
  }

  return {
    cohorts,
    demand,
    available,
    ratios,
    focus,
    readiness,
    lead,
    fullyStaffed: Object.values(ratios).every((ratio) => ratio >= 1),
  }
}
