import type { Project } from '@/types';
import { resolveImageUrl } from '@/utils/images';
import { isSafeExternalUrl } from '@/utils/urlValidation';

export const FEATURED_PROJECT_LIMIT = 4;

export function getProjectImage(project: Project): string {
  if (project.image) {
    return resolveImageUrl(project.image);
  }

  return getProjectFallbackImage(project);
}

export function getProjectImages(project: Project): string[] {
  if (project.images && project.images.length > 0) {
    return project.images.map((img) => resolveImageUrl(img)).filter(Boolean);
  }

  const single = getProjectImage(project);
  return single ? [single] : [];
}

/**
 * Returns a live screenshot fallback URL from live_preview or repository.
 */
export function getProjectFallbackImage(project: Project): string {
  const sourceUrl = [project.live_preview, project.repository].find(
    (url): url is string => Boolean(url && isSafeExternalUrl(url)),
  );

  if (sourceUrl) {
    return `https://image.thum.io/get/width/1200/noanimate/${sourceUrl}`;
  }

  return '';
}

export function getFeaturedProjects(projects: Project[]): Project[] {
  const pinned = projects.filter((project) => project.featured);

  if (pinned.length > 0) {
    return pinned.slice(0, FEATURED_PROJECT_LIMIT);
  }

  return projects.slice(0, FEATURED_PROJECT_LIMIT);
}

export function hasMoreProjects(projects: Project[]): boolean {
  return getFeaturedProjects(projects).length < projects.length;
}
