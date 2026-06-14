// Optimize the gallery images referenced by the photo manifests.
//
// Why: the manifests point at raw camera originals (up to ~30 MP / multi-MB).
// Those are downscaled to small collage cells in the browser, so shipping them
// full-size wastes bandwidth and stalls the rotating showcase. This script
// resizes any oversized referenced image to fit within MAX_EDGE on its longest
// side and re-encodes it (mozjpeg q85) — visually lossless at display size.
//
// It edits files in place but keeps the same filename/format, so the manifest
// `src` paths never change. Aspect ratios are preserved (EXIF orientation is
// baked in via .rotate()), so the manifest `ar` values stay valid too.
//
// Idempotent: images already within MAX_EDGE are skipped, so re-running after
// adding new photos won't re-compress (and degrade) the existing ones.
//
// Usage:
//   node scripts/optimize-images.mjs            # optimize in place
//   node scripts/optimize-images.mjs --dry-run  # report only, change nothing

import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { photos } from '../src/data/photoManifest.js';
import { outdoorsPhotos } from '../src/data/outdoorsManifest.js';

const MAX_EDGE = 2048; // longest side, in px — retina-crisp for the largest cell
const JPEG_QUALITY = 85;
const DRY_RUN = process.argv.includes('--dry-run');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcs = [...new Set([...photos, ...outdoorsPhotos].map((p) => p.src))];

const mb = (b) => (b / 1048576).toFixed(2);
let before = 0, after = 0, resized = 0, skipped = 0, errors = 0;

for (const src of srcs) {
  const file = path.join(root, 'public', src);
  try {
    // Read into a buffer first: on Windows sharp keeps the source file mmap'd,
    // which blocks writing back to the same path. A detached buffer avoids that.
    const input = await fs.readFile(file);
    const orig = input.length;
    const meta = await sharp(input).metadata();
    const longest = Math.max(meta.width, meta.height);
    before += orig;

    if (longest <= MAX_EDGE && orig < 600 * 1024) {
      skipped++; after += orig;
      continue; // already small in both dimensions and bytes — leave untouched
    }

    const ext = path.extname(file).toLowerCase();
    let pipe = sharp(input).rotate(); // bake EXIF orientation into pixels
    if (longest > MAX_EDGE) {
      pipe = pipe.resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true });
    }
    if (ext === '.png') {
      pipe = pipe.png({ compressionLevel: 9, palette: true });
    } else {
      pipe = pipe.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
    }

    const buf = await pipe.toBuffer();
    after += buf.length;
    resized++;
    const out = await sharp(buf).metadata();
    const ar = +(out.width / out.height).toFixed(3);
    console.log(
      `${DRY_RUN ? '[dry] ' : ''}${src}\n` +
      `      ${meta.width}x${meta.height} ${mb(orig)}MB  ->  ${out.width}x${out.height} ${mb(buf.length)}MB  (ar ${ar})`
    );
    if (!DRY_RUN) await fs.writeFile(file, buf);
  } catch (e) {
    errors++;
    console.log(`ERR ${src}: ${e.message}`);
  }
}

console.log(
  `\n${DRY_RUN ? 'DRY RUN — ' : ''}${srcs.length} manifest images: ` +
  `${resized} optimized, ${skipped} skipped, ${errors} errors`
);
console.log(`Total: ${mb(before)}MB -> ${mb(after)}MB  (saved ${mb(before - after)}MB)`);
