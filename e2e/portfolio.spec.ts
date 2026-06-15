import { expect, test } from '@playwright/test';
import {
  featuredProjects,
  portfolioData,
  secondaryProjects,
  waitForHomeReady,
} from './helpers/site';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await waitForHomeReady(page);
  });

  test('loads portfolio data and hero content', async ({ page }) => {
    await expect(page).toHaveTitle(portfolioData.site.title);
    await expect(page.locator('#hero-name')).toContainText(portfolioData.profile.name);
    await expect(page.locator('#hero-desc')).toContainText(portfolioData.profile.description);
  });

  test('renders primary sections', async ({ page }) => {
    for (const sectionId of ['about', 'skills', 'services', 'portfolio', 'testimonials', 'contact']) {
      await expect(page.locator(`#${sectionId}`)).toBeAttached();
    }
  });

  test('shows site navigation links', async ({ page }) => {
    const nav = page.locator('#site-nav');

    for (const item of portfolioData.site.nav) {
      await expect(nav.getByRole('link', { name: item.label, exact: true })).toBeVisible();
    }
  });

  test('navigates to hash sections from the header', async ({ page }) => {
    await page.locator('#site-nav').getByRole('link', { name: 'Services', exact: true }).click();
    await expect(page).toHaveURL(/#services$/);
    await page.locator('#services').scrollIntoViewIfNeeded();
    await expect(page.locator('#services-title')).toBeVisible();

    await page.locator('#site-nav').getByRole('link', { name: 'Portfolio', exact: true }).click();
    await expect(page).toHaveURL(/#portfolio$/);
    await page.locator('#portfolio').scrollIntoViewIfNeeded();
    await expect(page.locator('#portfolio-title')).toBeVisible();
  });

  test('lists only featured projects on the home portfolio grid', async ({ page }) => {
    await page.locator('#portfolio').scrollIntoViewIfNeeded();
    const cards = page.locator('#portfolio-grid .project-card');

    await expect(cards).toHaveCount(featuredProjects.length);

    for (const project of featuredProjects) {
      await expect(page.locator('#portfolio-grid')).toContainText(project.name);
    }

    for (const project of secondaryProjects) {
      await expect(page.locator('#portfolio-grid')).not.toContainText(project.name);
    }
  });

  test('links featured projects to GitHub and live previews when available', async ({ page }) => {
    await page.locator('#portfolio').scrollIntoViewIfNeeded();

    for (const project of featuredProjects) {
      const card = page.locator('#portfolio-grid .project-card', { hasText: project.name });
      await expect(card.getByRole('link', { name: /Source/i })).toHaveAttribute('href', project.repository);

      if (project.live_preview) {
        await expect(card.getByRole('link', { name: /Live Preview Link/i })).toHaveAttribute(
          'href',
          project.live_preview,
        );
      }
    }
  });

  test('opens the full projects page from View All Projects', async ({ page }) => {
    await page.locator('#portfolio').scrollIntoViewIfNeeded();
    await page.getByRole('link', { name: /View All Projects/i }).click();

    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.getByRole('heading', { name: 'All Projects' })).toBeVisible();
  });

  test('renders services and testimonials content', async ({ page }) => {
    await page.locator('#services').scrollIntoViewIfNeeded();

    for (const service of portfolioData.services) {
      await expect(page.locator('#services')).toContainText(service.title);
    }

    await page.locator('#testimonials').scrollIntoViewIfNeeded();
    await expect(page.locator('#testimonials .testimonial-card').first()).toBeVisible();
    await expect(page.locator('#testimonials')).toContainText(portfolioData.testimonials[0].name);
  });

  test('shows contact details and validates the contact form', async ({ page }) => {
    await page.locator('#contact').scrollIntoViewIfNeeded();

    await expect(page.locator('#contact-info')).toContainText(portfolioData.contact.email);
    await expect(page.locator('#contact-info')).toContainText(portfolioData.contact.phone);
    await expect(page.locator('#contact-info')).toContainText(portfolioData.contact.location);

    await page.locator('#submit-btn').click();
    await expect(page.locator('#contact-status')).toContainText(/fill in all required fields/i);
  });

  test('prefills contact subject from a service inquiry CTA', async ({ page }) => {
    await page.locator('#services').scrollIntoViewIfNeeded();
    await page.locator('#services-grid .service-card').first().getByRole('link').click();
    await page.locator('#contact').scrollIntoViewIfNeeded();

    await expect(page.locator('#contact-subject')).not.toHaveValue('');
    await expect(page.locator('#contact-message')).not.toHaveValue('');
  });

  test('shows Turnstile after a valid contact form submission request', async ({ page }) => {
    await page.locator('#contact').scrollIntoViewIfNeeded();

    await page.locator('#contact-name').fill('E2E Tester');
    await page.locator('#contact-email').fill('e2e@example.com');
    await page.locator('#contact-message').fill('Automated portfolio end-to-end test message.');
    await page.locator('#submit-btn').click();

    await expect(page.locator('#contact-status')).toContainText(/security check/i);
    await expect(page.locator('.contact-turnstile.contact-turnstile--visible')).toBeVisible();
  });

  test('toggles light and dark theme from the footer', async ({ page }) => {
    await page.locator('.footer').scrollIntoViewIfNeeded();
    const root = page.locator('html');

    const initialDark = await root.evaluate((element) => element.classList.contains('dark'));
    await page.locator('#theme-toggle').click();

    if (initialDark) {
      await expect(root).not.toHaveClass(/dark/);
    } else {
      await expect(root).toHaveClass(/dark/);
    }

    await page.locator('#theme-toggle').click();

    if (initialDark) {
      await expect(root).toHaveClass(/dark/);
    } else {
      await expect(root).not.toHaveClass(/dark/);
    }
  });

  test('exposes footer policy links and social profiles', async ({ page }) => {
    await page.locator('.footer').scrollIntoViewIfNeeded();

    await expect(page.getByRole('link', { name: 'Terms of Service' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Privacy Policy' })).toBeVisible();
    await expect(page.locator('#footer-social a')).not.toHaveCount(0);
  });
});

test.describe('Projects page', () => {
  test('lists every project with navigation back to home', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.getByRole('heading', { name: 'All Projects' })).toBeVisible();

    const cards = page.locator('.projects-page-grid .project-card');
    await expect(cards).toHaveCount(portfolioData.projects.length);

    for (const project of portfolioData.projects) {
      await expect(page.locator('.projects-page-grid')).toContainText(project.name);
    }

    await page.getByRole('link', { name: /Back to Home/i }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('#hero')).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Policy pages', () => {
  test('loads terms of service', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: portfolioData.site.policies.terms.heading })).toBeVisible();
    await expect(page.getByRole('link', { name: /Back to Home/i })).toBeVisible();
  });

  test('loads privacy policy', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { name: portfolioData.site.policies.privacy.heading })).toBeVisible();
    await expect(page.getByRole('link', { name: /Back to Home/i })).toBeVisible();
  });
});

test.describe('Error handling', () => {
  test('shows a not found page for unknown routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByRole('heading', { name: 'Page Not Found' })).toBeVisible();
    await page.getByRole('link', { name: 'Back to Home' }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe('Mobile layout', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('renders home content and featured projects on mobile', async ({ page }) => {
    await waitForHomeReady(page);
    await page.locator('#portfolio').scrollIntoViewIfNeeded();

    await expect(page.locator('#portfolio-grid .project-card')).toHaveCount(featuredProjects.length);
    await expect(page.getByRole('link', { name: /View All Projects/i })).toBeVisible();
  });
});
