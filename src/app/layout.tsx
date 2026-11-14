import type { Metadata, Viewport } from 'next';
import { type ReactNode } from 'react';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import SmoothScrollProvider from '@/components/layout/SmoothScrollProvider';
import { SiteDataProvider } from '@/app/providers/SiteDataProvider';

import '@/styles/global/style.css';
import '@/styles/modules/errors.css';
import '@/styles/modules/ruler.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b57d0',
};

export const metadata: Metadata = {
  title: {
    default: 'MD Shoaib Khan | Full-Stack Software Engineer',
    template: '%s | MD Shoaib Khan',
  },
  description:
    'Full-stack software engineer portfolio showcasing web applications, enterprise systems, and developer tools.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
        />
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
          <SiteDataProvider>
            <SmoothScrollProvider>{children}</SmoothScrollProvider>
          </SiteDataProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
