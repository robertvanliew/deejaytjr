import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Content the client should be able to edit without a developer (section 8).
 * These are JSON files in the repo now; the same schemas map cleanly onto a
 * Sanity or Decap dataset when the client wants a UI.
 *
 * Schemas are strict on purpose: a malformed testimonial fails the build
 * rather than shipping a broken card.
 */

const videos = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/videos' }),
  schema: z.object({
    title: z.string(),
    /** Drives the two tabs on /watch. */
    category: z.enum(['event', 'battle', 'interview']),
    /** Null until the client supplies the link. Renders as a marked slot. */
    youtubeId: z.string().nullable().default(null),
    description: z.string(),
    venue: z.string().optional(),
    date: z.string().optional(),
    /** ISO 8601 duration, e.g. "PT4M12S". Required by VideoObject schema. */
    duration: z.string().optional(),
    /**
     * Seconds into the video where her segment begins. Several of these are
     * multi-hour livestreams and documentaries; without this the viewer lands
     * at 0:00 and never finds her.
     */
    start: z.number().optional(),
    /** Lower sorts first. The large tile in the grid is order 1. */
    order: z.number().default(50),
    featured: z.boolean().default(false),
    /** Channel that published the clip, when it is not hers. Shown on the tile. */
    credit: z.string().optional(),
    creditUrl: z.string().url().optional(),
    /** Surfaces the clip on these service pages, beside the relevant claim. */
    services: z.array(z.enum(['corporate', 'private', 'club', 'brand'])).default([]),
  }),
});

const press = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/press' }),
  schema: z.object({
    title: z.string(),
    outlet: z.string(),
    date: z.string().optional(),
    url: z.string().url().nullable().default(null),
    excerpt: z.string(),
    order: z.number().default(50),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/testimonials' }),
  schema: z.object({
    quote: z.string(),
    name: z.string(),
    role: z.string(),
    company: z.string(),
    /** Section 11 item 4: nothing publishes without written permission. */
    permissionOnFile: z.boolean(),
    /** Which service pages this quote belongs on. */
    services: z.array(z.enum(['corporate', 'private', 'club', 'brand'])),
  }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/events' }),
  schema: z.object({
    name: z.string(),
    client: z.string(),
    city: z.string(),
    year: z.string(),
    type: z.enum(['corporate', 'private', 'club', 'brand']),
    venue: z.string().optional(),
    note: z.string().optional(),
    /** Only display named clients we have permission to name. */
    permissionOnFile: z.boolean().default(false),
  }),
});

/**
 * Audience snapshots — the media kit's data source.
 *
 * One file per capture date. The newest drives every figure on the site, and
 * growth is CALCULATED between snapshots rather than typed anywhere, so a
 * percentage can never contradict the follower count it came from.
 *
 * A platform with `followers: null` renders as "figure pending" rather than
 * as a zero or an invented number.
 */
const platform = z.object({
  key: z.enum(['tiktok', 'instagram', 'youtube', 'twitch', 'facebook', 'x', 'soundcloud', 'bandcamp']),
  followers: z.number().nullable().default(null),
  /** Instagram/TikTok call these different things; this labels the number. */
  unit: z.string().default('followers'),
  /** 'api' figures refresh themselves; 'manual' ones were read off a profile. */
  source: z.enum(['api', 'manual']).optional(),
  /**
   * True when the platform itself rounds the number it shows ("78K"). The
   * total is then presented as an approximation rather than implying a
   * precision the source never had.
   */
  approx: z.boolean().default(false),
});

const audience = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/audience' }),
  schema: z.object({
    /**
     * ISO date these numbers were captured. Snapshots are deliberately allowed
     * to be PARTIAL — record whichever platforms you have today and the rest
     * carry their own, older dates. See lib/audience.ts.
     */
    date: z.string(),
    source: z.string().optional(),
    platforms: z.array(platform).default([]),
    /** Use only when per-platform numbers are unknown but a total is published. */
    totalFollowersOverride: z.number().nullable().default(null),
    demographics: z
      .object({
        malePct: z.number().nullable().default(null),
        femalePct: z.number().nullable().default(null),
        coreAge: z.string().nullable().default(null),
      })
      .default({}),
    /** Ordered by share. Cities are what a promoter actually wants to see. */
    countries: z
      .array(
        z.object({
          name: z.string(),
          sharePct: z.number().nullable().default(null),
          cities: z.array(z.string()).default([]),
        })
      )
      .default([]),
    /** Anything measured over a window rather than at a point in time. */
    highlights: z
      .array(z.object({ figure: z.string(), label: z.string() }))
      .default([]),
  }),
});

export const collections = { videos, press, testimonials, events, audience };
