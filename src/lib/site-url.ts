export const DEFAULT_SITE_URL = 'https://buji.example.com';

export function resolveSiteUrl(siteUrl: string | undefined) {
  return siteUrl || DEFAULT_SITE_URL;
}
