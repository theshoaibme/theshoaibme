import JsonLd from '@/components/seo/JsonLd';
import { buildHomeJsonLd } from '@/lib/structuredData';
import { portfolioService } from '@/services';
import HomePage from '@/views/HomePage';

export default async function Page() {
  const { data } = await portfolioService.getPortfolioData();

  return (
    <>
      <JsonLd data={buildHomeJsonLd(data)} />
      <HomePage />
    </>
  );
}
