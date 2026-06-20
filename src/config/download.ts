import { getContactApiUrl } from '@/config/contact';

function normalizeApiUrl(apiUrl: string): string {
  return apiUrl.trim().replace(/\/+$/, '');
}

export function getResumeDownloadApiUrl(): string {
  const contactApiUrl = getContactApiUrl();

  if (!contactApiUrl) {
    return '';
  }

  if (contactApiUrl.startsWith('/')) {
    return '/api/resume-download';
  }

  return `${normalizeApiUrl(contactApiUrl)}/resume-download`;
}

export function isResumeDownloadTrackingConfigured(): boolean {
  return Boolean(getResumeDownloadApiUrl());
}
