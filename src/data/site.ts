/**
 * Single source of truth for facts that appear in more than one place:
 * name formatting, awards, socials, nav, credentials, client marks.
 *
 * Anything here that also appears in structured data is emitted from here, so
 * the JSON-LD `sameAs` list and the footer links can never drift apart.
 * Section 9 of the brief requires that list to match the entity cleanup exactly.
 */

export const SITE = {
  /** Always with the trailing period. Section 9, entity cleanup. */
  name: 'DEEJAY T-JR.',
  legalName: 'DEEJAY T-JR.',
  url: 'https://www.deejaytjr.com',
  email: 'mgmt@deejaytjr.com',
  homeCity: 'Toronto',
  homeRegion: 'Ontario',
  homeCountry: 'Canada',
  defaultOgImage: '/og/default.png',
} as const;

export const ALTERNATE_NAMES = ['Deejay T-JR', 'T-JR', 'DJ T-JR'];

/**
 * ISNI — the ISO standard identifier for a public identity.
 *
 * This is the single most useful thing on the site for section 9's entity
 * work: it is the identifier Wikidata, MusicBrainz, library systems and the
 * language models trained on them use to decide that every mention of
 * "DEEJAY T-JR" is the same person. Emitted as `identifier` on the Person node
 * and linked from the press page.
 */
export const ISNI = '0000000514212597';
export const ISNI_FORMATTED = '0000 0005 1421 2597';
export const ISNI_URL = `https://isni.org/isni/${ISNI}`;

/**
 * Authority records. These are what section 9's entity work actually hangs on:
 * they are the records Google's Knowledge Graph and the language models trained
 * on Wikidata consult to decide who "DEEJAY T-JR." is.
 *
 * The Wikidata item carries the same ISNI as above, independently — which is
 * the cross-check that says both records describe the same person.
 *
 * Every value here must match the live record exactly. If one changes there,
 * change it here in the same sitting.
 */
export const WIKIDATA_ID = 'Q124713741';
export const WIKIDATA_URL = `https://www.wikidata.org/wiki/${WIKIDATA_ID}`;

export const MUSICBRAINZ_ID = '792331fe-6e0b-48cc-911f-a986c03e4883';
export const MUSICBRAINZ_URL = `https://musicbrainz.org/artist/${MUSICBRAINZ_ID}`;

/** Rendered on /press so a journalist or cataloguer can confirm the person. */
export const AUTHORITY_RECORDS = [
  { label: 'Wikidata', value: WIKIDATA_ID, url: WIKIDATA_URL },
  { label: 'ISNI', value: ISNI_FORMATTED, url: ISNI_URL },
  { label: 'MusicBrainz', value: MUSICBRAINZ_ID, url: MUSICBRAINZ_URL },
];

/**
 * Competitive record, newest first. `source` is an authoritative third-party
 * page confirming the result — the governing body's own site wherever
 * possible. Anything without one is unsourced and is marked as such in
 * ASSETS-NEEDED.md; before adding a claim here, find the page that proves it.
 */
export interface Award {
  title: string;
  source?: string;
  sourceLabel?: string;
}

export const AWARDS: Award[] = [
  {
    title: '2024 DMC Canada DJ Champion',
    source: 'https://www.dmcdjchamps.com/post/dmc-world-dj-championships-expands-with-new-branches-and-managers-for-2025',
    sourceLabel: 'DMC World',
  },
  {
    title: '2023 DMC Canada DJ Champion',
    source: 'https://www.dmcdjchamps.com/post/dmc-world-dj-championships-expands-with-new-branches-and-managers-for-2025',
    sourceLabel: 'DMC World',
  },
  {
    title: '2022 DMC Canada DJ Champion',
    source: 'https://www.dmcdjchamps.com/post/dmc-world-dj-championships-expands-with-new-branches-and-managers-for-2025',
    sourceLabel: 'DMC World',
  },
  {
    title: '2023 DMC World DJ Championships — 9th place',
    source:
      'https://www.dmcdjchamps.com/post/2023-technics-dmc-world-finals-results-judges-scores',
    sourceLabel: 'DMC World results and judges’ scores',
  },
  {
    title: '2024 DMC World DJ Championships, Paris — competitor',
    source: 'https://www.youtube.com/watch?v=KtJcGj5j6Kc&t=19722',
    sourceLabel: 'DMC World stream',
  },
  { title: '2023 IDA World DJ Championships Technical Category Finalist' },
  {
    title: '2019 Goldie Awards competitor',
    source: 'https://www.goldieawards.com/2019',
    sourceLabel: 'Goldie Awards 2019',
  },
  {
    title: '2018 Red Bull 3Style Canada — 3rd place',
    source: 'https://www.youtube.com/watch?v=4i-yM_2LCLo',
    sourceLabel: 'Full routine',
  },
];

