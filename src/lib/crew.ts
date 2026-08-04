import { getCollection, type CollectionEntry } from 'astro:content';
import { IMAGE_EXT, toUrl, type GlobModule } from './scan';

export type CrewMemberEntry = CollectionEntry<'crew'>;

export interface CrewMember {
  key: string;
  title?: string;
  first: string;
  last: string;
  nickname?: string;
}

/**
 * All crew entries from the `crew` content collection (one `bio.md` per
 * person in `src/content/crew/<key>/`), sorted by their roster order.
 */
export async function getCrewCollection(): Promise<CrewMemberEntry[]> {
  const entries = await getCollection('crew');
  return [...entries].sort((a, b) => a.data.order - b.data.order);
}

/** Map a content entry onto the shape the roster component renders. */
export function toCrewMember(entry: CrewMemberEntry): CrewMember {
  return {
    key: entry.id.split('/')[0],
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
 * Photos dropped into `src/content/crew/<key>/` are picked up at build time.
 * The `<key>` folder name must match the person's `bio.md` folder.
 * Returns a map of member key → list of photo URLs.
 */
export function getCrewPhotos(): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [path, mod] of Object.entries(photos)) {
    const match = path.match(/(?:^|\/)crew\/([^/]+)\/([^/]+)$/);
    if (!match) continue;
    const [, key, base] = match;
    if (IMAGE_EXT.test(base)) {
      (result[key] ??= []).push(toUrl(mod));
    }
  }
  return result;
}
