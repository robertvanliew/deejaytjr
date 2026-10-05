/**
 * Audience data for the media kit.
 *
 * Everything a brand, agency or promoter reads about her reach is derived here
 * from the dated snapshots in `src/content/audience/`. Nothing is hardcoded in
 * a page, which is the point: a growth percentage can never contradict the
 * follower count it was calculated from, and updating her numbers means adding
 * one file rather than editing six.
 *
 * PER-PLATFORM DATES, not one date for everything. In practice you rarely
 * capture all seven platforms on the same day — YouTube refreshes itself from
 * the API, the rest get read off her public profiles when someone has a
 * moment. So each platform carries the date of the most recent snapshot that
 * actually gave it a number, and growth for that platform compares against the
 * previous snapshot that did. A partial snapshot is a first-class thing: write
 * down what you know today and it slots in beside what was known before.
 *
 * Two rules this module never breaks:
 *   1. A number that was not supplied stays `null`. It renders as "pending",
 *      never as zero and never as an estimate. A brand team checks these
 *      against her live profiles, so an invented figure is worse than a gap.
 *   2. Every figure carries the date it was captured.
 */

import { getCollection, type CollectionEntry } from 'astro:content';
import { SOCIALS } from '../data/site';

export type Snapshot = CollectionEntry<'audience'>['data'];

export interface PlatformReach {
  key: string;
  label: string;
  url: string;
  unit: string;
  followers: number | null;
  /** Date of the snapshot this figure came from. */
  asOf: string | null;
  asOfLabel: string | null;
  /** Change against the previous snapshot that carried a figure for this platform. */
  delta: number | null;
  deltaPct: number | null;
  /** How that comparison was framed, e.g. "since June 2026". */
  deltaSince: string | null;
  /** True when this platform's figure is measurably older than the newest data. */
  stale: boolean;
  /** The platform rounds the number it displays. */
  approx: boolean;
  /** How the figure was obtained. "api" values refresh themselves. */
  source: 'api' | 'manual' | null;
}

export interface AudienceSummary {
  /** Newest capture date across all data. */
  asOf: string | null;
  asOfLabel: string | null;
  /** Oldest date still contributing a published figure — the honest caveat. */
  oldestContributing: string | null;
  oldestContributingLabel: string | null;
  source: string | null;
  ageDays: number | null;
  stale: boolean;

  platforms: PlatformReach[];
  hasPlatformDetail: boolean;
  /** Platforms with no figure at all yet. */
  pendingPlatforms: PlatformReach[];

  totalFollowers: number | null;
  totalDeltaPct: number | null;
  totalIsAggregate: boolean;
  /** Built from figures the platforms themselves rounded. */
  totalIsApprox: boolean;

  demographics: Snapshot['demographics'];
  countries: Snapshot['countries'];
  highlights: Snapshot['highlights'];
  snapshotCount: number;
}

const PLATFORM_LABELS: Record<string, string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
  twitch: 'Twitch',
  facebook: 'Facebook',
  x: 'X',
  soundcloud: 'SoundCloud',
  bandcamp: 'Bandcamp',
};

/**
 * The platforms the media kit tracks, in display order — biggest first.
 * Facebook, X, SoundCloud and Bandcamp were dropped at the client's request:
 * they are not where her audience is, and a "pending" cell for a platform
 * nobody is measuring reads as a gap rather than as a decision.
 */
const PLATFORM_ORDER = ['instagram', 'tiktok', 'youtube', 'twitch'];

/** Anything older than this is very likely to disagree with her live profiles. */
const STALE_AFTER_DAYS = 120;

const label = (iso: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' });
};

const daysSince = (iso: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : Math.floor((Date.now() - d.getTime()) / 86_400_000);
};

const urlFor = (key: string) =>
  SOCIALS.find((s) => s.label.toLowerCase() === PLATFORM_LABELS[key]?.toLowerCase())?.url ?? '#';

