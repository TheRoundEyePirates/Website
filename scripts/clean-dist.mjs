import { readdir, unlink } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// The raw originals are globbed eagerly so they land in `dist/_astro/` next to
// their optimized WebP variants, but no page references them anymore. Drop the
// dead-weight copies from the deploy output.
const dir = fileURLToPath(new URL('../dist/_astro/', import.meta.url));
const raw = new Set(['.jpg', '.jpeg', '.png', '.gif', '.avif', '.bmp']);

try {
  for (const file of await readdir(dir)) {
    if (raw.has(extname(file).toLowerCase())) {
      await unlink(join(dir, file));
    }
  }
  console.log('[clean-dist] removed raw image copies from dist/_astro');
} catch {
  console.log('[clean-dist] no dist/_astro dir, skipping');
}
