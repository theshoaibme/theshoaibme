import type { Project } from '@/types';

export function getProjectImage(project: Project): string {
  if (project.image) return project.image;
  if (project.live_preview || project.repository) {
    const previewUrl = project.live_preview || project.repository;
    return `https://s0.wp.com/mshots/v1/${encodeURIComponent(previewUrl)}?w=1200`;
  }
  return '';
}
