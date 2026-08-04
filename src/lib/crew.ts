import { IMAGE_EXT, toUrl, type GlobModule } from './scan';

const modules = import.meta.glob('../content/crew/**/*', { eager: true }) as Record<
  string,
  GlobModule
>;

/**
 * Photos dropped into `src/content/crew/<key>/` are picked up at build time.
 * The `<key>` folder name must match the member `key` in Crew.tsx.
 * Returns a map of member key → list of photo URLs.
 */
export function getCrewPhotos(): Record<string, string[]> {
  const photos: Record<string, string[]> = {};
  for (const [path, mod] of Object.entries(modules)) {
    const match = path.match(/(?:^|\/)crew\/([^/]+)\/([^/]+)$/);
    if (!match) continue;
    const [, key, base] = match;
    if (IMAGE_EXT.test(base)) {
      (photos[key] ??= []).push(toUrl(mod));
    }
  }
  return photos;
}
