# Leonida — GTA VI Trophy Guide & Tracker

[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/hanzzuan/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/hanzzuan/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies in Grand Theft Auto VI, built for make.fun's "GTA 6 trophy guide" bounty ($250 in USDC, top 50 paid).

## What it is

**Leonida** is a single static site — no build step, no network requests, nothing to install. Open `app/index.html` and it works. It has three parts:

- **A guide for every trophy.** All 55 trophies, each with its official name, description and grade, and a guide written for this entry in our own words. Every guide cites its sources beside the trophy. Two trophies — *Bad Luck, I Guess* and *Ten Pin* — had no confirmed method at launch, and their guides say so honestly instead of inventing one.
- **A road to the platinum.** Three stages — Story (Chapters 1–5), Cleanup (the 100% push), Mop-up (the fiddly ones) — with hours, the trophies in each stage, and the tips that matter. Around 200 hours at a 4/10 difficulty; no online trophy is required.
- **A tracker.** Tick trophies off and the progress saves in your browser (localStorage), with a progress ring and grade counts, search, filters by kind / grade / stage, an earned-only view, a spoiler setting that hides story trophy names and descriptions until you earn them, and export / import / reset of your progress as JSON.

One thing to know before you start: **Positive Mental Attitude is the only missable trophy.** Meditate on the balcony in Chapter 1 the first chance you get — once you leave Chapter 1, that spot is gone for the playthrough. The guide warns you about it up front, in the header and in the roadmap.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

Or open `app/index.html` directly in a browser.

To build the submission output (copies `app/` and `screenshots/` to the output directory and writes `dossier.json`):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` is Node 22, standard library only. The dossier is written by the vendored `vendor/makefun-frontend.ts`, left untouched.

## Sources

- [PowerPyx — GTA 6 Trophy Guide & Roadmap](https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/)
- [PowerPyx — GTA 6 100% Completion Checklist & Guide](https://www.powerpyx.com/gta-6-100-completion-checklist-guide/)
- [GTABase — GTA 6 Achievements & Trophies List](https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series)

Trophy names, descriptions and grades are the official ones as published on PlayStation Network, cross-checked on Exophase and PSNProfiles on 18 November 2026.

## Notes

- Unofficial fan guide. Grand Theft Auto and GTA are trademarks of Take-Two Interactive. No Rockstar artwork, logos or game screenshots are used here.
- The guide is fully offline: it loads nothing over the network, and the app reads its data from the local `app/data/trophies.json` and `app/data/roadmap.json`.
