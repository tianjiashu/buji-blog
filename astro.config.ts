import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { resolveSiteUrl } from './src/lib/site-url';

export default defineConfig({
  site: resolveSiteUrl(process.env.SITE_URL),
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
