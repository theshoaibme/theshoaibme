/** Production site URLs — both custom domain and GitHub Pages work. */
export const SITE_URL = 'https://theshoaib.me';

export const GITHUB_PAGES_URL = 'https://theshoaibme.github.io';

/** Custom domain for R2 image CDN (requires theshoaib.me zone on Cloudflare). */
export const IMAGE_CDN_URL = 'https://images.theshoaib.me';

/** Workers.dev fallback when custom domain DNS is not on Cloudflare yet. */
export const IMAGE_CDN_WORKERS_URL = 'https://portfolio-image-cdn.theshoaibme.workers.dev';

export const PRODUCTION_ORIGINS = [
  'https://theshoaib.me',
  'https://www.theshoaib.me',
  'https://theshoaibme.github.io',
  'https://www.theshoaibme.github.io',
] as const;

export const SITE_HOSTS = [
  'theshoaib.me',
  'www.theshoaib.me',
  'theshoaibme.github.io',
  'www.theshoaibme.github.io',
] as const;

export function isProductionHost(hostname: string): boolean {
  return (SITE_HOSTS as readonly string[]).includes(hostname);
}
