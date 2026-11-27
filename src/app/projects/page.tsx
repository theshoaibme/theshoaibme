import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { CORE_SEO_KEYWORDS, SEO_ENTITY } from '@/config/seo';
import { SITE_URL } from '@/config/site';
import { buildProjectsPageJsonLd } from '@/lib/structuredData';
import { portfolioService } from '@/services';
import ProjectsPage from '@/views/ProjectsPage';

export const metadata: Metadata = {
  title: 'Projects — Spring Boot, Next.js, AI Agents, SaaS & Mobile Apps',
  description: `Explore production software engineering projects built by ${SEO_ENTITY.name} — including enterprise ERPs, Spring Boot & Laravel platforms, Next.js SaaS apps, autonomous Rust/Python AI agents, PyTorch medical imaging, and Flutter/native mobile apps.`,
  keywords: [
    ...CORE_SEO_KEYWORDS,
    'MD Shoaib Khan projects',
    'Spring Boot portfolio projects',
    'Next.js SaaS portfolio',
    'Laravel enterprise ERP portfolio',
    'AI agent portfolio projects',
  ],
  alternates: {
    canonical: '/projects',
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/projects`,
    title: `Projects Portfolio | ${SEO_ENTITY.name}`,
    description: `Full collection of production web, mobile, Spring Boot, Next.js, and AI systems engineered by ${SEO_ENTITY.name}.`,
  },
};

export default async function Page() {
  const { data } = await portfolioService.getPortfolioData();

  return (
    <>
      <JsonLd data={buildProjectsPageJsonLd(data)} />
      <ProjectsPage />
    </>
  );
}
