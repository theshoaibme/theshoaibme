import type { Contact } from '@/types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+()\d\s.-]{7,}$/;

export type ContactInfoKey = keyof Contact;

export function getContactInfoHref(key: ContactInfoKey, value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  switch (key) {
    case 'email':
      return EMAIL_PATTERN.test(trimmed)
        ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(trimmed)}`
        : null;
    case 'phone': {
      const normalized = trimmed.replace(/[^\d+]/g, '');
      return PHONE_PATTERN.test(trimmed) && normalized.length >= 7 ? `tel:${normalized}` : null;
    }
    case 'location':
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
    default:
      return null;
  }
}

export function getSocialLabel(url: string, icon?: string): string {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('github.com')) return 'GitHub';
  if (lowerUrl.includes('linkedin.com')) return 'LinkedIn';
  if (lowerUrl.includes('telegram.me') || lowerUrl.includes('t.me')) return 'Telegram';
  if (lowerUrl.includes('instagram.com')) return 'Instagram';
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return 'X (Twitter)';
  if (lowerUrl.includes('facebook.com')) return 'Facebook';
  if (lowerUrl.includes('youtube.com')) return 'YouTube';
  if (icon) {
    const match = icon.match(/fa-([a-z0-9-]+)/);
    if (match) {
      const clean = match[1].replace(/^brands-/, '').replace(/-in$/, '');
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    }
  }
  return 'Social Profile';
}
