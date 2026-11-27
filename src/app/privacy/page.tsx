import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { SEO_ENTITY } from '@/config/seo';
import { SITE_URL } from '@/config/site';
import { buildPolicyPageJsonLd } from '@/lib/structuredData';
import PrivacyPage from '@/views/PrivacyPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Privacy Policy for ${SEO_ENTITY.name}'s portfolio website (${SITE_URL}).`,
  alternates: {
    canonical: '/privacy',
  },
};

export default function Page() {
  return (
    <>
      <JsonLd data={buildPolicyPageJsonLd('Privacy Policy', '/privacy')} />
      <PrivacyPage />
    </>
  );
}
