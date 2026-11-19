// Leonida Legend — the GTA VI trophy guide entry for make.fun gta6-trophy-guide-01.
//
// The guide itself is plain static files in app/ (index.html, style.css, app.js and
// data/trophies.json + data/roadmap.json): a browser opens app/index.html and the whole
// guide works offline, loading nothing over the network. This program hands it in: it
// copies app/ and screenshots/ from beside this file to /output and writes
// /output/dossier.json with the vendored make.fun library, exactly as the kit's
// starter does. vendor/makefun-frontend.ts is the kit's copy and must stay unchanged —
// the scorer rebuilds the dossier from its own copy and compares the two byte for byte.
//
// Node 22, standard library only; no network, no install step. Outside the grader's
// container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The build is deterministic on purpose: the same repository always produces the same
// /output bytes. Two rules keep it that way — the copy is a plain recursive copy with
// no timestamps or ordering of its own, and the dossier is written by buildDossier from
// the copied files, so re-running the program over the same tree writes identical bytes.
// If either rule ever broke, the grader's two runs would disagree and the entry would
// fail before any judge saw it, so the check step runs the program twice and diffs
// the two outputs.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Resolve the two inputs relative to this file, never relative to the caller's
// working directory: the grader runs the program from the repository root, but a
// local run from anywhere else must hand in the same files.
const appDir = join(here, 'app');
const shotsDir = join(here, 'screenshots');

if (!existsSync(appDir) || !statSync(appDir).isDirectory()) {
  throw new Error('app/ is missing: the guide lives in app/ beside main.ts');
}
if (!existsSync(join(appDir, 'index.html'))) {
  throw new Error('app/index.html is missing: the guide must open at app/index.html');
}
if (!existsSync(join(appDir, 'data', 'trophies.json'))) {
  throw new Error('app/data/trophies.json is missing: the 55 trophies live there');
}

// A screenshot is only a screenshot if it is a real file the maker took: refuse a
// directory that holds anything but PNG/JPEG files, and refuse an empty set, so a
// half-finished build fails loudly here instead of silently handing in nothing.
const shotFiles = existsSync(shotsDir) ? readdirSync(shotsDir).filter((name) => !name.startsWith('.')) : [];
if (shotFiles.length < 3 || shotFiles.length > 4) {
  throw new Error(`screenshots/ must hold 3 or 4 images, found ${shotFiles.length}`);
}
for (const name of shotFiles) {
  const lower = name.toLowerCase();
  if (!lower.endsWith('.png') && !lower.endsWith('.jpg') && !lower.endsWith('.jpeg')) {
    throw new Error(`screenshots/${name} is not a PNG or JPEG image`);
  }
  const shotPath = join(shotsDir, name);
  if (!statSync(shotPath).isFile()) {
    throw new Error(`screenshots/${name} is not a regular file`);
  }
  // The gate caps each screenshot at 256 KiB: catch an oversized render here, while
  // the file can still be re-taken, instead of handing in an entry the scorer refuses.
  if (statSync(shotPath).size > 262144) {
    throw new Error(`screenshots/${name} is over the 256 KiB cap — re-take it smaller`);
  }
}

mkdirSync(out, { recursive: true });
cpSync(appDir, join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes;
// the others refuse an entry the scorer would refuse (more than 4 screenshots or one
// over 256 KiB; more than 993 files and directories in app/ or 48 MiB of app files:
// app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
