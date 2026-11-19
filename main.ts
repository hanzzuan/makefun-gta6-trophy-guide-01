// Leonida — the GTA VI trophy guide entry (Node 22, standard library only).
//
// What this program does: it takes the guide in this directory — the static
// files under app/ (index.html, app.js, style.css, data/trophies.json and
// data/roadmap.json) plus the screenshots/ renders — and copies them into the
// output directory, then writes /output/dossier.json, the summary the judge
// reads (screenshots, the first load's files and bytes, and the source).
// The dossier is built with the vendored make.fun library, which must be left
// untouched: the scorer requires dossier.json to be byte for byte what its
// own copy of that library writes.
//
// The guide itself is fully offline: it loads nothing over the network, and
// the app reads its trophy list and roadmap from the local JSON files.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output.)
// Serve the app with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const root = fileURLToPath(new URL(".", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Copy the whole guide and its screenshots into the output directory.
mkdirSync(outputDir, { recursive: true });
cpSync(join(root, "app"), join(outputDir, "app"), { recursive: true });
mkdirSync(join(outputDir, "screenshots"), { recursive: true });
if (existsSync(join(root, "screenshots"))) {
  cpSync(join(root, "screenshots"), join(outputDir, "screenshots"), { recursive: true });
}

// The scorer's caps (from reference/gate.json): at most 4 screenshots, each
// at most 256 KiB; at most 993 files and directories in app/, at most 48 MiB
// of app files. The text cap shapes the dossier's byte counts.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, "dossier.json"), dossier);
