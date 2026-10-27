import type { ContactInfoKey } from '@/utils/contactLinks';

export const CONTACT_ICONS: Record<ContactInfoKey, string> = {
  location: 'fa-location-dot',
  email: 'fa-envelope',
  phone: 'fa-phone',
};

export const CONTACT_LABELS: Record<ContactInfoKey, string> = {
  location: 'Location',
  email: 'Email',
  phone: 'Phone',
};

export const CONTACT_ORDER: ContactInfoKey[] = ['location', 'email', 'phone'];