export async function getSnapshots(): Promise<Snapshot[]> {
  const entries = await getCollection('audience');
  return entries
    .map((e) => e.data)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getAudience(): Promise<AudienceSummary> {
  const snapshots = await getSnapshots();

  const empty: AudienceSummary = {
    asOf: null,
    asOfLabel: null,
    oldestContributing: null,
    oldestContributingLabel: null,
    source: null,
    ageDays: null,
    stale: false,
    platforms: [],
    hasPlatformDetail: false,
    pendingPlatforms: [],
    totalFollowers: null,
    totalDeltaPct: null,
    totalIsAggregate: false,
    totalIsApprox: false,
    demographics: { malePct: null, femalePct: null, coreAge: null },
    countries: [],
    highlights: [],
    snapshotCount: 0,
  };
  if (!snapshots.length) return empty;

  const newest = snapshots[0]!;

  /* For each platform, walk newest to oldest and collect every snapshot that
     actually carried a figure. The first is current, the second is what we
     measure growth against. */
  const platforms: PlatformReach[] = PLATFORM_ORDER.map((key) => {
    const history = snapshots
      .map((s) => ({ snap: s, entry: s.platforms.find((p) => p.key === key) }))
      .filter((h) => typeof h.entry?.followers === 'number') as {
      snap: Snapshot;
      entry: NonNullable<Snapshot['platforms'][number]>;
    }[];

    const current = history[0];
    const prior = history[1];
    const canCompare = current && prior && (prior.entry.followers ?? 0) > 0;

    const anyEntry =
      current?.entry ?? snapshots.map((s) => s.platforms.find((p) => p.key === key)).find(Boolean);

    return {
      key,
      label: PLATFORM_LABELS[key] ?? key,
      url: urlFor(key),
      unit: anyEntry?.unit ?? 'followers',
      followers: current?.entry.followers ?? null,
      asOf: current?.snap.date ?? null,
      asOfLabel: label(current?.snap.date ?? null),
      delta: canCompare ? current!.entry.followers! - prior!.entry.followers! : null,
      deltaPct: canCompare
        ? ((current!.entry.followers! - prior!.entry.followers!) / prior!.entry.followers!) * 100
        : null,
      deltaSince: canCompare ? label(prior!.snap.date) : null,
      stale: (daysSince(current?.snap.date ?? null) ?? 0) > STALE_AFTER_DAYS,
      approx: current?.entry.approx ?? false,
      source: (current?.entry.source as 'api' | 'manual' | undefined) ?? null,
    };
  });

  const known = platforms.filter((p) => typeof p.followers === 'number');
  const summed = known.length ? known.reduce((a, p) => a + (p.followers ?? 0), 0) : null;
  /* If any contributing figure was rounded at source, the total is rounded too. */
  const summedIsApprox = known.some((p) => p.approx);

  /* Fall back to the most recent supplied aggregate only while no per-platform
     figure exists at all. Mixing a real sum with an aggregate would double-count. */
  const aggregate = snapshots.find((s) => s.totalFollowersOverride !== null)?.totalFollowersOverride ?? null;
  const total = summed ?? aggregate;

  /* Sections that are supplied wholesale rather than per-platform: take the
     newest snapshot that actually defines them. */
  const demographics =
    snapshots.find((s) => s.demographics.malePct !== null || s.demographics.coreAge !== null)
      ?.demographics ?? empty.demographics;
  const countries = snapshots.find((s) => s.countries.length)?.countries ?? [];
  const highlights = snapshots.find((s) => s.highlights.length)?.highlights ?? [];

  const contributingDates = known.map((p) => p.asOf!).filter(Boolean).sort();
  const oldestContributing = contributingDates[0] ?? newest.date;

  return {
    asOf: newest.date,
    asOfLabel: label(newest.date),
    oldestContributing,
    oldestContributingLabel: label(oldestContributing),
    source: newest.source ?? null,
    ageDays: daysSince(newest.date),
    stale: (daysSince(oldestContributing) ?? 0) > STALE_AFTER_DAYS,
    platforms,
    hasPlatformDetail: known.length > 0,
    pendingPlatforms: platforms.filter((p) => p.followers === null),
    totalFollowers: total,
    totalDeltaPct: null,
    totalIsAggregate: summed === null && aggregate !== null,
    totalIsApprox: summed !== null && summedIsApprox,
    demographics,
    countries,
    highlights,
    snapshotCount: snapshots.length,
  };
}

/**
 * "116,000+" when the parts were rounded at source, "26,700" when they were
 * exact. Rounding DOWN to the nearest thousand and adding a plus is the honest
 * move: every figure it is built from was already rounded by the platform, so
 * an exact-looking total would claim a precision nobody has.
 */
export function formatFollowers(a: AudienceSummary): string | null {
  if (a.totalFollowers === null) return null;
  if (a.totalIsAggregate || a.totalIsApprox) {
    const floored = Math.floor(a.totalFollowers / 1000) * 1000;
    return `${floored.toLocaleString('en-CA')}+`;
  }
  return a.totalFollowers.toLocaleString('en-CA');
}

/** "78K" style, matching how the platform itself displays it. */
export function formatPlatformCount(p: PlatformReach): string | null {
  if (p.followers === null) return null;
  return p.followers.toLocaleString('en-CA');
}

export function formatPct(pct: number | null): string | null {
  if (pct === null) return null;
  const rounded = Math.abs(pct) >= 10 ? Math.round(pct) : Math.round(pct * 10) / 10;
  return `${pct >= 0 ? '+' : ''}${rounded}%`;
}

/**
 * The four credentials that lead every page. The follower cell is filled from
 * the audience data so it can never drift from the media kit; with no figure
 * supplied it falls back to a claim that needs no number.
 */
export async function getCredentials() {
  const a = await getAudience();
  const total = formatFollowers(a);

  return [
    {
      stat: 'Three-time champion',
      detail: 'DMC Canada DJ Championships, three consecutive years',
    },
    {
      stat: 'Top 9 in the world',
      detail: '2023 Technics DMC World DJ Championships finalist',
    },
    {
      stat: 'Four world stages',
      detail:
        'The only woman to compete at DMC World, IDA World, the Goldie Awards and Red Bull 3Style',
    },
    total
      ? {
          stat: `${total} followers`,
          /* Followers only. A likes or growth figure is a different measure and
             reads as part of this number if it shares the line (spec, Oct 2026). */
          detail: `Across Instagram, TikTok, YouTube and Twitch, with an audience in ${a.countries.length} countries.`,
        }
      : {
          stat: 'An international audience',
          detail: `Concentrated in ${a.countries.slice(0, 4).map((c) => c.name).join(', ')} and beyond.`,
        },
  ];
}
