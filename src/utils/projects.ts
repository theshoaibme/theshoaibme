import type { Project } from '@/types';

export const FEATURED_PROJECT_LIMIT = 4;

export function getProjectImage(project: Project): string {
  if (project.image) return project.image;
  if (project.live_preview || project.repository) {
    const previewUrl = project.live_preview || project.repository;
    return `https://s0.wp.com/mshots/v1/${encodeURIComponent(previewUrl)}?w=1200`;
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
