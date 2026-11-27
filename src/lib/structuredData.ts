import { RESUME_CONTENT } from '@/config/resumeContent';
import {
  getAllSkillsFlat,
  getUnifiedSameAs,
  REAL_PORTRAIT_ASSETS,
  SEO_ENTITY,
  SEO_FAQ_ITEMS,
} from '@/config/seo';
import { SITE_URL } from '@/config/site';
import type { PortfolioData, Project } from '@/types';

function toAbsoluteUrl(pathOrUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return SITE_URL;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${SITE_URL}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
}

export function buildPersonSchema(data: PortfolioData) {
  const skills = getAllSkillsFlat(data);
  const sameAs = getUnifiedSameAs(data);
  const primaryPortrait = REAL_PORTRAIT_ASSETS[0];

  return {
    '@type': 'Person',
    '@id': SEO_ENTITY.id,
    name: data.profile.name || SEO_ENTITY.name,
    givenName: SEO_ENTITY.givenName,
    familyName: SEO_ENTITY.familyName,
    alternateName: [...SEO_ENTITY.alternateNames],
    jobTitle: [...SEO_ENTITY.jobTitles],
    description: SEO_ENTITY.defaultDescription,
    url: SITE_URL,
    mainEntityOfPage: { '@id': SEO_ENTITY.profilePageId },
    image: REAL_PORTRAIT_ASSETS.map((img, idx) => ({
      '@type': 'ImageObject',
      '@id': `${SITE_URL}/#portrait-${idx + 1}`,
      url: img.url,
      contentUrl: img.url,
      width: img.width,
      height: img.height,
      encodingFormat: img.mimeType,
      caption: img.caption,
      name: img.caption,
      representativeOfPage: idx === 0,
      creator: { '@id': SEO_ENTITY.id },
    })),
    thumbnailUrl: primaryPortrait.url,
    email: `mailto:${data.contact.email}`,
    telephone: RESUME_CONTENT.personal.phone || data.contact.phone,
    gender: RESUME_CONTENT.personal.sex,
    nationality: {
      '@type': 'Country',
      name: SEO_ENTITY.country,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: SEO_ENTITY.city,
      addressCountry: SEO_ENTITY.countryCode,
    },
    homeLocation: {
      '@type': 'Place',
      name: data.contact.location,
    },
    knowsLanguage: [...SEO_ENTITY.languages],
    knowsAbout: [
      ...skills,
      'Full Stack Web Development',
      'Spring Boot Microservices Architecture',
      'Frontend Architecture (React & Next.js)',
      'Backend API Engineering (FastAPI, Node.js, Laravel, Rust)',
      'Autonomous AI Agents & LLM Systems',
      'Model Context Protocol (MCP)',
      'Cloud & DevOps Infrastructure (AWS, Docker, Kubernetes, Cloudflare)',
      'Cross-Platform Mobile Engineering (Flutter & React Native)',
    ],
    alumniOf: SEO_ENTITY.alumni.map((item) => ({
      '@type': 'EducationalOrganization',
      name: item.name,
      ...('url' in item && item.url ? { url: item.url } : {}),
    })),
    hasOccupation: [
      {
        '@type': 'Occupation',
        name: 'Full Stack Software Engineer',
        occupationLocation: {
          '@type': 'Country',
          name: 'Worldwide',
        },
        skills: skills.join(', '),
      },
      {
        '@type': 'Occupation',
        name: 'Spring Boot & Backend Software Engineer',
        skills: 'Java, Spring Boot, FastAPI, Node.js, Laravel, Rust, PostgreSQL, Redis, Kafka',
      },
      {
        '@type': 'Occupation',
        name: 'Frontend & Next.js Engineer',
        skills: 'React, Next.js, TypeScript, Vue.js, Angular, Tailwind CSS',
      },
      {
        '@type': 'Occupation',
        name: 'AI & LLM Systems Engineer',
        skills: 'LLMs, LangChain, MCP, Vector Databases, PyTorch, OpenCV, NLP',
      },
    ],
    makesOffer: data.services.map((service) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: service.title,
        description: service.description,
        provider: { '@id': SEO_ENTITY.id },
        areaServed: 'Worldwide',
      },
    })),
    sameAs,
  };
}

export function buildWebsiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': SEO_ENTITY.websiteId,
    url: SITE_URL,
    name: `${SEO_ENTITY.name} — Official Portfolio`,
    alternateName: ['theshoaib.me', 'MD Shoaib Khan Portfolio', 'theshoaibme'],
    description: SEO_ENTITY.defaultDescription,
    inLanguage: 'en',
    author: { '@id': SEO_ENTITY.id },
    publisher: { '@id': SEO_ENTITY.id },
    copyrightHolder: { '@id': SEO_ENTITY.id },
  };
}

