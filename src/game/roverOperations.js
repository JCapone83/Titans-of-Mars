export const ROVER_ROUTES = {
  water: {
    id: 'water',
    title: 'Ice Haul',
    description: 'Move extracted water from field rigs into the settlement reserve loop.',
  },
  construction: {
    id: 'construction',
    title: 'Construction Support',
    description: 'Pre-position hardware, regolith shielding, and pressure fittings at active build sites.',
  },
  maintenance: {
    id: 'maintenance',
    title: 'Maintenance Patrol',
    description: 'Inspect utility trenches, clear dust, and recover exposed hardware before it fails.',
  },
  survey: {
    id: 'survey',
    title: 'Ground Survey',
    description: 'Run radar, chemistry, and bearing-strength traverses across unresolved resource sectors.',
  },
}

export const ROVER_ROUTE_ORDER = ['water', 'construction', 'maintenance', 'survey']
export const DEFAULT_ROVER_ASSIGNMENTS = { water: 1, construction: 1, maintenance: 0, survey: 0 }

export function roverOperations(state) {
  const fleet = state.roverFleet ?? 2
  const assignments = { ...DEFAULT_ROVER_ASSIGNMENTS, ...(state.roverAssignments ?? {}) }
  const assigned = ROVER_ROUTE_ORDER.reduce((total, route) => total + Math.max(0, assignments[route] ?? 0), 0)
  return {
    fleet,
    assignments,
    assigned,
    available: Math.max(0, fleet - assigned),
    constructionDiscount: {
      parts: assignments.construction * 4,
      cargo: assignments.construction * 0.2,
    },
    maintenanceRelief: assignments.maintenance * 1.5,
    surveyEffort: assignments.survey,
  }
}
