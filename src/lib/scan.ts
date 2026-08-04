export type GlobModule = {
  default: string | { src: string; width?: number; height?: number };
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