/**
 * Positions held, as distinct from results won. Being trusted by the governing
 * body to help run its Canadian branch is a different kind of credential from
 * winning its championship, and it is the one that says she is part of how the
 * sport is run rather than only someone who competes in it.
 */
export const ROLES = [
  {
    title: 'DMC Canada Branch Manager',
    detail:
      'Appointed for 2025 alongside Jake “Vekked” Meyer and DJ Relik to run the DMC World DJ Championships in Canada.',
    source:
      'https://www.dmcdjchamps.com/post/dmc-world-dj-championships-expands-with-new-branches-and-managers-for-2025',
    sourceLabel: 'DMC World branch announcement',
  },
];

/**
 * Profiles, grouped by what they are for.
 *
 * All three groups feed the Person node's `sameAs`, because every verified
 * profile strengthens entity resolution. They are grouped so the footer can
 * separate "follow her" from "listen to her" instead of printing twelve links
 * in one undifferentiated row.
 *
 * `urlFor()` in lib/audience.ts resolves tracked platforms against SOCIALS, so
 * anything with a follower count belongs in that group.
 *
 * Every handle here was checked against her live profiles and against the
 * Wikidata item in September 2026.
 */
export const SOCIALS = [
  { label: 'Instagram', url: 'https://www.instagram.com/deejaytjr/' },
  { label: 'TikTok', url: 'https://www.tiktok.com/@deejaytjr' },
  { label: 'YouTube', url: 'https://www.youtube.com/@deejaytjr' },
  { label: 'Twitch', url: 'https://www.twitch.tv/deejaytjr' },
  { label: 'X', url: 'https://x.com/deejaytjr' },
  { label: 'Facebook', url: 'https://facebook.com/deejaytjrofficial' },
];

/** Where the music lives. Catalogue rather than audience. */
export const MUSIC_PLATFORMS = [
  { label: 'Spotify', url: 'https://open.spotify.com/artist/1y5sAktWX9goimMIlwDHkk' },
  { label: 'Apple Music', url: 'https://music.apple.com/us/artist/deejay-t-jr/1734354584' },
  { label: 'SoundCloud', url: 'https://soundcloud.com/deejaytjr' },
  { label: 'Mixcloud', url: 'https://www.mixcloud.com/deejaytjr/' },
  { label: 'Bandcamp', url: 'https://deejaytjr.bandcamp.com' },
];

/** UNVERIFIED — see ASSETS-NEEDED.md. Confirm before launch. */
export const SUPPORT_PLATFORMS = [
  { label: 'Patreon', url: 'https://www.patreon.com/deejaytjr' },
];

/** Everything, for `sameAs` and the press page's profile list. */
export const ALL_PROFILES = [...SOCIALS, ...MUSIC_PLATFORMS, ...SUPPORT_PLATFORMS];

/** Desktop nav, section 4. The tan CTA is rendered separately, not from this list. */
export const NAV = [
  { label: 'Corporate', href: '/corporate-events' },
  { label: 'Private', href: '/private-events' },
  { label: 'International', href: '/international' },
  { label: 'Brands', href: '/brand-partnerships' },
  { label: 'Listen', href: '/music' },
  { label: 'The Story', href: '/about' },
  { label: 'Press', href: '/press' },
  /* Sits beside Press because it serves the same reader: someone deciding
     from a link rather than from the room. */
  { label: 'Media kit', href: '/media-kit' },
];

