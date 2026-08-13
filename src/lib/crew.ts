import { getCollection, type CollectionEntry } from 'astro:content';
import { IMAGE_EXT, toResponsiveImage, type GlobModule, type ResponsiveImage } from './scan';

export type CrewMemberEntry = CollectionEntry<'crew'>;

export type CrewRole = 'crew' | 'coach' | 'mentor';

export interface CrewMember {
  key: string;
  role: CrewRole;
  title?: string;
  first: string;
  last: string;
  nickname?: string;
}

/**
 * All crew entries from the `crew` content collection (one `bio.md` per
 * person in `src/content/crew/<crew|officers>/<key>/`), sorted by roster order.
 * The folder — `crew/` or `officers/` — decides which roster column a member
 * appears in.
 */
export async function getCrewCollection(): Promise<CrewMemberEntry[]> {
  const entries = await getCollection('crew');
  return [...entries]
    .filter((entry) => !entry.data.hidden)
    .sort((a, b) => a.data.order - b.data.order);
}

/** Map a content entry onto the shape the roster component renders. */
export function toCrewMember(entry: CrewMemberEntry): CrewMember {
  const [folder, key] = entry.id.split('/');
  return {
    key,
    role: entry.data.role ?? (folder === 'officers' ? 'coach' : 'crew'),
    title: entry.data.title,
    first: entry.data.first,
    last: entry.data.last,
    nickname: entry.data.nickname,
  };
}

const photos = import.meta.glob('../content/crew/**/*', { eager: true }) as Record<
  string,
  GlobModule
>;

/**
 * Photos dropped into `src/content/crew/<crew|officers>/<key>/` are picked up
 * at build time. The `<key>` folder name must match the person's `bio.md`
 * folder. Returns a map of member key → list of optimized photo objects.
 */
export async function getCrewPhotos(): Promise<Record<string, ResponsiveImage[]>> {
  const result: Record<string, ResponsiveImage[]> = {};
  for (const [path, mod] of Object.entries(photos)) {
    const match = path.match(/(?:^|\/)crew\/([^/]+)\/([^/]+)\/([^/]+)$/);
    if (!match) continue;
    const [, , key, base] = match;
    if (IMAGE_EXT.test(base)) {
      const optimized = await toResponsiveImage(mod, {
        widths: [256, 384, 512, 768, 1024],
        sizes: '(min-width: 640px) 33vw, 47vw',
      });
      if (optimized) (result[key] ??= []).push(optimized);
    }
  }
  return result;
}
