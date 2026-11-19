// Leonida — GTA VI trophy guide & tracker (gta6-trophy-guide-01).
// The guide itself is this directory's app/ folder: plain static files that any
// static server can serve (app/index.html at the root), fully offline — no build
// step, no network request at run time. Its trophy list and guides live in
// app/data/trophies.json, the roadmap in app/data/roadmap.json, and the tracker
// in app/app.js. This program hands the entry in: it copies app/ and screenshots/
// from beside this file into /output and writes /output/dossier.json, the summary
// the judge reads, using the vendored make.fun library. vendor/makefun-frontend.ts
// must stay exactly as it is — the scorer requires dossier.json to be byte for
// byte what its own copy writes.
//
// Node 22, standard library only. Outside the grader's container,
// MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): text_max_bytes shapes the outline
// bytes; the other limits refuse an entry the scorer would refuse — more than 4
// screenshots or one over 256 KiB, more than 993 files and directories in app/,
// or more than 48 MiB of app files (app/ counts beside /output's own 1000-entry
// cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
