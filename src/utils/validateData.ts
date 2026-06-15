import type { PortfolioData } from '@/types';
import { DataValidationError } from './errors';
import { normalizeSiteSections } from './siteSections';
import { isSafeExternalUrl, isSafeImageUrl, isSafeNavLink } from './urlValidation';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new DataValidationError(`Invalid or missing "${field}" in data.json.`);
  }
  return value;
}

function requireArray(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new DataValidationError(`Invalid or missing "${field}" array in data.json.`);
  }
  return value;
}

function requireSafeNavLink(value: unknown, field: string): string {
  const link = requireString(value, field);
  if (!isSafeNavLink(link)) {
    throw new DataValidationError(`Unsafe URL in "${field}".`);
  }
  return link;
}

function requireSafeExternalUrl(value: unknown, field: string): string {
  const url = requireString(value, field);
  if (!isSafeExternalUrl(url)) {
    throw new DataValidationError(`Unsafe URL in "${field}".`);
  }
  return url;
}

function requireSafeImageUrl(value: unknown, field: string): string {
  const url = requireString(value, field);
  if (!isSafeImageUrl(url)) {
    throw new DataValidationError(`Unsafe image URL in "${field}".`);
  }
  return url;
}

export function validatePortfolioData(data: unknown): PortfolioData {
  if (!isObject(data)) {
    throw new DataValidationError('data.json must contain a valid JSON object.');
  }

  if (!isObject(data.site)) {
    throw new DataValidationError('Missing "site" object in data.json.');
  }

  if (!isObject(data.profile)) {
    throw new DataValidationError('Missing "profile" object in data.json.');
  }

  requireString(data.site.title, 'site.title');
  const nav = requireArray(data.site.nav, 'site.nav');
  for (const [index, item] of nav.entries()) {
    if (!isObject(item)) {
      throw new DataValidationError(`Invalid nav item at index ${index}.`);
    }
    requireString(item.label, `site.nav[${index}].label`);
    requireSafeNavLink(item.link, `site.nav[${index}].link`);
  }
  requireString(data.profile.name, 'profile.name');
  requireString(data.profile.description, 'profile.description');
  requireSafeImageUrl(data.profile.profileImage, 'profile.profileImage');
  const social = requireArray(data.profile.social, 'profile.social');
  for (const [index, item] of social.entries()) {
    if (!isObject(item)) {
      throw new DataValidationError(`Invalid social item at index ${index}.`);
    }
    requireString(item.icon, `profile.social[${index}].icon`);
    requireSafeExternalUrl(item.url, `profile.social[${index}].url`);
  }

  if (!isObject(data.about) || !Array.isArray(data.about.text) || !Array.isArray(data.about.stats)) {
    throw new DataValidationError('Invalid "about" section in data.json.');
  }
  requireSafeImageUrl(data.about.image, 'about.image');

  if (!isObject(data.skills)) {
    throw new DataValidationError('Missing "skills" object in data.json.');
  }

  requireArray(data.experience, 'experience');
  const projects = requireArray(data.projects, 'projects');
  for (const [index, item] of projects.entries()) {
    if (!isObject(item)) {
      throw new DataValidationError(`Invalid project at index ${index}.`);
    }
    requireString(item.name, `projects[${index}].name`);
    requireString(item.description, `projects[${index}].description`);
    requireSafeExternalUrl(item.repository, `projects[${index}].repository`);
    if (item.live_preview !== null && item.live_preview !== undefined) {
      requireSafeExternalUrl(item.live_preview, `projects[${index}].live_preview`);
    }
    if (item.image !== null && item.image !== undefined) {
      requireSafeImageUrl(item.image, `projects[${index}].image`);
    }
  }
  requireArray(data.services, 'services');
  const testimonials = requireArray(data.testimonials, 'testimonials');
  for (const [index, item] of testimonials.entries()) {
    if (!isObject(item)) {
      throw new DataValidationError(`Invalid testimonial at index ${index}.`);
    }
    requireSafeImageUrl(item.avatar, `testimonials[${index}].avatar`);
  }

  if (!isObject(data.contact)) {
    throw new DataValidationError('Missing "contact" object in data.json.');
  }

  return {
    ...(data as Record<string, unknown>),
    site: {
      ...(data.site as Record<string, unknown>),
      sections: normalizeSiteSections(data.site.sections),
    },
  } as unknown as PortfolioData;
}
