const site = (id, name, summary, dustSeverity, ice, solar) => ({
  id,
  name,
  summary,
  dustSeverity,
  features: [
    ...ice.map((feature) => ({ ...feature, kind: 'ice', requiresSurvey: true })),
    ...solar.map((feature) => ({ ...feature, kind: 'solar', requiresSurvey: false })),
  ],
})

export const MARS_SITES = {
  'american-compact': site(
    'arcadia-03',
    'Arcadia Planitia · Site 03',
    'Shallow mid-latitude ice prospects offset a more severe dust environment.',
    1.15,
    [
      { id: 'arcadia-west', col: 1, row: 5, title: 'West Shelf Permafrost', yield: 46, purity: 'mixed', surveyThreshold: 2, science: 5 },
      { id: 'arcadia-central', col: 5, row: 1, title: 'Central Ice Table', yield: 76, purity: 'high', surveyThreshold: 5, science: 7 },
      { id: 'arcadia-deep', col: 8, row: 5, title: 'Deep Basin Lens', yield: 64, purity: 'high', surveyThreshold: 9, science: 9 },
    ],
    [5, 6, 7].map((col, index) => ({ id: `arcadia-ridge-${index + 1}`, col, row: 0, title: 'North Solar Ridge', multiplier: 1.2 })),
  ),
  'china-directorate': site(
    'utopia-02',
    'Utopia Planitia · Site 02',
    'Broad construction terrain and strong buried-ice signals reward early surveying.',
    0.95,
    [
      { id: 'utopia-west', col: 0, row: 4, title: 'Western Polygon Field', yield: 58, purity: 'mixed', surveyThreshold: 2, science: 6 },
      { id: 'utopia-central', col: 4, row: 1, title: 'Central Ground Ice', yield: 70, purity: 'high', surveyThreshold: 5, science: 7 },
      { id: 'utopia-east', col: 8, row: 4, title: 'Eastern Ice-Rich Plain', yield: 88, purity: 'high', surveyThreshold: 9, science: 10 },
    ],
    [2, 3, 4].map((col, index) => ({ id: `utopia-ridge-${index + 1}`, col, row: 0, title: 'Raised Solar Shelf', multiplier: 1.12 })),
  ),
  'europe-cooperative': site(
    'elysium-07',
    'Elysium Planitia · Site 07',
    'Excellent solar exposure and young volcanic terrain come with leaner water prospects.',
    1,
    [
      { id: 'elysium-west', col: 1, row: 5, title: 'Western Frost Lens', yield: 34, purity: 'low', surveyThreshold: 2, science: 7 },
      { id: 'elysium-central', col: 6, row: 1, title: 'Lava-Plain Ice Pocket', yield: 48, purity: 'mixed', surveyThreshold: 5, science: 9 },
      { id: 'elysium-east', col: 8, row: 5, title: 'Eastern Buried Glacier', yield: 60, purity: 'mixed', surveyThreshold: 9, science: 12 },
    ],
    [4, 5, 6, 7].map((col, index) => ({ id: `elysium-ridge-${index + 1}`, col, row: 0, title: 'Elysium Solar Bench', multiplier: 1.34 })),
  ),
  'russia-directorate': site(
    'isidis-04',
    'Isidis Planitia · Site 04',
    'A sheltered basin moderates dust loading, but useful ice lies across difficult expansion corridors.',
    0.84,
    [
      { id: 'isidis-west', col: 0, row: 5, title: 'Basin Rim Frost', yield: 42, purity: 'low', surveyThreshold: 2, science: 6 },
      { id: 'isidis-central', col: 4, row: 1, title: 'Central Basin Lens', yield: 60, purity: 'mixed', surveyThreshold: 5, science: 8 },
      { id: 'isidis-east', col: 7, row: 4, title: 'Eastern Ice Pocket', yield: 74, purity: 'high', surveyThreshold: 9, science: 10 },
    ],
    [1, 2, 3].map((col, index) => ({ id: `isidis-ridge-${index + 1}`, col, row: 0, title: 'Basin Rim Solar Line', multiplier: 1.16 })),
  ),
}

export function siteForSponsor(sponsorId) {
  return MARS_SITES[sponsorId] ?? MARS_SITES['american-compact']
}

export const ICE_DEPOSITS = MARS_SITES['american-compact'].features.filter((feature) => feature.kind === 'ice')
export const SOLAR_RIDGE_CELLS = MARS_SITES['american-compact'].features.filter((feature) => feature.kind === 'solar')
export const SITE_FEATURES = MARS_SITES['american-compact'].features

export function surveyedFeatureSet(state) {
  return new Set(state.surveyedFeatureIds ?? [])
}

export function knownSiteFeatures(state) {
  const surveyed = surveyedFeatureSet(state)
  return siteForSponsor(state.sponsorId).features.filter((feature) => !feature.requiresSurvey || surveyed.has(feature.id))
}

export function unknownSurveyProspects(state) {
  const surveyed = surveyedFeatureSet(state)
  return siteForSponsor(state.sponsorId).features.filter((feature) => feature.requiresSurvey && !surveyed.has(feature.id))
}

export function siteFeatureAt(state, kind, col, row, requireKnown = true) {
  const feature = siteForSponsor(state.sponsorId).features.find((candidate) => candidate.kind === kind && candidate.col === col && candidate.row === row)
  if (!feature) return null
  if (requireKnown && feature.requiresSurvey && !surveyedFeatureSet(state).has(feature.id)) return null
  return feature
}

export function iceDepositAt(state, col, row) {
  return siteFeatureAt(state, 'ice', col, row, true)
}

export function solarRidgeAt(state, col, row) {
  return siteFeatureAt(state, 'solar', col, row, true)
}

export function terrainSupportsBuilding(state, type, col, row) {
  const possibleIce = siteFeatureAt(state, 'ice', col, row, false)
  if (type === 'ice') return Boolean(possibleIce && surveyedFeatureSet(state).has(possibleIce.id))
  return !possibleIce
}

export function surveyStatus(state) {
  const siteDefinition = siteForSponsor(state.sponsorId)
  const surveyed = surveyedFeatureSet(state)
  const prospects = siteDefinition.features.filter((feature) => feature.requiresSurvey)
  const next = prospects.find((feature) => !surveyed.has(feature.id)) ?? null
  return {
    site: siteDefinition,
    progress: state.siteSurveyProgress ?? 0,
    discovered: prospects.filter((feature) => surveyed.has(feature.id)),
    total: prospects.length,
    next,
    complete: !next,
  }
}

export function advanceSiteSurvey(state, roverEffort) {
  const status = surveyStatus(state)
  if (status.complete || roverEffort <= 0) return { progress: status.progress, discoveries: [], surveyedFeatureIds: [...surveyedFeatureSet(state)] }
  const progress = status.progress + roverEffort
  const current = surveyedFeatureSet(state)
  const discoveries = status.site.features.filter((feature) => feature.requiresSurvey && !current.has(feature.id) && feature.surveyThreshold <= progress)
  discoveries.forEach((feature) => current.add(feature.id))
  return { progress, discoveries, surveyedFeatureIds: [...current] }
}
