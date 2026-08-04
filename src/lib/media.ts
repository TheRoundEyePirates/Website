export interface MediaItem {
  src: string;
  type: 'image' | 'video';
  caption: string;
}

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|bmp|svg)$/i;
const VIDEO_EXT = /\.(mp4|webm|ogg|mov|m4v)$/i;

type GlobModule = { default: string | { src: string } };

const modules = import.meta.glob('../content/MEDIA/**/*', { eager: true }) as Record<string, GlobModule>;

/** Astro can hand us either a plain URL string or an image-metadata object. */
function toUrl(module: GlobModule): string {
  const value = module.default;
  return typeof value === 'string' ? value : value.src;
}

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
        return { src: toUrl(modules[key]), type: 'image' as const, caption: toCaption(base) };
      }
      if (VIDEO_EXT.test(base)) {
        return { src: toUrl(modules[key]), type: 'video' as const, caption: toCaption(base) };
      }
      return null;
    })
    .filter((item): item is MediaItem => item !== null)
    .sort((a, b) => a.caption.localeCompare(b.caption, undefined, { numeric: true }));
}
