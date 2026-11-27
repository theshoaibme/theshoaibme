import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { SEO_ENTITY } from '@/config/seo';
import { SITE_URL } from '@/config/site';
import { buildPolicyPageJsonLd } from '@/lib/structuredData';
import TermsPage from '@/views/TermsPage';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `Terms of Service for ${SEO_ENTITY.name}'s portfolio and software engineering services (${SITE_URL}).`,
  alternates: {
    canonical: '/terms',
  },
};

export default function Page() {
  return (
    <>
      <JsonLd data={buildPolicyPageJsonLd('Terms of Service', '/terms')} />
      <TermsPage />
    </>
  );
}
