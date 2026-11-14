"use client";

import { Link } from '@/components/common/UniversalLink';
import type { ReactNode } from 'react';
import PageStatus from '@/components/common/PageStatus';
import Header from '@/components/layout/Header';
import { useDocumentTitle, useSiteData } from '@/hooks/data/useSiteData';
import { usePolicyTheme } from '@/hooks/ui/useTheme';
import type { NavItem, PolicyInfo, SiteData } from '@/types';

const DEFAULT_NAV: NavItem[] = [
  { label: 'Home', link: '#hero' },
  { label: 'About', link: '#about' },
  { label: 'Skills', link: '#skills' },
  { label: 'Experience', link: '#experience' },
  { label: 'Services', link: '#services' },
  { label: 'Portfolio', link: '#portfolio' },
  { label: 'Testimonials', link: '#testimonials' },
  { label: 'Contact', link: '#contact' },
];

interface PolicyPageLayoutProps {
  policyKey: 'privacy' | 'terms';
  defaultTitle: string;
  children: ReactNode;
}

export default function PolicyPageLayout({
  policyKey,
  defaultTitle,
  children,
}: PolicyPageLayoutProps) {
  const { data, loading, error, retry } = useSiteData();
  const policy: PolicyInfo | undefined = data?.site.policies[policyKey];

  usePolicyTheme();
  useDocumentTitle(policy?.title ?? defaultTitle);

  const site: SiteData | undefined = data?.site;

  return (
    <PageStatus loading={loading} error={error} onRetry={retry}>
      <Header
        scrollEnabled
        logoText={site?.logo.text ?? 'Dev'}
        logoSpan={site?.logo.span ?? 'Portfolio.'}
        favicon={site?.favicon}
        nav={site?.nav ?? DEFAULT_NAV}
      />

      <main className="policy-page reveal active">
        <div className="container">
          <Link to="/" className="back-home">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Back to Home
          </Link>
          <div className="policy-content">
            <h1 id="policy-title">{policy?.heading ?? defaultTitle}</h1>
            <p id="last-updated">
              Last updated: {policy?.lastUpdated ?? 'February 15, 2026'}
            </p>
            {children}
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <p>&copy; 2026 MD Shoaib Khan. All rights reserved.</p>
        </div>
      </footer>
    </PageStatus>
  );
}
