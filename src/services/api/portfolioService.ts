import type {
  About,
  Contact,
  ExperienceItem,
  PortfolioData,
  Profile,
  Project,
  Service,
  SiteData,
  Testimonial,
} from '@/types';
import {
  clearPortfolioDataCache,
  fetchRawPortfolioData,
  getCachedPortfolioData,
} from './portfolioApiClient';
import type { ApiResponse, ProjectQueryParams, RequestOptions } from './types';

function buildApiResponse<T>(
  data: T,
  options: {
    statusCode?: number;
    message?: string;
    cached?: boolean;
    count?: number;
    total?: number;
    extraMeta?: Record<string, unknown>;
  } = {},
): ApiResponse<T> {
  return {
    success: true,
    statusCode: options.statusCode ?? 200,
    data,
    message: options.message,
    meta: {
      timestamp: new Date().toISOString(),
      cached: options.cached ?? false,
      count: options.count,
      total: options.total,
      ...options.extraMeta,
    },
  };
}

export const portfolioService = {
  /**
   * Clears the in-memory cache and resets any in-flight requests.
   */
  clearCache(): void {
    clearPortfolioDataCache();
  },

  /**
   * Retrieves currently cached portfolio data if available without making a network request.
   */
  getCachedData(): PortfolioData | null {
    return getCachedPortfolioData();
  },

  /**
   * Fetches the complete portfolio data wrapped in an API response envelope.
   */
  async getPortfolioData(options?: RequestOptions): Promise<ApiResponse<PortfolioData>> {
    const { data, cached } = await fetchRawPortfolioData(options);
    return buildApiResponse(data, {
      cached,
      message: 'Portfolio data retrieved successfully',
    });
  },

  /**
   * Fetches site metadata (title, logo, nav, sections, policies, resume).
   */
  async getSiteMetadata(options?: RequestOptions): Promise<ApiResponse<SiteData>> {
    const { data, cached } = await fetchRawPortfolioData(options);
    return buildApiResponse(data.site, {
      cached,
      message: 'Site metadata retrieved successfully',
    });
  },

  /**
   * Fetches user profile data (name, subtitle, avatar, social links).
   */
  async getProfile(options?: RequestOptions): Promise<ApiResponse<Profile>> {
    const { data, cached } = await fetchRawPortfolioData(options);
    return buildApiResponse(data.profile, {
      cached,
      message: 'Profile retrieved successfully',
    });
  },

  /**
   * Fetches about section data (bio paragraphs, stats, images).
   */
  async getAbout(options?: RequestOptions): Promise<ApiResponse<About>> {
    const { data, cached } = await fetchRawPortfolioData(options);
    return buildApiResponse(data.about, {
      cached,
      message: 'About section data retrieved successfully',
    });
  },

  /**
   * Fetches work experience list.
   */
  async getExperience(options?: RequestOptions): Promise<ApiResponse<ExperienceItem[]>> {
    const { data, cached } = await fetchRawPortfolioData(options);
    return buildApiResponse(data.experience, {
      cached,
      count: data.experience.length,
      total: data.experience.length,
      message: 'Experience records retrieved successfully',
    });
  },

  /**
   * Fetches skills categorized by domain.
   */
  async getSkills(options?: RequestOptions): Promise<ApiResponse<Record<string, string[]>>> {
    const { data, cached } = await fetchRawPortfolioData(options);
    return buildApiResponse(data.skills, {
      cached,
      message: 'Skills retrieved successfully',
    });
  },

  /**
   * Fetches projects with support for filtering, search, and pagination.
   */
  async getProjects(
    params: ProjectQueryParams = {},
    options?: RequestOptions,
  ): Promise<ApiResponse<Project[]>> {
    const { data, cached } = await fetchRawPortfolioData(options);
    let projects = [...data.projects];

    if (params.featured !== undefined) {
      projects = projects.filter((project) => Boolean(project.featured) === params.featured);
    }

    if (params.search?.trim()) {
      const query = params.search.trim().toLowerCase();
      projects = projects.filter((project) => {
        const inName = project.name.toLowerCase().includes(query);
        const inDesc = project.description.toLowerCase().includes(query);
        const inTech = project.tech_stack.some((tech) => tech.toLowerCase().includes(query));
        return inName || inDesc || inTech;
      });
    }

    const total = projects.length;
    const offset = params.offset ?? 0;
    const limit = params.limit;

    if (limit !== undefined && limit > 0) {
      projects = projects.slice(offset, offset + limit);
    } else if (offset > 0) {
      projects = projects.slice(offset);
    }

    return buildApiResponse(projects, {
      cached,
      count: projects.length,
      total,
      message: 'Projects retrieved successfully',
    });
  },

  /**
   * Fetches a specific project by exact or case-insensitive name.
   */
  async getProjectByName(
    name: string,
    options?: RequestOptions,
  ): Promise<ApiResponse<Project | null>> {
    const { data, cached } = await fetchRawPortfolioData(options);
    const normalized = name.trim().toLowerCase();
    const project = data.projects.find((p) => p.name.trim().toLowerCase() === normalized) ?? null;

    return buildApiResponse(project, {
      statusCode: project ? 200 : 404,
      cached,
      message: project ? 'Project found' : 'Project not found',
    });
  },

  /**
   * Fetches offered services list.
   */
  async getServices(options?: RequestOptions): Promise<ApiResponse<Service[]>> {
    const { data, cached } = await fetchRawPortfolioData(options);
    return buildApiResponse(data.services, {
      cached,
      count: data.services.length,
      total: data.services.length,
      message: 'Services retrieved successfully',
    });
  },

  /**
   * Fetches client and peer testimonials.
   */
  async getTestimonials(options?: RequestOptions): Promise<ApiResponse<Testimonial[]>> {
    const { data, cached } = await fetchRawPortfolioData(options);
    return buildApiResponse(data.testimonials, {
      cached,
      count: data.testimonials.length,
      total: data.testimonials.length,
      message: 'Testimonials retrieved successfully',
    });
  },

  /**
   * Fetches contact information details.
   */
  async getContact(options?: RequestOptions): Promise<ApiResponse<Contact>> {
    const { data, cached } = await fetchRawPortfolioData(options);
    return buildApiResponse(data.contact, {
      cached,
      message: 'Contact details retrieved successfully',
    });
  },
};
