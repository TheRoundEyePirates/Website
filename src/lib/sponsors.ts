import { IMAGE_EXT, toResponsiveImage, type GlobModule, type ResponsiveImage } from './scan';

const LOGO_WIDTHS = [64, 128, 256];
const LOGO_SIZES = '(min-width: 1024px) 128px, 96px';

// Auto-detect logos from sponsor media folders.
// Any image file in the media/logo folder of a sponsor is picked up.
const logoModules = import.meta.glob('../content/sponsors/*/media/logo/*', {
  eager: true,
}) as Record<string, GlobModule>;

// Extract the sponsor slug from a logo path.
function sponsorSlug(path: string): string | null {
  const match = path.match(/content\/sponsors\/([^/]+)\/media\/logo\//);
  return match ? match[1] : null;
}

// Get the optimized logo for a sponsor by slug.
// Returns null if no logo file exists in the sponsor's media/logo folder.
export async function getSponsorLogo(slug: string): Promise<ResponsiveImage | null> {
  const key = Object.keys(logoModules).find((path) => {
    const s = sponsorSlug(path);
    return s === slug && IMAGE_EXT.test(path);
  });
  if (!key) return null;
  return toResponsiveImage(logoModules[key], {
    widths: LOGO_WIDTHS,
    sizes: LOGO_SIZES,
  });
}
