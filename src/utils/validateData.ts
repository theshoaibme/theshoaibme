import type { PortfolioData } from '@/types';
import { DataValidationError } from './errors';

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
  requireArray(data.site.nav, 'site.nav');
  requireString(data.profile.name, 'profile.name');
  requireString(data.profile.description, 'profile.description');
  requireArray(data.profile.social, 'profile.social');

  if (!isObject(data.about) || !Array.isArray(data.about.text) || !Array.isArray(data.about.stats)) {
    throw new DataValidationError('Invalid "about" section in data.json.');
  }

  if (!isObject(data.skills)) {
    throw new DataValidationError('Missing "skills" object in data.json.');
  }

  requireArray(data.experience, 'experience');
  requireArray(data.projects, 'projects');
  requireArray(data.services, 'services');
  requireArray(data.testimonials, 'testimonials');

  if (!isObject(data.contact)) {
    throw new DataValidationError('Missing "contact" object in data.json.');
  }

  return data as unknown as PortfolioData;
}
