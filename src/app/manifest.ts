import type { MetadataRoute } from 'next';
import { SEO_ENTITY } from '@/config/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SEO_ENTITY.name} — Full Stack, Spring Boot & AI Engineer`,
    short_name: SEO_ENTITY.name,
    description: SEO_ENTITY.defaultDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0b57d0',
    icons: [
      {
        src: '/images/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/images/md-shoaib-khan-headshot.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  };
}
