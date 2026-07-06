import { resolveSiteUrl } from './site-url';

export const SITE = {
  name: '不急',
  title: '不急',
  description: '一个关于技术、长期主义和慢节奏写作的个人博客。',
  url: resolveSiteUrl(import.meta.env.SITE_URL),
  author: '不急',
  email: 'hello@example.com',
};

export function getCanonicalUrl(pathname: string) {
  return new URL(pathname, SITE.url).toString();
}
