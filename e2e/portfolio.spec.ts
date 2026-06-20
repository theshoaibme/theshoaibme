import { expect, test } from '@playwright/test';
import {
  clickHeaderNavLink,
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
    await clickHeaderNavLink(page, 'Services');
    await expect(page).toHaveURL(/#services$/);
    await expect(page.locator('#services-title')).toBeVisible();

    await clickHeaderNavLink(page, 'Portfolio');
    await expect(page).toHaveURL(/#portfolio$/);
    await expect(page.locator('#portfolio-title')).toBeVisible();
  });

  test('restores hash section after reload', async ({ page }) => {
    for (const sectionId of ['services', 'portfolio', 'contact']) {
      await page.goto(`/#${sectionId}`);
      await expect(page.locator(`#${sectionId}`)).toBeVisible({ timeout: 20_000 });
      await expect(page).toHaveURL(new RegExp(`#${sectionId}$`));

      await page.reload();
      await expect(page).toHaveURL(new RegExp(`#${sectionId}$`));
      await expect(page.locator(`#${sectionId}-title, #${sectionId} .section-title`).first()).toBeVisible({
        timeout: 20_000,
      });

      const sectionBox = await page.locator(`#${sectionId}`).boundingBox();
      expect(sectionBox).not.toBeNull();
      if (sectionBox) {
        expect(sectionBox.y).toBeLessThan(250);
      }
    }
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
    await expect(page.locator('#contact-name-error')).toContainText(/please enter your name/i);
    await expect(page.locator('#contact-status')).toContainText(/please enter your name/i);
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

test.describe('Resume page', () => {
  test('loads resume with download action', async ({ page }) => {
    await page.goto('/resume');
    await expect(page.getByRole('heading', { name: portfolioData.profile.name, level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Work Experience' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Download Resume/i })).toBeVisible();
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

  test('opens and closes the mobile navigation menu', async ({ page }) => {
    await waitForHomeReady(page);

    const nav = page.locator('#site-nav');
    const menuButton = page.getByRole('button', { name: /open menu/i });

    await expect(nav).not.toHaveClass(/active/);

    await menuButton.click();
    await expect(nav).toHaveClass(/active/);
    await expect(page.getByRole('button', { name: /close menu/i })).toBeVisible();

    await page.getByRole('button', { name: /close menu/i }).click();
    await expect(nav).not.toHaveClass(/active/);
  });
});
