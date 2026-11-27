import OpenGraphImage from './opengraph-image';

export const runtime = 'nodejs';
export const alt =
  'MD Shoaib Khan — Full Stack Software Engineer | Spring Boot, Next.js, React & AI Systems';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function TwitterImage() {
  return OpenGraphImage();
}
