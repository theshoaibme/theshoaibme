import type { SiteSection } from '@/types';

export const DEFAULT_SITE_SECTIONS: Record<string, SiteSection> = {
  about: { subtitle: 'Who I Am', title: 'About Me' },
  skills: { subtitle: 'My Stack', title: 'Technical Skills' },
  services: { subtitle: 'What I Do', title: 'My Services' },
  portfolio: { subtitle: 'My Works', title: 'Featured Projects' },
  contact: { subtitle: 'Get in Touch', title: 'Contact Me' },
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeSiteSection(value: unknown, defaults: SiteSection): SiteSection {
  if (!isObject(value)) {
    return defaults;
  }

  const subtitle =
    typeof value.subtitle === 'string' && value.subtitle.trim()
      ? value.subtitle
      : defaults.subtitle;
  const title =
    typeof value.title === 'string' && value.title.trim() ? value.title : defaults.title;

  return { subtitle, title };
}

export function normalizeSiteSections(value: unknown): Record<string, SiteSection> {
  const source = isObject(value) ? value : {};
  const sections: Record<string, SiteSection> = {};

  for (const [key, defaults] of Object.entries(DEFAULT_SITE_SECTIONS)) {
    sections[key] = normalizeSiteSection(source[key], defaults);
  }

  for (const [key, sectionValue] of Object.entries(source)) {
    if (key in sections || !isObject(sectionValue)) continue;

    const subtitle =
      typeof sectionValue.subtitle === 'string' && sectionValue.subtitle.trim()
        ? sectionValue.subtitle
        : key;
    const title =
      typeof sectionValue.title === 'string' && sectionValue.title.trim()
        ? sectionValue.title
        : key;

    sections[key] = { subtitle, title };
  }

  return sections;
}

export function getSiteSection(
  sections: Record<string, SiteSection> | undefined,
  key: keyof typeof DEFAULT_SITE_SECTIONS,
): SiteSection {
  return sections?.[key] ?? DEFAULT_SITE_SECTIONS[key];
}
