const TEST_SITE_KEY = '1x00000000000000000000AA';

export function getTurnstileSiteKey(): string {
  const configuredKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();

  if (configuredKey) {
    return configuredKey;
  }

  if (import.meta.env.DEV) {
    return TEST_SITE_KEY;
  }

  return '';
}

export function isTurnstileConfigured(): boolean {
  return Boolean(getTurnstileSiteKey());
}
