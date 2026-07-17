# Titans of Mars: First City

Build the first Martian settlement capable of surviving when Earth cannot help it.

This repository contains four playable founding campaigns: the American Public-Private Compact at Ares Pathfinder in 2033, the Chinese National Mars Directorate at Tianwen Settlement in 2034, the German-led European Mars Cooperative at Kepler Settlement in 2036, and the Russian Mars Directorate at Zvezda Settlement in 2038. Each begins on Sol 1 with a dust front forecast for Sol 18, but resources, personnel, rover doctrine, political constraints, and payload choices differ.

## Play locally

```bash
npm install
npm run dev
```

## Browser release

The production build is a self-contained HTML5 game and does not require GitHub, an AI model, or a server-side application. Run `npm run build`, ZIP the contents of `dist/` with `index.html` at the archive root, and upload it to an HTML5 host such as itch.io. See [docs/ITCH_RELEASE.md](./docs/ITCH_RELEASE.md) for the tested page settings.

## Current gameplay

- Interactive isometric construction site rendered with Phaser.
- Founding sponsor selection with distinct American, Chinese, European, and Russian campaign baselines.
- Three sponsor-specific opening doctrines for each campaign.
- Conditional Sol 24 review with three sponsor-specific expansion strategies per campaign.
- Two sponsor-specific command crises per campaign, with permanent choices on Sol 12 and Sol 30.
- A sponsor-specific rival settlement, Sol 27 strategic encounter, and final Mars-order assessment.
- Ten buildable structures spanning power, storage, life support, food, water recycling, and local industry.
- Connected utility-grid placement: structures outside the live network remain offline.
- Rover dispatch between ice hauling, construction support, maintenance patrols, and ground survey.
- Sponsor-specific landing sites with discoverable ice lenses, different yields, dust severity, and solar-ridge bonuses.
- Engineering, surface-operations, medical, and resident population cohorts with cross-training.
- Deterministic power, water, oxygen, food, maintenance, confidence, and integrity simulation.
- Named mission officers whose health, fatigue, and specialties affect settlement performance.
- State-driven operational incidents with persistent consequences and a campaign chronicle.
- Solar degradation during a four-sol dust storm.
- Structure-level storm and debris damage, reduced equipment efficiency, and parts-funded repairs.
- Mission objectives and state-based Sol 24 outcomes.
- A second expansion act, Sol 34 debris hazard, and Sol 42 permanent-city audit.
- A six-part final assessment covering resilience, independence, science, crew welfare, sponsor legitimacy, and diplomacy.
- Pause, 1x, 4x, and 12x simulation speeds.
- Automatic local browser saves.
- An opt-in, self-hosted four-track classical soundtrack with source and rights links in the player.
- A nine-topic Mars Field Guide covering surface science, space weather, local resources, planetary history, and robotic exploration with NASA and JPL references.
- Responsive mission-control interface.

The core game requires no AI model or network connection.

## Verify

```bash
npm test
npm run build
```

## Roadmap

The four founding campaigns are complete through the Sol 42 permanent-city audit. A later game or major expansion may explore mature inter-settlement trade, government, and conflict; those systems are intentionally outside the scope of *First City*.

## License

Source code is released under the MIT License. Generated media is separately identified in [MEDIA_RIGHTS.md](./MEDIA_RIGHTS.md).
