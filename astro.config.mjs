import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import { readFileSync } from 'node:fs';

/* International markets (src/data/markets.json) drive two sitemap rules:
   unreviewed translations are left out entirely, and every live market page
   lists its live language siblings as xhtml:link alternates, with lastmod. */
const SITE = 'https://www.deejaytjr.com';
const LANG = { en: 'en', 'pt-br': 'pt-BR', fr: 'fr' };
const markets = JSON.parse(readFileSync(new URL('./src/data/markets.json', import.meta.url), 'utf8'));
const drafts = new Set();
const alternatesFor = new Map();
for (const m of markets.markets) {
  const live = Object.entries(m.pages ?? {}).filter(([, p]) => p.reviewed);
  for (const [, p] of Object.entries(m.pages ?? {})) if (!p.reviewed) drafts.add(`${SITE}${p.path}`);
  const links = live.map(([l, p]) => ({ lang: LANG[l], url: `${SITE}${p.path}` }));
  for (const [, p] of live) alternatesFor.set(`${SITE}${p.path}`, links);
}
const strip = (u) => u.replace(/\/$/, '');
/* Under /pt-br/ and /fr/ only reviewed market pages belong in the sitemap;
   everything else there is a fallback redirect to English or a draft. */
const localized = (u) => /^https:\/\/www\.deejaytjr\.com\/(pt-br|fr)(\/|$)/.test(u);

// Static by default (zero JS). Server-rendered exceptions: /api/lead, and the
// admin at /keystatic (+ its API), which Keystatic injects as on-demand routes.
// To move to Cloudflare Pages: npm i @astrojs/cloudflare and swap the adapter.
export default defineConfig({
  site: 'https://www.deejaytjr.com',
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'never',
  /* English unprefixed at the root; Portuguese and French in their own folders
     on this domain (spec, Oct 2026). No automatic redirect by browser language
     or IP: that hides the other versions from Googlebot. */
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pt-br', 'fr'],
    routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false },
    /* An untranslated page never 404s: /fr/<anything> without a French page
       redirects to the English one. Those redirects stay out of the sitemap
       (see the filter below). */
    fallback: { 'pt-br': 'en', fr: 'en' },
  },
  integrations: [
    react(),
    /* Keystatic is the developer's local editor only. The live site's editor is
       /admin (password sign-in, no GitHub account), so /keystatic is not built
       on Vercel. */
    ...(process.env.VERCEL ? [] : [keystatic()]),
    sitemap({
      filter: (page) =>
        !page.includes('/privacy') &&
        !page.includes('/terms') &&
        !page.includes('/keystatic') &&
        !page.includes('/admin') &&
        !page.endsWith('/go') &&
        !drafts.has(strip(page)) &&
        (!localized(page) || alternatesFor.has(strip(page))),
      serialize(item) {
        const key = strip(item.url);
        const links = alternatesFor.get(key);
        if (links) {
          item.lastmod = markets.updated;
          /* Only when there is more than one live language: a lone page needs
             no alternates. x-default points at the English page. */
          if (links.length > 1) {
            const en = links.find((l) => l.lang === 'en') ?? links[0];
            item.links = [...links, { lang: 'x-default', url: en.url }];
          }
        }
        return item;
      },
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