export function buildProfessionalServiceSchema(data: PortfolioData) {
  const reviews = data.testimonials.slice(0, 10).map((item) => ({
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: item.name,
    },
    reviewBody: item.feedback,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: '5',
      bestRating: '5',
    },
  }));

  return {
    '@type': 'ProfessionalService',
    '@id': SEO_ENTITY.serviceId,
    name: `${SEO_ENTITY.name} — Software Engineering & AI Consulting`,
    url: SITE_URL,
    image: REAL_PORTRAIT_ASSETS[0].url,
    logo: `${SITE_URL}/images/favicon.ico`,
    description: SEO_ENTITY.defaultDescription,
    email: data.contact.email,
    telephone: RESUME_CONTENT.personal.phone || data.contact.phone,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressLocality: SEO_ENTITY.city,
      addressCountry: SEO_ENTITY.countryCode,
    },
    areaServed: 'Worldwide',
    founder: { '@id': SEO_ENTITY.id },
    sameAs: getUnifiedSameAs(data),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Software Development, Spring Boot, Next.js & AI Services',
      itemListElement: data.services.map((service, index) => ({
        '@type': 'Offer',
        position: index + 1,
        itemOffered: {
          '@type': 'Service',
          name: service.title,
          description: service.description,
          provider: { '@id': SEO_ENTITY.id },
          serviceType: service.title,
          areaServed: 'Worldwide',
        },
      })),
    },
    ...(data.testimonials.length > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '5.0',
            bestRating: '5',
            worstRating: '1',
            reviewCount: String(data.testimonials.length),
          },
          review: reviews,
        }
      : {}),
  };
}

export function buildProjectsItemListSchema(projects: Project[], pageUrl: string) {
  return {
    '@type': 'ItemList',
    '@id': `${pageUrl}#projects-list`,
    name: `Software Engineering Projects by ${SEO_ENTITY.name}`,
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'SoftwareSourceCode',
        name: project.name,
        description: project.description,
        author: { '@id': SEO_ENTITY.id },
        creator: { '@id': SEO_ENTITY.id },
        programmingLanguage: project.tech_stack,
        ...(project.repository ? { codeRepository: project.repository } : {}),
        ...(project.live_preview
          ? { url: project.live_preview, targetProduct: { '@type': 'WebApplication', name: project.name, url: project.live_preview } }
          : {}),
        ...(project.image ? { image: toAbsoluteUrl(project.image) } : {}),
      },
    })),
  };
}

export function buildFaqSchema() {
  return {
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/#faq`,
    mainEntity: SEO_FAQ_ITEMS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function buildBreadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function buildHomeJsonLd(data: PortfolioData) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      buildWebsiteSchema(),
      {
        '@type': 'ProfilePage',
        '@id': SEO_ENTITY.profilePageId,
        url: SITE_URL,
        name: SEO_ENTITY.headline,
        description: SEO_ENTITY.defaultDescription,
        inLanguage: 'en',
        isPartOf: { '@id': SEO_ENTITY.websiteId },
        mainEntity: { '@id': SEO_ENTITY.id },
        about: { '@id': SEO_ENTITY.id },
        primaryImageOfPage: { '@id': `${SITE_URL}/#portrait-1` },
        dateCreated: '2023-02-13T00:00:00+06:00',
        dateModified: new Date().toISOString(),
      },
      buildPersonSchema(data),
      buildProfessionalServiceSchema(data),
      buildProjectsItemListSchema(data.projects, `${SITE_URL}/`),
      buildFaqSchema(),
      buildBreadcrumbSchema([{ name: 'Home', path: '/' }]),
    ],
  };
}

export function buildProjectsPageJsonLd(data: PortfolioData) {
  const pageUrl = `${SITE_URL}/projects`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: `Projects Portfolio — ${SEO_ENTITY.name}`,
        description:
          'Full collection of production web applications, Spring Boot & Laravel enterprise platforms, Next.js SaaS systems, mobile apps, and AI agent projects built by MD Shoaib Khan.',
        isPartOf: { '@id': SEO_ENTITY.websiteId },
        about: { '@id': SEO_ENTITY.id },
        mainEntity: { '@id': `${pageUrl}#projects-list` },
      },
      buildProjectsItemListSchema(data.projects, pageUrl),
      buildBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Projects', path: '/projects' },
      ]),
    ],
  };
}

export function buildResumePageJsonLd(data: PortfolioData) {
  const pageUrl = `${SITE_URL}/resume`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: `Resume & CV — ${SEO_ENTITY.name}`,
        description:
          'Curriculum Vitae and professional engineering resume of MD Shoaib Khan — Full Stack Developer, Backend & Spring Boot Engineer, Next.js Frontend Architect, and AI Systems Developer.',
        isPartOf: { '@id': SEO_ENTITY.websiteId },
        mainEntity: { '@id': SEO_ENTITY.id },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: REAL_PORTRAIT_ASSETS[1].url,
          width: REAL_PORTRAIT_ASSETS[1].width,
          height: REAL_PORTRAIT_ASSETS[1].height,
          caption: REAL_PORTRAIT_ASSETS[1].caption,
        },
      },
      buildPersonSchema(data),
      buildBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Resume', path: '/resume' },
      ]),
    ],
  };
}

export function buildPolicyPageJsonLd(title: string, path: '/privacy' | '/terms') {
  const pageUrl = `${SITE_URL}${path}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${title} — ${SEO_ENTITY.name}`,
        isPartOf: { '@id': SEO_ENTITY.websiteId },
        publisher: { '@id': SEO_ENTITY.id },
      },
      buildBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: title, path },
      ]),
    ],
  };
}
