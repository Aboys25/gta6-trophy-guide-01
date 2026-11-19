# Leonida Legend — GTA VI Trophy Guide & Tracker

The complete offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: every official trophy with its guide and sources, a roadmap to the Platinum, missable flags, and a checklist that saves your progress in the browser.

[![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Aboys25/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Aboys25/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

See the bounty page on [make.fun](https://make.fun/bounty/gta6-trophy-guide-01) for the full brief this guide was built against.

## What it is

- **All 55 trophies** — 1 Platinum, 2 Gold, 6 Silver, 46 Bronze, 28 hidden — with the official name, description and grade exactly as PlayStation publishes them, as mirrored by Exophase and PSNProfiles.
- **A guide for every trophy in our own words**, each citing its sources (Exophase, PSNProfiles, KeenGamer, Output Lag, GTA Vice City Hub, Push Square). No guide text is copied from another guide.
- **A roadmap to the Platinum** in five stages — story, strangers, collectibles, activities, cleanup — built from the official descriptions.
- **One missable trophy, flagged loud**: Positive Mental Attitude. One meditation spot (Lucia's balcony) is only reachable in Chapter 1, and there is no mission replay — do it before Chapter 1 ends.
- **A tracker**: tick trophies off, progress saves in localStorage, export it to a file and import it back. Filter by kind (story, strangers, collectibles, activities, robbery, exploration, cleanup) and grade, search by name, and switch on spoiler-safe mode to hide story trophies until earned.
- **Fully offline**: static files under `app/`, no network requests, no external fonts or assets. Open `app/index.html` in desktop Chrome with the network off and everything works.

## Ground rules (from the sources)

- No online trophies: all 55 are single-player.
- No difficulty trophies, no mission medals, no mission replay, no New Game Plus — keep a manual save at the start of every chapter.
- Platinum time is roughly 200 hours: long grinds, not hard ones.
- Cheats switch trophies off.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library. The build is deterministic: two runs over the same tree write identical bytes.

## Sources

Names, descriptions and grades: Exophase and PSNProfiles trophy lists. Roadmap, missable warning and counts: KeenGamer's GTA 6 Trophy Guide & Platinum Roadmap, Output Lag's GTA 6 Trophy List, GTA Vice City Hub's GTA 6 Achievements, and Push Square's report of the PS5 list (18 Nov 2026). All guide text is original to this entry. No Rockstar logo, artwork or game screenshot is used anywhere.

## License

MIT — see `LICENSE`.
