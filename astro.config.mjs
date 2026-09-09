import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Static by default (zero JS). Only /api/lead opts out via `prerender = false`.
// To move to Cloudflare Pages: npm i @astrojs/cloudflare and swap the adapter.
export default defineConfig({
  site: 'https://www.deejaytjr.com',
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'never',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/privacy') && !page.includes('/terms'),
    }),
  ],
  build: { inlineStylesheets: 'auto', format: 'file' },
  image: { responsiveStyles: true },
  vite: { build: { cssMinify: 'lightningcss' } },
});
