import { useMemo } from 'react';
import type { Project } from '@/types';
import type { ProjectQueryParams } from '@/services';
import { useSiteData } from './useSiteData';

/**
 * Hook to access projects with optional filtering, search, and pagination.
 */
export function useProjects(params?: ProjectQueryParams) {
  const { data, loading, error, retry } = useSiteData();

  const filteredProjects = useMemo(() => {
    if (!data?.projects) return [] as Project[];

    let projects = [...data.projects];

    if (params?.featured !== undefined) {
      projects = projects.filter((project) => Boolean(project.featured) === params.featured);
    }

    if (params?.search?.trim()) {
      const query = params.search.trim().toLowerCase();
      projects = projects.filter((project) => {
        const inName = project.name.toLowerCase().includes(query);
        const inDesc = project.description.toLowerCase().includes(query);
        const inTech = project.tech_stack.some((tech) => tech.toLowerCase().includes(query));
        return inName || inDesc || inTech;
      });
    }

    const offset = params?.offset ?? 0;
    const limit = params?.limit;

    if (limit !== undefined && limit > 0) {
      projects = projects.slice(offset, offset + limit);
    } else if (offset > 0) {
      projects = projects.slice(offset);
    }

    return projects;
  }, [data?.projects, params?.featured, params?.limit, params?.offset, params?.search]);

  return {
    projects: filteredProjects,
    total: filteredProjects.length,
    allTotal: data?.projects.length ?? 0,
    loading,
    error,
    retry,
  };
}


/**
 * Hook to access user profile data directly.
 */
export function useProfile() {
  const { data, loading, error, retry } = useSiteData();
  return {
    profile: data?.profile ?? null,
    loading,
    error,
    retry,
  };
}

/**
 * Hook to access services data directly.
 */
export function useServices() {
  const { data, loading, error, retry } = useSiteData();
  return {
    services: data?.services ?? [],
    loading,
    error,
    retry,
  };
}

/**
 * Hook to access skills data directly.
 */
export function useSkills() {
  const { data, loading, error, retry } = useSiteData();
  return {
    skills: data?.skills ?? {},
    loading,
    error,
    retry,
  };
}

/**
 * Hook to access experience records directly.
 */
export function useExperience() {
  const { data, loading, error, retry } = useSiteData();
  return {
    experience: data?.experience ?? [],
    loading,
    error,
    retry,
  };
}

/**
 * Hook to access testimonials directly.
 */
export function useTestimonials() {
  const { data, loading, error, retry } = useSiteData();
  return {
    testimonials: data?.testimonials ?? [],
    loading,
    error,
    retry,
  };
}
