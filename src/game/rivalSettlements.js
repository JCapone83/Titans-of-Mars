export const RIVAL_SETTLEMENTS = {
  'american-compact': {
    id: 'tianwen-network',
    name: 'Tianwen Settlement',
    sponsor: 'Chinese National Mars Directorate',
    site: 'Utopia Planitia',
    startingRelations: 44,
    startingPosition: 52,
    encounter: {
      id: 'us-orbital-relay',
      sol: 27,
      authority: 'Mars Communications Board',
      title: 'The Orbital Relay Window',
      brief: 'Tianwen proposes a shared navigation and communications relay. The same launch slot could instead carry an exclusive American commercial platform.',
      stakes: 'The first orbital infrastructure agreement will determine whether Mars begins as a shared network or a contest for controlled access.',
      choices: [
        { id: 'share', posture: 'Cooperate', title: 'Build the relay together', description: 'Contribute standardized hardware and guarantee equal network access.', effects: { parts: -15, confidence: 3 }, relations: 24, position: 7, consequence: 'Ares and Tianwen commission the first shared orbital utility. Trust rises and the American settlement gains influence through technical leadership.' },
        { id: 'exclusive', posture: 'Compete', title: 'Bid for exclusive control', description: 'Spend imported cargo on a commercial relay controlled from Ares.', effects: { cargo: -1.2, confidence: 2 }, relations: -18, position: 20, consequence: 'Ares wins the relay slot and controls a valuable service. Tianwen begins planning an independent network.' },
        { id: 'abstain', posture: 'Remain independent', title: 'Keep resources on the surface', description: 'Decline both projects and protect the settlement reserve.', effects: { confidence: -1 }, relations: -4, position: -8, consequence: 'Ares preserves its surface reserve while both settlements proceed without a common network.' },
      ],
    },
  },
  'china-directorate': {
    id: 'ares-network',
    name: 'Ares Pathfinder',
    sponsor: 'American Public-Private Compact',
    site: 'Arcadia Planitia',
    startingRelations: 44,
    startingPosition: 48,
    encounter: {
      id: 'cn-ice-corridor',
      sol: 27,
      authority: 'Mars Resources Commission',
      title: 'The Ice Survey Corridor',
      brief: 'Ares surveyors request access to a Tianwen orbital dataset covering a rich mid-latitude ice corridor. Earth ministries want a clear rule before either settlement deploys equipment.',
      stakes: 'Joint surveying improves both settlements. A unilateral claim could secure the strongest field and establish a harder precedent.',
      choices: [
        { id: 'joint-survey', posture: 'Cooperate', title: 'Create a joint survey zone', description: 'Share the dataset and divide field work under a common technical board.', effects: { parts: -18, confidence: 2 }, relations: 22, position: 9, consequence: 'The two settlements establish a joint survey zone. Tianwen spends equipment but shapes the first shared resource rules.' },
        { id: 'claim', posture: 'Compete', title: 'Claim the corridor first', description: 'Deploy reserve machinery before Ares can establish a surface presence.', effects: { parts: -25, confidence: 4 }, relations: -22, position: 22, consequence: 'Tianwen establishes the first surface claim in the corridor. The strategic gain is clear and relations with Ares deteriorate.' },
        { id: 'observe', posture: 'Remain independent', title: 'Keep the data classified', description: 'Avoid a claim while withholding the survey from the rival settlement.', effects: { parts: 10, confidence: -1 }, relations: -7, position: -5, consequence: 'Tianwen protects its equipment and data. The corridor remains unsettled and Ares treats the silence as a warning.' },
      ],
    },
  },
  'europe-cooperative': {
    id: 'zvezda-network',
    name: 'Zvezda Settlement',
    sponsor: 'Russian Mars Directorate',
    site: 'Isidis Planitia',
    startingRelations: 50,
    startingPosition: 50,
    encounter: {
      id: 'eu-docking-standard',
      sol: 27,
      authority: 'European Mars Standards Office',
      title: 'The Docking Standard',
      brief: 'Zvezda will adopt Kepler docking hardware if Europe publishes the interface without royalties. Coalition contractors demand compensation for the design work.',
      stakes: 'An open standard can make Kepler the center of a Mars-wide system. Licensing preserves commercial control but invites competing hardware.',
      choices: [
        { id: 'open-standard', posture: 'Cooperate', title: 'Publish an open standard', description: 'Fund final qualification work and permit every settlement to manufacture the interface.', effects: { parts: -15, confidence: 4 }, relations: 25, position: 12, consequence: 'Kepler publishes the docking interface. Zvezda adopts it, and European engineering becomes the default Mars standard.' },
        { id: 'license', posture: 'Compete', title: 'License the interface', description: 'Exchange controlled manufacturing rights for imported cargo.', effects: { cargo: 1.2, confidence: 1 }, relations: -12, position: 16, consequence: 'Zvezda pays for a limited license while beginning a rival design. Kepler gains cargo and commercial leverage, but not trust.' },
        { id: 'defer', posture: 'Remain independent', title: 'Defer the standard', description: 'Protect contractor claims and keep qualification resources inside Kepler.', effects: { parts: 10, confidence: -2 }, relations: -4, position: -7, consequence: 'The coalition delays publication. Kepler preserves near-term resources while Mars fragments into incompatible systems.' },
      ],
    },
  },
  'russia-directorate': {
    id: 'kepler-network',
    name: 'Kepler Settlement',
    sponsor: 'European Mars Cooperative',
    site: 'Elysium Planitia',
    startingRelations: 50,
    startingPosition: 46,
    encounter: {
      id: 'ru-reactor-rescue',
      sol: 27,
      authority: 'Intersettlement Emergency Channel',
      title: 'The Reactor Rescue',
      brief: 'Kepler reports a coolant fault in its backup reactor. Zvezda has the nearest compatible welding team and the only spare controller that can be adapted in time.',
      stakes: 'Emergency aid can make Russian heavy engineering indispensable. A hard bargain gains scarce cargo but may define every future request as a transaction.',
      choices: [
        { id: 'dispatch', posture: 'Cooperate', title: 'Dispatch the repair team', description: 'Send the controller and specialists under a mutual-aid agreement.', effects: { parts: -25, confidence: 3 }, relations: 26, position: 13, consequence: 'Zvezda restores Kepler reserve power. The costly rescue establishes Russian engineering as the backbone of a mutual-aid network.' },
        { id: 'bargain', posture: 'Compete', title: 'Demand cargo priority', description: 'Provide the team only after Kepler transfers launch cargo and future berth rights.', effects: { parts: -10, cargo: 1.5, confidence: 2 }, relations: -14, position: 20, consequence: 'Kepler accepts Zvezda terms and transfers cargo priority. Russia gains leverage while emergency cooperation becomes a commercial bargain.' },
        { id: 'hold', posture: 'Remain independent', title: 'Hold the emergency reserve', description: 'Keep the controller at Zvezda and advise Kepler by radio.', effects: { parts: 10, confidence: -1 }, relations: -12, position: -8, consequence: 'Zvezda keeps its emergency reserve. Kepler stabilizes the fault alone and revises its plans around Russian isolation.' },
      ],
    },
  },
}

