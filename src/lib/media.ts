import { IMAGE_EXT, VIDEO_EXT, toUrl, toResponsiveImage, type GlobModule, type ResponsiveImage } from './scan';

export interface MediaImageItem extends ResponsiveImage {
  type: 'image';
  caption: string;
}

export interface MediaVideoItem {
  type: 'video';
  caption: string;
  src: string;
}

export type MediaItem = MediaImageItem | MediaVideoItem;

const GALLERY_WIDTHS = [256, 384, 512, 768, 1024];
// Grid thumbnails: 4-up on large screens, 3-up on tablets, 2-up on phones.
const GALLERY_SIZES = '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 47vw';

const modules = import.meta.glob('../content/MEDIA/**/*', { eager: true }) as Record<
  string,
  GlobModule
>;

function toCaption(filename: string): string {
  return filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
}

/**
 * Every file dropped into `src/content/MEDIA/` is picked up automatically at
 * build time — no code changes needed. Photos and videos are detected by file
 * extension; anything else is ignored. Photos are optimized through Astro's
 * image service (WebP + responsive srcset) so the browser never downloads the
 * full-res original for a small thumbnail.
 */
export async function getMedia(): Promise<MediaItem[]> {
  const items = await Promise.all(
    Object.keys(modules).map(async (key) => {
      const base = key.split('/').pop() ?? key;
      if (IMAGE_EXT.test(base)) {
        const optimized = await toResponsiveImage(modules[key], {
          widths: GALLERY_WIDTHS,
          sizes: GALLERY_SIZES,
        });
        return optimized
          ? { type: 'image' as const, caption: toCaption(base), ...optimized }
          : null;
      }
      if (VIDEO_EXT.test(base)) {
        const item: MediaVideoItem = {
          type: 'video',
          src: toUrl(modules[key]),
          caption: toCaption(base),
        };
        return item;
      }
      return null;
    }),
  );

  return items
    .filter((item): item is MediaItem => item !== null)
    .sort((a, b) => a.caption.localeCompare(b.caption, undefined, { numeric: true }));
}
