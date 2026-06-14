// Optimize raster images under public/ to reduce payload and page lag.
//
// Why: many images are raw camera originals (up to ~30 MP / multi-MB) shown in
// far smaller slots. Shipping them full-size wastes bandwidth and stalls first
// paint, scrolling, and the rotating photo showcase.
//
// What it does, in place (filenames/formats unchanged, so no code path edits):
//   - Resizes anything whose longest edge exceeds MAX_EDGE to fit within it.
//   - JPEG  -> re-encode mozjpeg q85 (visually lossless at display size).
//   - PNG   -> re-encode lossless (no palette quantization), so diagrams,
//              screenshots, posters and photographic PNGs never band/posterize.
//   - Bakes EXIF orientation into pixels (.rotate()), so orientation is
//     consistent everywhere and matches the manifest aspect ratios.
//   - Leaves SVG / GIF / WebP / video / PDF untouched.
//
// Idempotent: images already within MAX_EDGE and under SKIP_BYTES are skipped,
// and a re-encode that would grow a file (and didn't resize) is discarded — so
// re-running after adding new images won't degrade or bloat existing ones.
//
// Usage:
//   node scripts/optimize-images.mjs            # optimize in place
//   node scripts/optimize-images.mjs --dry-run  # report only, change nothing

import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const MAX_EDGE = 2560;          // longest side in px — crisp even for hero backgrounds
const JPEG_QUALITY = 85;
const SKIP_BYTES = 800 * 1024;  // already-small files (under this AND within MAX_EDGE) are left alone
const DRY_RUN = process.argv.includes('--dry-run');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');

const entries = await fs.readdir(publicDir, { recursive: true, withFileTypes: true });
const files = entries
  .filter((e) => e.isFile() && /\.(jpe?g|png)$/i.test(e.name))
  .map((e) => path.join(e.parentPath ?? e.path, e.name));

const mb = (b) => (b / 1048576).toFixed(2);
let before = 0, after = 0, resized = 0, recompressed = 0, skipped = 0, errors = 0;

for (const file of files) {
  const rel = path.relative(publicDir, file).replace(/\\/g, '/');
  try {
    // Read into a buffer first: on Windows sharp keeps the source file mmap'd,
    // which blocks writing back to the same path. A detached buffer avoids that.
    const input = await fs.readFile(file);
    const orig = input.length;
    const meta = await sharp(input).metadata();
    const longest = Math.max(meta.width, meta.height);
    before += orig;

    if (longest <= MAX_EDGE && orig < SKIP_BYTES) {
      skipped++; after += orig;
      continue;
    }

    const ext = path.extname(file).toLowerCase();
    const willResize = longest > MAX_EDGE;
    let pipe = sharp(input).rotate(); // bake EXIF orientation into pixels
    if (willResize) {
      pipe = pipe.resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true });
    }
    pipe = ext === '.png'
      ? pipe.png({ compressionLevel: 9 })            // lossless
      : pipe.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });

    const buf = await pipe.toBuffer();

    // If we didn't resize and the re-encode wouldn't shrink it, keep the original.
    if (!willResize && buf.length >= orig) {
      skipped++; after += orig;
      continue;
    }

    after += buf.length;
    if (willResize) resized++; else recompressed++;
    const out = await sharp(buf).metadata();
    console.log(
      `${DRY_RUN ? '[dry] ' : ''}${rel}\n` +
      `      ${meta.width}x${meta.height} ${mb(orig)}MB  ->  ${out.width}x${out.height} ${mb(buf.length)}MB`
    );
    if (!DRY_RUN) await fs.writeFile(file, buf);
  } catch (e) {
    errors++;
    console.log(`ERR ${rel}: ${e.message}`);
  }
}

console.log(
  `\n${DRY_RUN ? 'DRY RUN — ' : ''}${files.length} raster files scanned: ` +
  `${resized} resized, ${recompressed} recompressed, ${skipped} skipped, ${errors} errors`
);
console.log(`Total: ${mb(before)}MB -> ${mb(after)}MB  (saved ${mb(before - after)}MB)`);
