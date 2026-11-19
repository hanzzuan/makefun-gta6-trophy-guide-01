// VICE — the gta6-trophy-guide-01 hand-in program (Node 22, standard library only).
// The guide itself is plain static files in app/ (index.html, app.js, style.css and
// the data files), and the screenshots are in screenshots/. This program copies both
// into the output directory and writes dossier.json with the kit's vendored library,
// which is the summary the judge reads. vendor/makefun-frontend.ts stays untouched:
// the scorer rebuilds the dossier with its own copy and compares the two byte for byte.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR set:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The gate's caps, as the kit's reference/gate.json sets them: at most 4 screenshots,
// each at most 256 KiB, app/ at most 993 files and 48 MiB, and the dossier text at
// most 163,840 bytes.
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
