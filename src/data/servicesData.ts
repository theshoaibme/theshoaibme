import {
  Code2,
  Smartphone,
  Sparkles,
  Palette,
  Cloud,
  Server,
  Handshake,
  ShoppingCart,
  type LucideIcon,
} from 'lucide-react';

export const SERVICE_LUCIDE_MAP: Record<string, LucideIcon> = {
  'Web Development': Code2,
  'Mobile App Development': Smartphone,
  'AI Solutions': Sparkles,
  'UI/UX Design': Palette,
  'Cloud & DevOps': Cloud,
  'API & Backend': Server,
  'Freelance Consulting': Handshake,
  'E-Commerce Solutions': ShoppingCart,
};

export const SERVICES_LABELS = {
  ctaText: 'Discuss your project',
  ctaTooltip: 'Contact me about this service',
  ctaAriaPrefix: 'Contact me about',
} as const;
