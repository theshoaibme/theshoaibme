import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { waitForHomeReady } from './helpers/site';

interface PortfolioData {
  profile: { profileImage: string };
  projects: Array<{ image?: string }>;
  testimonials: Array<{ avatar: string }>;
  site: { favicon: string };
}

const portfolioData = JSON.parse(
  readFileSync(resolve(process.cwd(), 'data/portfolio.json'), 'utf-8'),
) as PortfolioData;

const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME ?? '';
const cdnBase =
  process.env.VITE_CDN_BASE_URL?.replace(/\/+$/, '') ??
  (cloudName ? `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto` : '');

function expectedSrc(localPath: string): string | RegExp {
  if (/^https?:\/\//i.test(localPath)) {
    return localPath;
  }

  const normalized = localPath.replace(/^public\//, '').replace(/^\/+/, '');

  if (cdnBase) {
    const assetPath = cdnBase.includes('res.cloudinary.com')
      ? normalized.replace(/\.[a-z0-9]+$/i, '')
      : normalized;
    return `${cdnBase}/${assetPath}`;
  }

  return new RegExp(`/${normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
}

test.describe('Image CDN integration', () => {
  test.beforeEach(async ({ page }) => {
    await waitForHomeReady(page);
  });

  test('hero profile image resolves and loads', async ({ page }) => {
    const heroImg = page.locator('#hero-img');
    await expect(heroImg).toBeVisible();

    const src = await heroImg.getAttribute('src');
    expect(src).toBeTruthy();

    if (cdnBase) {
      expect(src).toBe(expectedSrc(portfolioData.profile.profileImage) as string);
    }

    const response = await page.request.get(src!);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type'] ?? '').toMatch(/image\//);
  });

  test('featured project images load without broken requests', async ({ page }) => {
    await page.locator('#portfolio').scrollIntoViewIfNeeded();
    const images = page.locator('#portfolio-grid .project-card img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);

    for (let index = 0; index < count; index += 1) {
      const img = images.nth(index);
      const src = await img.getAttribute('src');
      expect(src).toBeTruthy();

      const response = await page.request.get(src!);
      expect(response.ok(), `broken image: ${src}`).toBeTruthy();
    }
  });

  test('testimonial avatars load', async ({ page }) => {
    await page.locator('#testimonials').scrollIntoViewIfNeeded();
    const avatar = page.locator('#testimonials .author-img').first();
    await expect(avatar).toBeVisible();

    const src = await avatar.getAttribute('src');
    expect(src).toBeTruthy();

    const response = await page.request.get(src!);
    expect(response.ok()).toBeTruthy();
  });
});
