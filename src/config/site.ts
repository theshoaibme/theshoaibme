/** Production site URLs — both custom domain and GitHub Pages work. */
export const SITE_URL = 'https://theshoaib.me';

export const GITHUB_PAGES_URL = 'https://the-shoaib2.github.io';

export const PRODUCTION_ORIGINS = [
  'https://theshoaib.me',
  'https://www.theshoaib.me',
  'https://the-shoaib2.github.io',
  'https://www.the-shoaib2.github.io',
] as const;

export const SITE_HOSTS = [
  'theshoaib.me',
  'www.theshoaib.me',
  'the-shoaib2.github.io',
  'www.the-shoaib2.github.io',
] as const;

export function isProductionHost(hostname: string): boolean {
  return (SITE_HOSTS as readonly string[]).includes(hostname);
}
