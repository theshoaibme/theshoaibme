import DOMPurify from 'dompurify';

const FOOTER_ALLOWED_TAGS = ['span', 'br', 'strong', 'em'];
const FOOTER_ALLOWED_ATTR = ['class'];

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: FOOTER_ALLOWED_TAGS,
    ALLOWED_ATTR: FOOTER_ALLOWED_ATTR,
  });
}
