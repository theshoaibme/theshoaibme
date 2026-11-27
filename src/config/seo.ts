import { SITE_URL } from '@/config/site';
import type { PortfolioData } from '@/types';

export interface SeoPortraitAsset {
  url: string;
  path: string;
  width: number;
  height: number;
  mimeType: string;
  caption: string;
}

export const SEO_ENTITY = {
  id: `${SITE_URL}/#person`,
  websiteId: `${SITE_URL}/#website`,
  profilePageId: `${SITE_URL}/#profilepage`,
  serviceId: `${SITE_URL}/#professional-service`,
  name: 'MD Shoaib Khan',
  givenName: 'MD Shoaib',
  familyName: 'Khan',
  handle: '@theshoaibme',
  alternateNames: [
    'Md Shoaib Khan',
    'Shoaib Khan',
    'Mohammad Shoaib Khan',
    'theshoaibme',
    'theshoaib.me',
    'মোঃ শোয়াইব খান',
    'শোয়াইব খান',
    'মোহাম্মদ শোয়াইব খান',
  ],
  jobTitles: [
    'Full Stack Software Engineer',
    'Spring Boot & Backend Architect',
    'Frontend Developer (React, Next.js & TypeScript)',
    'AI & Autonomous Agent Systems Engineer',
    'Mobile App Developer (Flutter & React Native)',
  ],
  headline:
    'MD Shoaib Khan — Full Stack Software Engineer | Spring Boot, Next.js, React, Backend & AI Developer',
  defaultDescription:
    'Official portfolio of MD Shoaib Khan (theshoaib.me) — Full Stack Software Engineer specializing in Frontend (React, Next.js, TypeScript), Backend (Java Spring Boot, FastAPI, Node.js, Laravel, Rust), AI/LLM Autonomous Agents, Flutter/React Native Mobile Apps, and AWS/Cloudflare Cloud Architecture.',
  country: 'Bangladesh',
  countryCode: 'BD',
  city: 'Dhaka',
  languages: ['English', 'Bengali'],
  alumni: [
    {
      name: 'Daffodil International University',
      url: 'https://daffodilvarsity.edu.bd',
      department: 'Department of Computer Science and Engineering (CSE)',
    },
    {
      name: 'Birshreshtha Munshi Abdur Rouf Public College',
      url: 'https://abdurroufcollege.ac.bd',
    },
    {
      name: 'Gazipur Shaheen Cadet Academy',
    },
  ],
  additionalSameAs: [
    'https://theshoaib.me',
    'https://www.theshoaib.me',
    'https://theshoaibme.github.io',
    'https://github.com/theshoaibme',
    'https://github.com/the-shoaib2',
    'https://www.linkedin.com/in/theshoaibme',
    'https://linkedin.com/in/theshoaibme',
    'https://www.facebook.com/theshoaib.me',
    'https://facebook.com/theshoaib.me',
    'https://www.instagram.com/theshoaib.me',
    'https://instagram.com/the.shoaib3',
    'https://telegram.me/the_shoaib2',
    'https://t.me/the_shoaib2',
    'https://huggingface.co/theshoaibme',
  ],
} as const;

/**
 * Verified real photographs of MD Shoaib Khan (excluding 3D/cartoon illustrations)
 * so Google Images, Knowledge Graph, and social previews index his real face.
 */
export const REAL_PORTRAIT_ASSETS: readonly SeoPortraitAsset[] = [
  {
    path: '/images/md-shoaib-khan.jpg',
    url: `${SITE_URL}/images/md-shoaib-khan.jpg`,
    width: 746,
    height: 933,
    mimeType: 'image/jpeg',
    caption:
      'MD Shoaib Khan — Full Stack Software Engineer, Spring Boot Backend Architect & AI Systems Developer',
  },
  {
    path: '/images/md-shoaib-khan-headshot.jpg',
    url: `${SITE_URL}/images/md-shoaib-khan-headshot.jpg`,
    width: 512,
    height: 512,
    mimeType: 'image/jpeg',
    caption: 'MD Shoaib Khan — Official Headshot Portrait (theshoaib.me)',
  },
  {
    path: '/images/about/about.webp',
    url: `${SITE_URL}/images/about/about.webp`,
    width: 746,
    height: 933,
    mimeType: 'image/webp',
    caption: 'MD Shoaib Khan — Full Stack, Frontend, Backend & AI Engineer',
  },
  {
    path: '/images/about/resume-profile.webp',
    url: `${SITE_URL}/images/about/resume-profile.webp`,
    width: 512,
    height: 512,
    mimeType: 'image/webp',
    caption: 'MD Shoaib Khan — Software Engineer Portrait',
  },
] as const;

