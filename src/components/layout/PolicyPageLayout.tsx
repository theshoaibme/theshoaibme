import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import PageStatus from '@/components/common/PageStatus';
import PolicyHeader from '@/components/layout/PolicyHeader';
import { useDocumentTitle, useSiteData } from '@/hooks/data/useSiteData';
import { usePolicyTheme } from '@/hooks/ui/useTheme';
import type { PolicyInfo, SiteData } from '@/types';

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
      <PolicyHeader
        logoText={site?.logo.text ?? 'Dev'}
        logoSpan={site?.logo.span ?? 'Portfolio.'}
        favicon={site?.favicon}
      />

      <main className="policy-container reveal active">
        <Link to="/" className="back-home">
          <i className="fa-solid fa-arrow-left" /> Back to Home
        </Link>
        <div className="policy-content">
          <h1 id="policy-title">{policy?.heading ?? defaultTitle}</h1>
          <p id="last-updated">
            Last updated: {policy?.lastUpdated ?? 'February 15, 2026'}
          </p>
          {children}
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
