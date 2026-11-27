import type { Metadata, Viewport } from 'next';
import { Outfit, Space_Grotesk } from 'next/font/google';
import { type ReactNode } from 'react';
import { SiteDataProvider } from '@/app/providers/SiteDataProvider';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import SmoothScrollProvider from '@/components/layout/SmoothScrollProvider';
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

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: data.site.title,
      template: `%s | ${data.profile.name}`,
    },
    description: data.profile.description,
    referrer: 'strict-origin-when-cross-origin',
    alternates: {
      canonical: '/',
    },
    icons: {
      icon: data.site.favicon || '/images/favicon.ico',
    },
    openGraph: {
      type: 'website',
      url: SITE_URL,
      title: data.site.title,
      description: data.profile.description,
      siteName: data.profile.name,
      images: data.profile.profileImage ? [{ url: data.profile.profileImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: data.site.title,
      description: data.profile.description,
      images: data.profile.profileImage ? [data.profile.profileImage] : undefined,
    },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { data: initialData } = await portfolioService.getPortfolioData();

  return (
    <html
      lang="en"
      className={`${outfit.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
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
