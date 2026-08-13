import { IMAGE_EXT, firstImage, toResponsiveImage, type GlobModule, type ResponsiveImage } from './scan';

export type LogoVariant = 'light' | 'dark';

/**
 * The Brickwave ship photo. Drop one image into `src/content/ship/` and it
 * appears in the Ship section on the next build — no code changes needed.
 */
const shipModules = import.meta.glob('../content/ship/**/*', { eager: true }) as Record<
  string,
  GlobModule
>;

/**
 * Team logos for two surfaces. Drop logos into:
 *   src/content/logos/light/  → shown on light backgrounds (navbar)
 *   src/content/logos/dark/   → shown on dark backgrounds (footer)
 * The first image found in each folder wins.
 */
const logoModules = import.meta.glob('../content/logos/**/*', { eager: true }) as Record<
  string,
  GlobModule
>;

/**
 * The ship photo, optimized. Only the largest size is returned — it backs the
 * WebGL model as a static fallback, so a single responsive source is enough.
 */
export async function getShipPhoto(): Promise<ResponsiveImage | null> {
  const key = Object.keys(shipModules).find((path) => IMAGE_EXT.test(path));
  if (!key) return null;
  return toResponsiveImage(shipModules[key], {
    widths: [480, 768, 1024],
    sizes: '(min-width: 768px) 40vw, 90vw',
  });
}

/**
 * The team logo for a surface, optimized and responsively sized so the navbar
 * and footer no longer ship a ~350 KB full-res PNG for a 42 px circle.
 */
export async function getLogo(variant: LogoVariant): Promise<ResponsiveImage | null> {
  const folder = `logos/${variant}/`;
  const key = Object.keys(logoModules).find(
    (path) => path.includes(folder) && IMAGE_EXT.test(path),
  );
  if (!key) return null;
  const sizes = variant === 'light' ? '42px' : '13rem';
  const widths = variant === 'light' ? [64, 128, 256] : [160, 320, 480];
  return toResponsiveImage(logoModules[key], { widths, sizes });
}

/** Kept for callers that only need the raw URL (e.g. READMEs). */
export function getShipPhotoUrl(): string | null {
  return firstImage(shipModules);
}
