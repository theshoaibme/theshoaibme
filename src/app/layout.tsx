import type { Metadata, Viewport } from 'next';
import { Outfit, Space_Grotesk } from 'next/font/google';
import { type ReactNode } from 'react';
import { SiteDataProvider } from '@/app/providers/SiteDataProvider';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import SmoothScrollProvider from '@/components/layout/SmoothScrollProvider';
import {
  CORE_SEO_KEYWORDS,
  getUnifiedSameAs,
  REAL_PORTRAIT_ASSETS,
  SEO_ENTITY,
} from '@/config/seo';
import { SITE_URL } from '@/config/site';
import { portfolioService } from '@/services';

import '@/styles/global/style.css';
import '@/styles/modules/errors.css';
import '@/styles/modules/ruler.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-outfit',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b57d0',
};

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await portfolioService.getPortfolioData();
  const primaryPortrait = REAL_PORTRAIT_ASSETS[0];
  const headshotPortrait = REAL_PORTRAIT_ASSETS[1];

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: data.site.title,
      template: `%s | ${SEO_ENTITY.name}`,
    },
    description: SEO_ENTITY.defaultDescription,
    applicationName: `${SEO_ENTITY.name} Portfolio`,
    authors: [{ name: SEO_ENTITY.name, url: SITE_URL }],
    creator: SEO_ENTITY.name,
    publisher: SEO_ENTITY.name,
    category: 'technology',
    keywords: [...CORE_SEO_KEYWORDS],
    referrer: 'strict-origin-when-cross-origin',
    manifest: '/manifest.webmanifest',
    alternates: {
      canonical: '/',
    },
    icons: {
      icon: data.site.favicon || '/images/favicon.ico',
      apple: '/images/md-shoaib-khan-headshot.jpg',
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      type: 'profile',
      locale: 'en_US',
      url: SITE_URL,
      siteName: `${SEO_ENTITY.name} — Portfolio`,
      title: SEO_ENTITY.headline,
      description: SEO_ENTITY.defaultDescription,
      firstName: SEO_ENTITY.givenName,
      lastName: SEO_ENTITY.familyName,
      username: 'theshoaibme',
      gender: 'male',
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: SEO_ENTITY.headline,
        },
        {
          url: primaryPortrait.url,
          width: primaryPortrait.width,
          height: primaryPortrait.height,
          type: primaryPortrait.mimeType,
          alt: primaryPortrait.caption,
        },
        {
          url: headshotPortrait.url,
          width: headshotPortrait.width,
          height: headshotPortrait.height,
          type: headshotPortrait.mimeType,
          alt: headshotPortrait.caption,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: SEO_ENTITY.headline,
      description: SEO_ENTITY.defaultDescription,
      creator: SEO_ENTITY.handle,
      images: ['/twitter-image', primaryPortrait.url],
    },
    other: {
      'geo.region': 'BD-C',
      'geo.placename': 'Dhaka, Bangladesh',
      'profile:username': 'theshoaibme',
    },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { data: initialData } = await portfolioService.getPortfolioData();
  const sameAsLinks = getUnifiedSameAs(initialData);

  return (
    <html
      lang="en"
      className={`${outfit.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="alternate"
          type="text/plain"
          href="/llms.txt"
          title="LLM Summary — MD Shoaib Khan"
        />
        <link
          rel="alternate"
          type="text/plain"
          href="/llms-full.txt"
          title="LLM Complete Knowledge Base — MD Shoaib Khan"
        />
        {sameAsLinks.map((profileUrl) => (
          <link key={profileUrl} rel="me" href={profileUrl} />
        ))}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/devicon.min.css"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('theme');
                if (!theme) {
                  var m = document.cookie.match(/(?:^|; )theme=([^;]*)/);
                  if (m) theme = decodeURIComponent(m[1]);
                }
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body>
        <ErrorBoundary>
          <SiteDataProvider initialData={initialData}>
            <SmoothScrollProvider>{children}</SmoothScrollProvider>
          </SiteDataProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
