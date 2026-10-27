import type { Project } from '@/types';
import { resolveImageUrl } from '@/utils/images';
import { isSafeExternalUrl } from '@/utils/urlValidation';

export const FEATURED_PROJECT_LIMIT = 4;

export function getProjectImage(project: Project): string {
  if (project.image) {
    return resolveImageUrl(project.image);
  }

  if (project.live_preview && isSafeExternalUrl(project.live_preview)) {
    return `https://s0.wp.com/mshots/v1/${encodeURIComponent(project.live_preview)}?w=1200`;
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
