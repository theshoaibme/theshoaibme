const TEST_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHhHUMcH6ARgxgd6d8LxF';

export function getRecaptchaSiteKey(): string {
  const configuredKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim();

  if (configuredKey) {
    return configuredKey;
  }

  if (import.meta.env.DEV) {
    return TEST_SITE_KEY;
  }

  return '';
}

export function isRecaptchaConfigured(): boolean {
  return Boolean(getRecaptchaSiteKey());
}
