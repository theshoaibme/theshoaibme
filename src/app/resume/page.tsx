import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { CORE_SEO_KEYWORDS, REAL_PORTRAIT_ASSETS, SEO_ENTITY } from '@/config/seo';
import { SITE_URL } from '@/config/site';
import { buildResumePageJsonLd } from '@/lib/structuredData';
import { portfolioService } from '@/services';
import ResumePage from '@/views/ResumePage';

export const metadata: Metadata = {
  title: 'Resume & CV — Full Stack, Spring Boot, Frontend & AI Engineer',
  description: `Official Resume and Curriculum Vitae of ${SEO_ENTITY.name} — Full Stack Software Engineer specializing in React, Next.js, TypeScript, Java Spring Boot, FastAPI, Laravel, Rust, AI/LLM Agents, and Cloud DevOps.`,
  keywords: [
    ...CORE_SEO_KEYWORDS,
    'MD Shoaib Khan CV',
    'MD Shoaib Khan Resume PDF',
    'hire Spring Boot developer',
    'hire Next.js full stack engineer',
  ],
  alternates: {
    canonical: '/resume',
  },
  openGraph: {
    type: 'profile',
    url: `${SITE_URL}/resume`,
    title: `Resume & CV | ${SEO_ENTITY.name}`,
    description: `Download or view the professional software engineering resume of ${SEO_ENTITY.name}.`,
    images: [
      {
        url: REAL_PORTRAIT_ASSETS[1].url,
        width: REAL_PORTRAIT_ASSETS[1].width,
        height: REAL_PORTRAIT_ASSETS[1].height,
        alt: REAL_PORTRAIT_ASSETS[1].caption,
      },
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: SEO_ENTITY.headline,
      },
    ],
  },
};

export default async function Page() {
  const { data } = await portfolioService.getPortfolioData();

  return (
    <>
      <JsonLd data={buildResumePageJsonLd(data)} />
      <ResumePage />
    </>
  );
}
