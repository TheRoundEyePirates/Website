import { IMAGE_EXT, VIDEO_EXT, toUrl, type GlobModule } from './scan';

export interface MediaItem {
  src: string;
  type: 'image' | 'video';
  caption: string;
  width?: number;
  height?: number;
}

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
 * extension; anything else is ignored.
 */
export function getMedia(): MediaItem[] {
  return Object.keys(modules)
    .map((key) => {
      const base = key.split('/').pop() ?? key;
      if (IMAGE_EXT.test(base)) {
        const value = modules[key].default;
        const meta = typeof value === 'object' ? value : null;
        const item: MediaItem = {
          src: toUrl(modules[key]),
          type: 'image',
          caption: toCaption(base),
          width: meta?.width,
          height: meta?.height,
        };
        return item;
      }
      if (VIDEO_EXT.test(base)) {
        const item: MediaItem = {
          src: toUrl(modules[key]),
          type: 'video',
          caption: toCaption(base),
        };
        return item;
      }
      return null;
    })
    .filter((item): item is MediaItem => item !== null)
    .sort((a, b) => a.caption.localeCompare(b.caption, undefined, { numeric: true }));
}
