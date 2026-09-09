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
    inLanguage: 'en',
    publisher: personRef(),
  };
}

export function serviceNode(opts: {
  name: string;
  description: string;
  url: string;
  serviceType: string;
  areaServed?: string[];
}) {
  return {
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    serviceType: opts.serviceType,
    provider: personRef(),
    areaServed: (opts.areaServed ?? ['Canada', 'United States', 'Worldwide']).map((n) => ({
      '@type': 'Place',
      name: n,
    })),
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
