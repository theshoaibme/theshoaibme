import { getEnv } from '@/utils/env';

export function getResumeDownloadApiUrl(): string {
  return getEnv('RESUME_DOWNLOAD_API_URL').trim().replace(/\/+$/, '');
}

export function isResumeDownloadTrackingConfigured(): boolean {
  return Boolean(getResumeDownloadApiUrl());
}
