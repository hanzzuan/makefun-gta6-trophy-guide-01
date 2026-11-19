# VICE — GTA VI Trophy Guide &amp; Tracker

[![make.fun](https://make.fun/badge/competition/gta6-trophy-guide-01)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun](https://make.fun/badge/submissions/gta6-trophy-guide-01)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun](https://make.fun/badge/owner/hanzzuan)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI, built for the [make.fun GTA 6 trophy guide bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

- **Every trophy, with its official name, description and grade** — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden — and a guide to each in our own words that cites its sources.
- **A tracker** — tick trophies off, progress saved in the browser (localStorage), exportable to a file and importable back.
- **Filters** — by kind (story, collectibles, activities, missable), by grade, by search, and an earned-only view.
- **A spoiler setting** — hides the names and descriptions of story trophies until they are earned.
- **A roadmap to the platinum** — three stages (story, cleanup, mop-up), about 200 hours, built from the official descriptions.
- **One missable trophy, flagged** — Positive Mental Attitude: meditate at the Chapter 1 balcony spot before Chapter 1 ends.

## How it is built

Plain static files under `app/` — no build step, no network at run time. Serve `app/` with any static server (`node serve.ts` opens it at http://localhost:8080) and it works with the network off. `main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored library.

## Sources

Guides cite PowerPyx's GTA 6 Trophy Guide & Roadmap and 100% Completion Checklist, GTABase's GTA 6 Achievements & Trophies List, Exophase and PSNProfiles. A source is cited, never copied. Two trophies (Bad Luck, I Guess and Ten Pin) had no confirmed method at launch — their guides say so honestly instead of guessing.

## License

MIT — see `LICENSE`.
