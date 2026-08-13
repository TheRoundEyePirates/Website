import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

export type GlobModule = {
  default: string | ImageMetadata;
};

export const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|bmp|svg)$/i;
export const VIDEO_EXT = /\.(mp4|webm|ogg|mov|m4v)$/i;

/** Astro can hand us either a plain URL string or an image-metadata object. */
export function toUrl(module: GlobModule): string {
  const value = module.default;
  return typeof value === 'string' ? value : value.src;
}

/** First image found in a glob map, or null if the folder is empty. */
export function firstImage(modules: Record<string, GlobModule>): string | null {
  const key = Object.keys(modules).find((path) => IMAGE_EXT.test(path));
  return key ? toUrl(modules[key]) : null;
}

/**
 * Build-time optimized image. Every photo on the site is run through Astro's
 * image service so the browser only ever downloads a modern-format (WebP)
 * file sized for the space it actually occupies — no full-res JPEG/PNG blobs.
 */
export interface ResponsiveImage {
  /** Primary URL — the largest generated size. Good for lightboxes & fallbacks. */
  src: string;
  /** Full `srcset` attribute for responsive `<img>` tags. */
  srcSet: string;
  /** Matching `sizes` attribute. */
  sizes: string;
  width: number;
  height: number;
}

export interface ResponsiveImageOptions {
  /** Candidate widths for the `srcset`. Defaults to the image's natural width. */
  widths?: number[];
  /** The `sizes` attribute. Defaults to `100vw`. */
  sizes?: string;
  /** Output format. Defaults to `webp`. */
  format?: 'webp' | 'avif';
  /** Output quality. Defaults to `80`. */
  quality?: 'low' | 'mid' | 'high' | 'max' | number;
}

/**
 * Turn an image glob module into responsive, optimized props. Falls back to
 * `null` when the module is only a plain URL string (e.g. remote assets).
 */
export async function toResponsiveImage(
  module: GlobModule,
  options: ResponsiveImageOptions = {},
): Promise<ResponsiveImage | null> {
  const value = module.default;
  if (typeof value === 'string') return null;

  const meta = value as ImageMetadata;
  const { widths = [meta.width], sizes = '100vw', format = 'webp', quality = 80 } = options;
  // Never upscale past the source image.
  const maxWidth = Math.min(widths[widths.length - 1] ?? meta.width, meta.width);

  const result = await getImage({
    src: meta,
    layout: 'none',
    width: maxWidth,
    widths,
    format,
    quality,
  });

  const attributes = result.attributes as { width: number; height: number };
  return {
    src: result.src,
    srcSet: result.srcSet.attribute,
    sizes,
    width: attributes.width,
    height: attributes.height,
  };
}
