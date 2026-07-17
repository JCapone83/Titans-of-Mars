export const marsFieldGuideTopics = [
  {
    id: 'regolith',
    label: 'Regolith',
    section: 'Surface science',
    title: 'Mars does not have ordinary soil',
    summary: 'Regolith is the loose blanket of broken rock, mineral grains, and dust above solid bedrock. Calling it soil is convenient, but it does not imply the organic matter or living ecosystem found in productive soil on Earth.',
    facts: [
      'Iron-bearing minerals oxidize and help give the dust its red color.',
      'Martian dust is fine enough to enter mechanisms, seals, and living spaces.',
      'Perchlorate salts measured in Martian material complicate water treatment and food production.',
    ],
    colonyNote: 'A settlement must treat regolith as both a hazard and a resource: exclude abrasive dust, test excavated material, and process it before using local water or growing food.',
    sources: [
      { label: 'NASA Mars facts', url: 'https://science.nasa.gov/mars/facts/' },
      { label: 'NASA perchlorate study', url: 'https://www.nasa.gov/general/detoxifying-mars/' },
    ],
  },
  {
    id: 'atmosphere',
    label: 'Atmosphere',
    section: 'Environment',
    title: 'Air is present, but it cannot sustain a crew',
    summary: 'Mars has a very thin atmosphere made mostly of carbon dioxide, with nitrogen and argon. It cannot be breathed, holds little heat, and provides far less protection from radiation and incoming objects than Earth’s atmosphere.',
    facts: [
      'Surface temperatures can swing sharply because heat escapes readily.',
      'Liquid water is unstable on most of the present surface.',
      'The atmosphere is useful feedstock: oxygen can be separated from carbon dioxide with the right equipment.',
    ],
    colonyNote: 'Pressure hulls, leak control, thermal management, and continuous oxygen production are basic infrastructure rather than optional upgrades.',
    sources: [{ label: 'NASA Mars facts', url: 'https://science.nasa.gov/mars/facts/' }],
  },
  {
    id: 'magnetism',
    label: 'Magnetism',
    section: 'Space weather',
    title: 'Mars has magnetic scars, not a global shield',
    summary: 'Mars has no global magnetic field today. Strongly magnetized areas of crust, especially in the southern hemisphere, preserve evidence that a planetary field existed roughly four billion years ago.',
    facts: [
      'A global field would deflect part of the charged-particle environment around a planet.',
      'Mars instead interacts directly with the solar wind across much of the planet.',
      'The thin atmosphere also supplies much less radiation shielding than Earth’s atmosphere.',
    ],
    colonyNote: 'Surface crews need shielded shelter, exposure limits, and space-weather procedures. A local crustal field is not a replacement for an Earth-like magnetosphere.',
    sources: [
      { label: 'NASA Mars magnetosphere', url: 'https://science.nasa.gov/mars/facts/#h-magnetosphere' },
      { label: 'NASA on ice and radiation', url: 'https://www.nasa.gov/solar-system/planets/mars/could-life-exist-below-mars-ice-nasa-study-proposes-possibilities/' },
    ],
  },
  {
    id: 'water-ice',
    label: 'Water ice',
    section: 'Local resources',
    title: 'The useful water is largely underground',
    summary: 'Mars retains abundant water as ice. Orbital data indicate buried deposits across parts of the mid-latitudes, while the polar regions hold large reservoirs of water ice and seasonal carbon-dioxide frost.',
    facts: [
      'NASA’s SWIM project maps likely ice within the upper meter in parts of the northern mid-latitudes.',
      'Arcadia Planitia is among the regions that match several indicators of accessible subsurface ice.',
      'Water can support drinking, agriculture, oxygen production, and propellant manufacturing.',
    ],
    colonyNote: 'An ice lens is not an infinite tank. Survey confidence, excavation energy, purification, storage, and depletion all matter to the first city.',
    sources: [
      { label: 'NASA subsurface ice map', url: 'https://www.nasa.gov/solar-system/planets/mars/nasa-is-locating-ice-on-mars-with-this-new-map/' },
      { label: 'NASA SWIM technical record', url: 'https://ntrs.nasa.gov/citations/20205008958' },
    ],
  },
  {
    id: 'geology',
    label: 'Volcanoes',
    section: 'Planetary geology',
    title: 'Mars built landscapes on a planetary scale',
    summary: 'Olympus Mons is the largest known volcano in the solar system, rising more than 40 kilometers from base to summit. Valles Marineris stretches roughly 3,870 kilometers and reaches about 9 kilometers deep in places.',
    facts: [
      'Olympus Mons is a broad shield volcano built by repeated fluid lava flows.',
      'The absence of Earth-like moving plates helped eruptions build over the same region for long periods.',
      'Ancient channels, deltas, lava plains, and impact basins preserve different chapters of Martian history.',
    ],
    colonyNote: 'Terrain history affects landing safety, construction foundations, mineral access, and the scientific value of every site selected for settlement.',
    sources: [
      { label: 'NASA Mars surface facts', url: 'https://science.nasa.gov/mars/facts/#h-surface' },
      { label: 'NASA Mars volcanism', url: 'https://science.nasa.gov/earth/earth-observatory/scoria-cones-on-earth-and-mars/' },
    ],
  },
  {
    id: 'time',
    label: 'Sols & seasons',
    section: 'Orbital mechanics',
    title: 'The day feels familiar; the calendar does not',
    summary: 'Mars rotates once every 24.6 hours, so a sol is only about 40 minutes longer than an Earth day. A Martian year lasts 669.6 sols, or 687 Earth days.',
    facts: [
      'Mars has an axial tilt of about 25 degrees and therefore experiences seasons.',
      'Its more elliptical orbit makes those seasons unequal in length.',
      'Efficient Earth-to-Mars launch opportunities recur roughly every 26 months.',
    ],
    colonyNote: 'Crew schedules can follow a near-Earth rhythm, but resupply, agriculture, energy planning, and political review operate on a much longer calendar.',
    sources: [
      { label: 'NASA orbit and rotation facts', url: 'https://science.nasa.gov/mars/facts/#h-orbit-and-rotation' },
      { label: 'NASA mission timeline', url: 'https://science.nasa.gov/planetary-science/programs/mars-exploration/mission-timeline/' },
    ],
  },
  {
    id: 'dust',
    label: 'Dust storms',
    section: 'Weather',
    title: 'Thin air can still move a great deal of dust',
    summary: 'Fine Martian dust can remain suspended, coat equipment, and spread through storms ranging from local events to planet-encircling systems. After a major storm, settling can take months.',
    facts: [
      'Dust in the atmosphere reduces sunlight reaching solar arrays.',
      'Electrostatic and abrasive dust can degrade exposed equipment.',
      'The thin air carries less force than an equally fast wind on Earth, but visibility and power losses remain serious.',
    ],
    colonyNote: 'A resilient settlement combines forecast time, stored energy, non-solar generation, protected mechanisms, and maintenance capacity.',
    sources: [
      { label: 'NASA Mars atmosphere facts', url: 'https://science.nasa.gov/mars/facts/#h-atmosphere' },
      { label: 'NASA MRO science highlights', url: 'https://science.nasa.gov/mission/mars-reconnaissance-orbiter/science-highlights/' },
    ],
  },
  {
    id: 'moons',
    label: 'Two moons',
    section: 'Mars system',
    title: 'Phobos races overhead while Deimos keeps its distance',
    summary: 'Mars has two small, irregular moons: Phobos and Deimos. Phobos is the larger and closer moon; it circles Mars about three times per Martian day. Deimos takes about 30 hours to complete an orbit.',
    facts: [
      'Phobos is moving inward by about 1.8 meters per century.',
      'In tens of millions of years, Phobos is expected to strike Mars or break into a ring.',
      'Both moons were discovered by Asaph Hall in 1877.',
    ],
    colonyNote: 'The moons are useful landmarks and scientific targets, but their rapid and unusual motion makes an Earth-trained sense of the sky unreliable.',
    sources: [{ label: 'NASA moons of Mars', url: 'https://science.nasa.gov/mars/moons/' }],
  },
  {
    id: 'exploration',
    label: 'Exploration',
    section: 'Mission history',
    title: 'The first city inherits decades of robotic reconnaissance',
    summary: 'Mars exploration advanced from brief flybys to orbiters, stationary landers, rovers, and the first powered flight on another world. Failures were frequent, and each successful mission changed what later missions could attempt.',
    facts: [
      'Mariner 4 returned the first close-up images in 1965; Mariner 9 became the first spacecraft to orbit another planet in 1971.',
      'The Soviet Mars 3 achieved the first soft landing in 1971 but transmitted for only seconds; Viking 1 and 2 began sustained surface operations in 1976.',
      'Sojourner opened the rover era in 1997; later rovers and orbiters mapped water, climate, geology, and landing hazards in increasing detail.',
    ],
    colonyNote: 'The game begins in the 2030s, but its landing sites, ice surveys, weather forecasts, and operating assumptions depend on the accumulated robotic record.',
    sources: [
      { label: 'NASA Mars exploration chronology', url: 'https://nssdc.gsfc.nasa.gov/planetary/chronology_mars.html' },
      { label: 'NASA landing history', url: 'https://science.nasa.gov/planetary-science/programs/mars-exploration/mission-timeline/how-we-land-on-mars/' },
    ],
  },
]

export function getMarsFieldGuideTopic(id) {
  return marsFieldGuideTopics.find((topic) => topic.id === id) ?? marsFieldGuideTopics[0]
}
