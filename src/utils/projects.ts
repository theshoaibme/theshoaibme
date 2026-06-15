import type { Project } from '@/types';
import { resolveImageUrl } from '@/utils/images';

export const FEATURED_PROJECT_LIMIT = 4;

function getProjectSlug(project: Project): string {
  try {
    const repoPath = new URL(project.repository).pathname.split('/').filter(Boolean);
    const repoName = repoPath[repoPath.length - 1] ?? '';
    return repoName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  } catch {
    return '';
  }
}

export function getProjectImage(project: Project): string {
  if (project.image) {
    return resolveImageUrl(project.image);
  }

  const slug = getProjectSlug(project);
  if (slug) {
    return resolveImageUrl(`/images/projects/${slug}.jpg`);
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
