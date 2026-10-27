import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env.CI);
const port = isCI ? 4173 : 5173;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [['github'], ['list']] : [['list']],
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: isCI
    ? [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
    : [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
      ],
  webServer: {
    command: isCI
      ? 'pnpm build && pnpm preview -- --host 127.0.0.1 --port 4173'
      : 'pnpm dev -- --host 127.0.0.1 --port 5173',
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: isCI ? 180_000 : 120_000,
    env: {
      GITHUB_REPOSITORY: process.env.GITHUB_REPOSITORY ?? 'theshoaibme/theshoaibme.github.io',
      VITE_TURNSTILE_SITE_KEY: process.env.VITE_TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA',
      VITE_CONTACT_API_URL:
        process.env.VITE_CONTACT_API_URL ?? 'https://portfolio-contact-api.theshoaibme.workers.dev',
      VITE_CDN_BASE_URL: process.env.VITE_CDN_BASE_URL ?? '',
      VITE_CLOUDINARY_CLOUD_NAME: process.env.VITE_CLOUDINARY_CLOUD_NAME ?? '',
    },
  },
});
