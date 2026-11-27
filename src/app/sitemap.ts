import type { MetadataRoute } from 'next';
import { REAL_PORTRAIT_ASSETS } from '@/config/seo';
import { SITE_URL } from '@/config/site';
import { portfolioService } from '@/services';

function toAbsoluteAssetUrl(pathOrUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${SITE_URL}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await portfolioService.getPortfolioData();
  const now = new Date();

  const portraitUrls = REAL_PORTRAIT_ASSETS.map((asset) => asset.url);
  const projectImageUrls = data.projects
    .map((project) => project.image)
    .filter((img): img is string => Boolean(img && img.trim()))
    .map(toAbsoluteAssetUrl);

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
      images: [...portraitUrls, ...projectImageUrls.slice(0, 6)],
    },
    {
      url: `${SITE_URL}/projects`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
      images: projectImageUrls,
    },
    {
      url: `${SITE_URL}/resume`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
      images: portraitUrls,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