export const CORE_SEO_KEYWORDS: readonly string[] = [
  // Personal Brand & Identity
  'MD Shoaib Khan',
  'Md Shoaib Khan',
  'Shoaib Khan',
  'Mohammad Shoaib Khan',
  'theshoaibme',
  'theshoaib.me',
  'MD Shoaib Khan portfolio',
  'MD Shoaib Khan resume',
  'MD Shoaib Khan GitHub',
  'MD Shoaib Khan LinkedIn',
  'MD Shoaib Khan Facebook',
  'MD Shoaib Khan Instagram',
  'MD Shoaib Khan Telegram',
  'MD Shoaib Khan software engineer',
  // High-Intent Developer & Engineering Roles
  'best developer',
  'best full stack developer',
  'top full stack developer',
  'best software engineer',
  'world class software engineer',
  'best web developer',
  'senior full stack developer',
  'digital product engineer',
  'hire full stack developer',
  'best developer in Bangladesh',
  'top software engineer Dhaka Bangladesh',
  'global remote full stack developer',
  // Frontend Engineering
  'best frontend developer',
  'frontend developer',
  'expert React developer',
  'Next.js developer',
  'best Next.js developer',
  'TypeScript developer',
  'Vue.js developer',
  'Angular developer',
  'Tailwind CSS UI UX engineer',
  // Backend & Spring Boot Engineering
  'best backend developer',
  'backend developer',
  'Spring Boot developer',
  'best Spring Boot developer',
  'best Spring Boot developer in the world',
  'Java Spring Boot microservices architect',
  'FastAPI Python backend developer',
  'Node.js Express backend developer',
  'Laravel enterprise developer',
  'Rust Axum backend engineer',
  'REST API GraphQL WebSocket architect',
  'PostgreSQL MongoDB Redis Kafka engineer',
  // AI, Agents & Machine Learning
  'AI engineer',
  'best AI developer',
  'LLM engineer',
  'autonomous AI agent developer',
  'LangChain MCP developer',
  'RAG vector search developer',
  'PyTorch computer vision engineer',
  // Mobile, Cloud & DevOps
  'Flutter mobile app developer',
  'React Native developer',
  'iOS Android app developer',
  'AWS Docker Kubernetes DevOps engineer',
  'Cloudflare Vercel cloud architect',
  'e-commerce SaaS ERP developer',
] as const;

export interface SeoFaqItem {
  question: string;
  answer: string;
}

export const SEO_FAQ_ITEMS: readonly SeoFaqItem[] = [
  {
    question: 'Who is MD Shoaib Khan?',
    answer:
      'MD Shoaib Khan (known online as theshoaibme at theshoaib.me) is a Full Stack Software Engineer, Spring Boot & Backend Architect, Next.js/React Frontend Developer, and AI Systems Engineer based in Dhaka, Bangladesh, building production-ready web, mobile, cloud, and autonomous AI platforms for global clients and enterprises.',
  },
  {
    question: 'What backend technologies and frameworks does MD Shoaib Khan specialize in?',
    answer:
      'MD Shoaib Khan specializes in Java Spring Boot microservices, Python FastAPI & Django, Node.js & Express, PHP Laravel (Octane/FrankenPHP), and Rust (Axum), backed by PostgreSQL, PostGIS, MongoDB, MySQL, Redis, Apache Kafka, Prisma, and TypeORM.',
  },
  {
    question: 'What frontend and mobile technologies does MD Shoaib Khan use?',
    answer:
      'On the frontend, MD Shoaib Khan builds high-performance, SEO-optimized interfaces with React, Next.js App Router, TypeScript, Vue.js, Angular, Tailwind CSS, and shadcn/ui. For mobile, he develops cross-platform and native apps with Flutter, React Native, Kotlin (Jetpack Compose), and SwiftUI.',
  },
  {
    question: 'What AI and autonomous agent systems has MD Shoaib Khan built?',
    answer:
      'MD Shoaib Khan builds multi-agent LLM orchestration systems, Model Context Protocol (MCP) tool servers, RAG & vector search pipelines, real-time speech/voice agents (Whisper, LiveKit), and PyTorch medical & computer vision models such as BMS Agents and Pan-Organ Net.',
  },
  {
    question: 'Where can I find MD Shoaib Khan on GitHub, LinkedIn, Facebook, Instagram, and Telegram?',
    answer:
      'Official profiles of MD Shoaib Khan: Website https://theshoaib.me, GitHub https://github.com/theshoaibme, LinkedIn https://www.linkedin.com/in/theshoaibme, Facebook https://www.facebook.com/theshoaib.me, Instagram https://www.instagram.com/theshoaib.me, Telegram https://telegram.me/the_shoaib2, and Hugging Face https://huggingface.co/theshoaibme.',
  },
  {
    question: 'How can founders, startups, or enterprises hire MD Shoaib Khan?',
    answer:
      'You can hire MD Shoaib Khan for full-stack product engineering, Spring Boot/FastAPI/Laravel backend systems, Next.js web platforms, AI integration, or mobile app development via https://theshoaib.me/#contact, email at theshoaib.me@gmail.com, or Telegram at https://telegram.me/the_shoaib2.',
  },
] as const;

export function getUnifiedSameAs(data?: PortfolioData | null): string[] {
  const urls = new Set<string>(SEO_ENTITY.additionalSameAs);

  if (data?.profile.social) {
    for (const item of data.profile.social) {
      if (item.url?.trim()) {
        urls.add(item.url.trim());
      }
    }
  }

  return Array.from(urls);
}

export function getAllSkillsFlat(data?: PortfolioData | null): string[] {
  if (!data?.skills) return [];
  const skills = new Set<string>();
  for (const list of Object.values(data.skills)) {
    for (const skill of list) {
      if (skill.trim()) skills.add(skill.trim());
    }
  }
  return Array.from(skills);
}