export function rivalSettlementFor(sponsorId) {
  return RIVAL_SETTLEMENTS[sponsorId] ?? null
}

export function rivalEncounterById(id) {
  return Object.values(RIVAL_SETTLEMENTS).map((rival) => rival.encounter).find((encounter) => encounter.id === id) ?? null
}

export function rivalEncounterAt(sponsorId, sol, phase, resolvedIds = []) {
  const rival = rivalSettlementFor(sponsorId)
  if (!rival || phase !== 'expansion' || rival.encounter.sol !== sol || resolvedIds.includes(rival.encounter.id)) return null
  return rival.encounter
}

export function marsOrder(state) {
  const relations = state.rivalRelations ?? 50
  const position = state.strategicPosition ?? 50
  if (relations >= 65 && position >= 55) return { title: 'Cooperative Leadership', summary: 'Your city leads through shared systems and durable intersettlement trust.' }
  if (relations <= 35 && position >= 65) return { title: 'Competitive Hegemony', summary: 'Your city holds the stronger position in a divided and competitive Mars order.' }
  if (relations >= 65) return { title: 'Mutual Dependence', summary: 'The settlements rely on one another without a clear strategic leader.' }
  if (position >= 65) return { title: 'Strategic Lead', summary: 'Your city holds the stronger hand while keeping cooperation limited.' }
  if (relations <= 35) return { title: 'Contested Frontier', summary: 'Mars is divided into guarded settlements with few shared systems.' }
  return { title: 'Parallel Settlements', summary: 'The settlements coexist without either deep integration or open rivalry.' }
}
