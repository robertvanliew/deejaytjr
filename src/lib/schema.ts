/**
 * JSON-LD builders. Section 9 of the brief.
 *
 * Every page emits a single `@graph` so nodes can reference each other by @id
 * instead of repeating the Person object. `personRef()` is what Service,
 * VideoObject and FAQPage nodes point at.
 */

import {
  SITE,
  ALTERNATE_NAMES,
  AWARDS,
  ROLES,
  ALL_PROFILES,
  ISNI_FORMATTED,
  ISNI_URL,
  WIKIDATA_ID,
  WIKIDATA_URL,
  MUSICBRAINZ_URL,
  PRESS_ARTICLES,
} from '../data/site';

export const PERSON_ID = `${SITE.url}/#person`;
export const WEBSITE_ID = `${SITE.url}/#website`;

export const personRef = () => ({ '@id': PERSON_ID });

export function personNode() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: SITE.name,
    alternateName: ALTERNATE_NAMES,
    jobTitle: 'DJ and Turntablist',
    description:
      'Three-time DMC Canadian DJ Champion (2022, 2023, 2024) and the only woman in DMC history to win three consecutive national championships. Available for corporate, private, club, festival and international bookings.',
    url: `${SITE.url}/`,
    /* Stable, unhashed URL (public/images) so the entity image never changes
       address between builds; knowledge panels and AI answers cache it. */
    image: {
      '@type': 'ImageObject',
      url: `${SITE.url}/images/deejay-t-jr.jpg`,
      width: 1200,
      height: 1500,
      caption: 'DEEJAY T-JR. performing',
      creditText: 'Joanna Foz-Dait',
    },
    knowsAbout: ['Turntablism', 'Scratch DJing', 'DJ battles', 'Open-format DJing', 'Event DJing', 'Hip-hop'],
    email: SITE.email,
    nationality: SITE.homeCountry,
    homeLocation: {
      '@type': 'Place',
      name: `${SITE.homeCity}, ${SITE.homeRegion}, ${SITE.homeCountry}`,
    },
    award: AWARDS.map((a) => a.title),
    /**
     * ISNI is what lets Wikidata, MusicBrainz and the models trained on them
     * resolve every mention of "DEEJAY T-JR" to one person. Section 9's entity
     * work depends on this being present and matching the external records.
     */
    identifier: [
      {
        '@type': 'PropertyValue',
        propertyID: 'ISNI',
        value: ISNI_FORMATTED,
        url: ISNI_URL,
      },
      {
        '@type': 'PropertyValue',
        propertyID: 'Wikidata',
        value: WIKIDATA_ID,
        url: WIKIDATA_URL,
      },
    ],
    /* Approved for public use (Oct 2026): the university only. Never her
       legal name, never hasCredential, never an academic distinction. */
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'University of Toronto',
      sameAs: 'https://www.wikidata.org/wiki/Q180865',
    },
    memberOf: {
      '@type': 'OrganizationRole',
      roleName: 'Branch Manager',
      memberOf: { '@type': 'Organization', name: 'DMC Canada' },
    },
    knowsLanguage: 'en',
    subjectOf: PRESS_ARTICLES.map((a) => ({
      '@type': 'NewsArticle',
      headline: a.headline,
      url: a.url,
      datePublished: a.date,
      author: { '@type': 'Person', name: a.author },
      publisher: { '@type': 'Organization', name: a.outlet },
    })),
    hasOccupation: ROLES.map((r) => ({
      '@type': 'Role',
      roleName: r.title,
      description: r.detail,
    })),
    /* Authority records first: they are the strongest signal for entity
       resolution, and Wikidata is the one most downstream consumers follow. */
    sameAs: [WIKIDATA_URL, MUSICBRAINZ_URL, ISNI_URL, ...ALL_PROFILES.map((s) => s.url)],
  };
}

export function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE.url}/`,
    name: SITE.name,
    alternateName: ALTERNATE_NAMES,
    /* English everywhere; Portuguese and French on the reviewed market pages. */
    inLanguage: ['en', 'pt-BR', 'fr'],
    publisher: personRef(),
    about: personRef(),
  };
}

/**
 * The page node every page gets. ProfilePage on /about (Google's profile
 * rich result for a person), ContactPage on /contact, CollectionPage on the
 * listing pages; WebPage elsewhere. All point at the one Person @id.
 */
const PAGE_TYPES: Record<string, string> = {
  '/about': 'ProfilePage',
  '/contact': 'ContactPage',
  '/watch': 'CollectionPage',
  '/press': 'CollectionPage',
  '/latest': 'CollectionPage',
};
export function webPageNode(opts: {
  path: string;
  title: string;
  description: string;
  inLanguage: string;
  image: string;
  dateModified?: string;
}) {
  const url = `${SITE.url}${opts.path === '/' ? '/' : opts.path}`;
  const type = PAGE_TYPES[opts.path] ?? 'WebPage';
  return {
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name: opts.title,
    description: opts.description,
    inLanguage: opts.inLanguage,
    isPartOf: { '@id': WEBSITE_ID },
    primaryImageOfPage: { '@type': 'ImageObject', url: opts.image },
    ...(type === 'ProfilePage' ? { mainEntity: personRef() } : { about: personRef() }),
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
  };
}

export function serviceNode(opts: {
  name: string;
  description: string;
  url: string;
  serviceType: string | string[];
  areaServed?: string[];
  /** Typed areas for market pages: a Country, or a City contained in one. */
  area?: { type: 'Country' | 'City'; name: string; country?: string };
  /** BCP 47 tags the service is offered in, e.g. ['en', 'pt-BR']. */
  availableLanguage?: string[];
}) {
  const areaServed = opts.area
    ? [
        {
          '@type': opts.area.type,
          name: opts.area.name,
          ...(opts.area.country ? { containedInPlace: { '@type': 'Country', name: opts.area.country } } : {}),
        },
      ]
    : (opts.areaServed ?? ['Canada', 'United States', 'Worldwide']).map((n) => ({ '@type': 'Place', name: n }));
  return {
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    serviceType: opts.serviceType,
    provider: personRef(),
    areaServed,
    ...(opts.availableLanguage ? { availableLanguage: opts.availableLanguage } : {}),
  };
}

/** VideoObject for one entry of the videos collection. Null until it has a YouTube ID. */
export function videoNode(v: {
  title: string;
  description: string;
  youtubeId: string | null;
  start?: number | null;
  duration?: string | null;
  uploadDate?: string | null;
  date?: string | null;
}) {
  if (!v.youtubeId) return null;
  const uploadDate = v.uploadDate ?? (v.date && /^\d{4}$/.test(v.date) ? `${v.date}-01-01` : undefined);
  return {
    '@type': 'VideoObject',
    name: v.title,
    description: v.description,
    thumbnailUrl: `https://i.ytimg.com/vi/${v.youtubeId}/maxresdefault.jpg`,
    contentUrl: `https://www.youtube.com/watch?v=${v.youtubeId}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${v.youtubeId}` + (v.start ? `?start=${v.start}` : ''),
    ...(v.duration ? { duration: v.duration } : {}),
    ...(uploadDate ? { uploadDate } : {}),
    author: personRef(),
  };
}

export function faqNode(items: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };
}

/** Section 9: BreadcrumbList on all nested pages. */
export function breadcrumbNode(trail: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: `${SITE.url}${t.path}`,
    })),
  };
}

export function graph(nodes: object[]) {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes });
}
