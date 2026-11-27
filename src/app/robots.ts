import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  const disallowed = ['/api/', '/loader'];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowed,
      },
      {
        userAgent: [
          'Googlebot',
          'Googlebot-Image',
          'Google-Extended',
          'Bingbot',
          'OAI-SearchBot',
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'Claude-Web',
          'anthropic-ai',
          'Applebot-Extended',
          'Meta-ExternalAgent',
          'FacebookExternalHit',
          'LinkedInBot',
          'Twitterbot',
          'TelegramBot',
        ],
        allow: ['/', '/images/', '/llms.txt', '/llms-full.txt'],
        disallow: disallowed,
      },
    ],
    host: SITE_URL,
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