/*
 * The four credentials that lead every page used to live here. They are now
 * built by `getCredentials()` in lib/audience.ts, so the follower cell comes
 * from the dated snapshots instead of from a number typed into this file.
 */

export interface ClientMark {
  /** Always required. Renders as the wordmark until a file exists, and is the
      accessible name even once a logo is showing. */
  name: string;
  /**
   * Filename inside /public/logo/clients/. Omit and the mark renders as a
   * serif wordmark, which is what every entry did before logo permission was
   * granted. Add the file and it becomes a logo with no other change.
   */
  file?: string;
  /**
   * Optical height in px. Logos do not balance at a single shared height — a
   * wide wordmark like "Government of Ontario" reads far bigger than a compact
   * roundel at the same measurement. Tune per mark by eye, do not leave at the
   * default and assume it is right.
   */
  height?: number;
  /**
   * By default a logo is knocked out to a single ink so the strip reads as one
   * designed row rather than six competing brand palettes. Set this when a
   * brand's guidelines require full colour.
   */
  color?: boolean;
}

/**
 * Client marks. Logo use is confirmed as permitted by the client (Sept 2026).
 *
 * Each file was taken from that organisation's own web property, never from a
 * logo-aggregator site, so the artwork is the current official one:
 *   mlse.svg      mlse.com
 *   ontario.svg   ontario.ca
 *   fairmont.svg  fairmont.com
 *   raptors.png   cdn.nba.com (official team CDN)
 *   pioneerdj.svg assets.alphatheta.com (Pioneer DJ's parent company)
 *   namm.svg      namm.org (lifted from the site header, which inlines it)
 *
 * Heights are optical, not mathematical: these logos have wildly different
 * aspect ratios and internal weights, so a shared height makes the wide
 * wordmarks shout and the roundel disappear. Re-tune by eye if a file changes.
 */
export const CLIENT_MARKS: ClientMark[] = [
  { name: 'MLSE', file: 'mlse.svg', height: 21 },
  /**
   * Full colour, and not a stylistic choice. Ontario's visual identity rules
   * do not permit third parties to recolour or alter the trillium, so it is
   * the one mark here that must render exactly as supplied. It is also the one
   * mark a knockout would wreck regardless: the trillium is cut OUT of a solid
   * plate rather than drawn onto it, so flattening it to a single ink fills
   * the cutout and leaves a blob.
   */
  { name: 'Government of Ontario', file: 'ontario.svg', height: 26, color: true },
  { name: 'Fairmont Royal York', file: 'fairmont.svg', height: 42 },
  { name: 'Toronto Raptors', file: 'raptors.png', height: 32 },
  { name: 'Pioneer DJ', file: 'pioneerdj.svg', height: 19 },
  { name: 'NAMM', file: 'namm.svg', height: 26 },
];

/** Event type options. Shared by the form and by service-page pre-selection. */
export const EVENT_TYPES = [
  { value: 'corporate', label: 'Corporate event' },
  { value: 'private', label: 'Private event' },
  { value: 'club', label: 'Club or festival' },
  { value: 'brand', label: 'Brand partnership or showcase' },
  { value: 'other', label: 'Other' },
];

/** Client to confirm ranges and currency before launch. Section 7. */
export const BUDGET_RANGES = [
  'Prefer not to say yet',
  'Under $2,500',
  '$2,500 to $5,000',
  '$5,000 to $10,000',
  '$10,000 and up',
];

export const YEARS = [
  { year: '2018', note: 'Third place, Red Bull 3Style Canada' },
  { year: '2019', note: 'Competed at the Goldie Awards' },
  { year: '2022', note: 'DMC Canada Champion' },
  { year: '2023', note: 'DMC Canada Champion. Top 9, DMC World Finals, London' },
  { year: '2024', note: 'DMC Canada Champion. Three consecutive national titles' },
];
