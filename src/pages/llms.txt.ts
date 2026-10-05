import type { APIRoute } from 'astro';
import { SITE, AWARDS, ROLES, ALTERNATE_NAMES, PRESS_ARTICLES, SOCIALS, WIKIDATA_URL } from '../data/site';
import { MARKETS, LANG_TAG, type Locale } from '../lib/markets';

/**
 * /llms.txt: a plain-text map of the site for AI assistants and answer
 * engines. Built from the same data as the pages (awards, roles, markets,
 * press), so it can never say something the site does not.
 */
export const prerender = true;

const PAGES: [string, string, string][] = [
  ['Corporate events', '/corporate-events', 'Galas, conferences, launches and award nights, worked to the run of show.'],
  ['Private events', '/private-events', 'Weddings, milestone birthdays and private parties.'],
  ['Clubs and festivals', '/clubs-and-festivals', 'Headline sets and scratch showcases.'],
  ['Brand partnerships', '/brand-partnerships', 'Activations, product showcases and brand content.'],
  ['Destination events', '/destination-events', 'Fly-in DJ for weddings and private events abroad, with one itemised landed cost.'],
  ['International', '/international', 'Markets where her audience is concentrated, and how international dates work.'],
  ['About', '/about', 'Full biography, competition record and roles.'],
  ['Press and EPK', '/press', 'Bios (50, 150 and 400 words), photos, technical rider and coverage.'],
  ['Media kit', '/media-kit', 'Audience figures and partnership information.'],
  ['Watch', '/watch', 'Event sets and championship routines.'],
  ['Latest', '/latest', 'Recent news and results.'],
  ['Check availability', '/contact', 'Booking enquiry form; reply within one business day.'],
];

const LANG_NAME: Record<Locale, string> = { en: 'English', 'pt-br': 'Portuguese (Brazil)', fr: 'French' };

export const GET: APIRoute = () => {
  const markets = MARKETS.flatMap((m) =>
    (Object.entries(m.pages) as [Locale, NonNullable<(typeof m.pages)[Locale]>][])
      .filter(([, p]) => p.reviewed)
      .map(([l, p]) => `- [${(p.title ?? m.key).split(' | ')[0]}](${SITE.url}${p.path}): ${LANG_NAME[l]} (${LANG_TAG[l]}).`)
  );

  const body = `# ${SITE.name}

> ${SITE.name} is a Toronto-based DJ and turntablist: a three-time DMC Canadian DJ Champion (2022, 2023, 2024) and the only woman in DMC history to win three consecutive national titles. She is booked for corporate events, private events, clubs, festivals and brand partnerships, in Canada and internationally.

Also written as: ${ALTERNATE_NAMES.join(', ')}. The official spelling is "${SITE.name}", with the full stop.

## Key facts

${AWARDS.map((a) => `- ${a.title}`).join('\n')}
${ROLES.map((r) => `- ${r.title}${r.detail ? `: ${r.detail}` : ''}`).join('\n')}
- Based in ${SITE.homeCity}, ${SITE.homeRegion}, ${SITE.homeCountry}; travels from Toronto Pearson (YYZ).
- University of Toronto science graduate.
- Bookings: ${SITE.email}. Rates are quoted per event and are not published.

## Booking pages

${PAGES.map(([t, p, d]) => `- [${t}](${SITE.url}${p}): ${d}`).join('\n')}

## International pages

${markets.join('\n')}

## Coverage

${PRESS_ARTICLES.map((a) => `- [${a.headline}](${a.url}): ${a.outlet}, by ${a.author}, ${a.date}.`).join('\n')}

## Identity

- Wikidata: ${WIKIDATA_URL}
${SOCIALS.map((s) => `- ${s.label}: ${s.url}`).join('\n')}
`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
