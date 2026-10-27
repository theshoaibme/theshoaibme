import type { PortfolioData } from '@/types';
import {
  clearPortfolioDataCache,
  getCachedPortfolioData,
  portfolioService,
} from '@/services';

export { clearPortfolioDataCache, getCachedPortfolioData };

export async function loadPortfolioData(options: { force?: boolean } = {}): Promise<PortfolioData> {
  const response = await portfolioService.getPortfolioData({ force: options.force });
  return response.data;
}

