import { IMAGE_EXT, firstImage, toUrl, type GlobModule } from './scan';

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

export function getShipPhoto(): string | null {
  return firstImage(shipModules);
}

export function getLogo(variant: LogoVariant): string | null {
  const folder = `logos/${variant}/`;
  const key = Object.keys(logoModules).find(
    (path) => path.includes(folder) && IMAGE_EXT.test(path),
  );
  return key ? toUrl(logoModules[key]) : null;
}
