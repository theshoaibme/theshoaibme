/** Cloudflare dummy keys always show the "For testing only" banner — never use these. */
const TURNSTILE_TEST_SITE_KEYS = new Set([
  '1x00000000000000000000AA',
  '2x00000000000000000000AB',
  '3x00000000000000000000FF',
]);

export function isTurnstileTestSiteKey(siteKey: string): boolean {
  return TURNSTILE_TEST_SITE_KEYS.has(siteKey.trim());
}

export function getTurnstileSiteKey(): string {
  const configuredKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? '';

  if (!configuredKey || isTurnstileTestSiteKey(configuredKey)) {
    return '';
  }

  return configuredKey;
}

export function isTurnstileConfigured(): boolean {
  return Boolean(getTurnstileSiteKey());
}

export function getTurnstileSetupMessage(): string {
  const configuredKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? '';

  if (!configuredKey) {
    return 'Add your Cloudflare Turnstile site key to .env as VITE_TURNSTILE_SITE_KEY (see .env.example).';
  }

  if (isTurnstileTestSiteKey(configuredKey)) {
    return 'Replace the Turnstile test key with your real site key from Cloudflare Dashboard → Turnstile.';
  }

  return 'Security verification is not configured.';
}
