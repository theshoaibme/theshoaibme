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
