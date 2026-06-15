import { expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface PortfolioProject {
  name: string;
  featured?: boolean;
  live_preview: string | null;
  repository: string;
}

interface PortfolioDataFile {
  site: {
    title: string;
    nav: Array<{ label: string; link: string }>;
    policies: {
      terms: { heading: string };
      privacy: { heading: string };
    };
  };
  profile: {
    name: string;
    subtitle: string;
  };
  projects: PortfolioProject[];
  services: Array<{ title: string }>;
  testimonials: Array<{ name: string; feedback: string }>;
  contact: {
    email: string;
    phone: string;
    location: string;
  };
}

export const portfolioData = JSON.parse(
  readFileSync(resolve(process.cwd(), 'public/data.json'), 'utf-8'),
) as PortfolioDataFile;

export const featuredProjects = portfolioData.projects.filter((project) => project.featured);
export const secondaryProjects = portfolioData.projects.filter((project) => !project.featured);

export async function waitForHomeReady(page: Page) {
  await page.goto('/');
  await expect(page.locator('#hero')).toBeVisible({ timeout: 20_000 });
}

export async function scrollToSection(page: Page, sectionId: string) {
  await page.locator(`#${sectionId}`).scrollIntoViewIfNeeded();
  await expect(page.locator(`#${sectionId}`)).toBeVisible();
}
