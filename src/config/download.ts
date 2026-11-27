import { getEnv } from '@/utils/env';

export function getResumeDownloadApiUrl(): string {
  const configured = getEnv('RESUME_DOWNLOAD_API_URL').trim().replace(/\/+$/, '');
  return configured || '/api/resume-download';
}

export function isResumeDownloadTrackingConfigured(): boolean {
  return Boolean(getResumeDownloadApiUrl());
}
