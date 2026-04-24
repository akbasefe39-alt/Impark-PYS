import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = (DOMPurify as any)(window);

/**
 * Sanitizes rich text HTML content.
 */
export const sanitizeRichText = (html: string): string => {
  return purify.sanitize(html, {
    ALLOWED_TAGS: [
      'b',
      'i',
      'em',
      'strong',
      'a',
      'p',
      'br',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'blockquote',
      'code',
    ],
    ALLOWED_ATTR: ['href', 'target', 'title'],
  });
};

/**
 * Strips all HTML tags from a string.
 */
export const sanitizeSimpleText = (text: string): string => {
  return purify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};
