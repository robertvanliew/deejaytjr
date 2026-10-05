import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

// Static by default (zero JS). Server-rendered exceptions: /api/lead, and the
// admin at /keystatic (+ its API), which Keystatic injects as on-demand routes.
// To move to Cloudflare Pages: npm i @astrojs/cloudflare and swap the adapter.
export default defineConfig({
  site: 'https://www.deejaytjr.com',
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'never',
  integrations: [
    react(),
    keystatic(),
    sitemap({
      filter: (page) =>
        !page.includes('/privacy') && !page.includes('/terms') && !page.includes('/keystatic'),
    }),
  ],
  build: { inlineStylesheets: 'auto', format: 'file' },
  image: { responsiveStyles: true },
  vite: {
    build: { cssMinify: 'lightningcss' },
    /* @keystatic/astro imports astro:env/server, a virtual module only Astro's
       own pipeline can resolve. Left to Vite's dependency pre-bundler (or to
       Node as an external), that import fails and the admin cannot save. */
    optimizeDeps: { exclude: ['@keystatic/astro'] },
    ssr: { noExternal: ['@keystatic/astro'] },
  },
});
