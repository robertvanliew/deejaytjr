import data from '../data/markets.json';
import { SITE } from '../data/site';

/**
 * International markets: typed access to src/data/markets.json.
 *
 * The publishing rule lives here and nowhere else: a page is LIVE only when
 * its locale entry has reviewed:true. Drafts still build (so a native reviewer
 * can read them at their real URL) but are noindex, left out of the sitemap,
 * left out of hreflang and the language switcher, and never linked. That is
 * what lets machine-drafted Portuguese and French exist in the repo without
 * ever being published as if a person had written them.
 */

export type Locale = 'en' | 'pt-br' | 'fr';
export const LOCALES: Locale[] = ['en', 'pt-br', 'fr'];

/** BCP 47 tags for <html lang>, hreflang and og:locale. */
export const LANG_TAG: Record<Locale, string> = { en: 'en', 'pt-br': 'pt-BR', fr: 'fr' };
export const OG_LOCALE: Record<Locale, string> = { en: 'en_US', 'pt-br': 'pt_BR', fr: 'fr_FR' };

export interface FaqEntry { q: string; a: string }

export interface MarketPage {
  path: string;
  reviewed: boolean;
  title?: string;
  description?: string;
  h1?: string;
  lede?: string;
  proof?: string;
  proofSource?: string;
  faq?: FaqEntry[];
}

export interface Market {
  key: string;
  kind: 'country' | 'city';
  parent: string | null;
  name: Partial<Record<Locale, string>>;
  currency?: 'USD' | 'CAD';
  airport?: string;
  /** true = direct from YYZ; null = not claimed. Never guess. */
  direct?: boolean | null;
  nearby?: string[];
  video?: string;
  photo?: string;
  lanes?: string[];
  cities?: string[];
  pages: Partial<Record<Locale, MarketPage>>;
}

export const MARKETS = data.markets as unknown as Market[];
export const MARKETS_UPDATED: string = data.updated;

export const market = (key: string) => {
  const m = MARKETS.find((x) => x.key === key);
  if (!m) throw new Error(`Unknown market: ${key}`);
  return m;
};

export const nameOf = (m: Market, locale: Locale) => m.name[locale] ?? m.name.en ?? m.key;

/** A page that is reviewed and therefore public. */
export const isLive = (m: Market, locale: Locale) => !!m.pages[locale]?.reviewed;

/** Public URL of a market in a locale, or null when that page is not live. */
export const liveHref = (key: string, locale: Locale): string | null => {
  const m = MARKETS.find((x) => x.key === key);
  return m && isLive(m, locale) ? m.pages[locale]!.path : null;
};

/**
 * hreflang set for a page: every LIVE sibling, the page itself included, plus
 * x-default (the English page, else the page itself). Reciprocal by
 * construction, since every sibling computes the same set. Empty for drafts.
 */
export function alternates(m: Market, locale: Locale) {
  if (!isLive(m, locale)) return [];
  const live = LOCALES.filter((l) => isLive(m, l));
  const links = live.map((l) => ({ hreflang: LANG_TAG[l], href: `${SITE.url}${m.pages[l]!.path}`, locale: l }));
  const xd = isLive(m, 'en') ? m.pages.en!.path : m.pages[locale]!.path;
  return [...links, { hreflang: 'x-default', href: `${SITE.url}${xd}`, locale: 'en' as Locale }];
}

/** Every built URL that is still a draft: kept out of the sitemap. */
export const DRAFT_PATHS = MARKETS.flatMap((m) =>
  LOCALES.filter((l) => m.pages[l] && !m.pages[l]!.reviewed).map((l) => m.pages[l]!.path)
);

/** City entries under a country that have a page in this locale (live or draft). */
export const citiesOf = (countryKey: string) =>
  MARKETS.filter((m) => m.kind === 'city' && m.parent === countryKey);

/**
 * The one currency rule, everywhere it is stated. Spec: US dates in USD;
 * Brazil, France, UK and South Africa in USD or local currency on request;
 * Canada in CAD plus HST.
 */
export function currencyRule(locale: Locale): string {
  return {
    en: 'Currency: US dates are quoted in US dollars. Brazil, France, the UK and South Africa are quoted in US dollars, or local currency on request. Canadian dates are quoted in Canadian dollars plus HST.',
    'pt-br': 'Moeda: datas nos EUA são orçadas em dólares americanos. Brasil, França, Reino Unido e África do Sul, em dólares americanos ou na moeda local, se preferir. Datas no Canadá, em dólares canadenses mais HST.',
    fr: 'Devise : les dates aux États-Unis sont chiffrées en dollars américains. Brésil, France, Royaume-Uni et Afrique du Sud : en dollars américains, ou en devise locale sur demande. Canada : en dollars canadiens plus HST.',
  }[locale];
}

/** Locale-aware date for display (17 de outubro; 17 octobre). */
export const fmtDate = (iso: string, locale: Locale) =>
  new Intl.DateTimeFormat(LANG_TAG[locale], { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(`${iso}T12:00:00`)
  );
