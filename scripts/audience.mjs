#!/usr/bin/env node
/**
 * Write a dated audience snapshot.
 *
 *   npm run audience -- --tiktok 18400 --instagram 6200
 *   npm run audience -- --youtube-auto
 *   npm run audience -- --approx --instagram 78121 --exact instagram
 *   npm run audience -- --youtube-auto --tiktok 18400 --male 92 --age "35 to 54"
 *
 * WHAT CAN AND CANNOT BE AUTOMATED, honestly:
 *
 *   YouTube    Yes. The Data API returns public channel statistics with a
 *              plain API key — no OAuth, no login, nothing to re-authorise.
 *              Set YOUTUBE_API_KEY and pass --youtube-auto.
 *
 *   Instagram  No. Requires a Business/Creator account, OAuth, and a
 *              long-lived token that expires roughly every 60 days. There is
 *              no key-only endpoint for follower counts.
 *
 *   TikTok     No. The Display API is OAuth-only, same expiry problem.
 *
 * The media kit tracks Instagram, TikTok and YouTube only. Facebook, X,
 * SoundCloud and Bandcamp were dropped: they are not where her audience is.
 *
 * Scraping the public profile pages is not a workaround: they render their
 * numbers with JavaScript, so an HTML fetch returns nothing, and anything that
 * did work would break silently the next time a layout changed. Publishing a
 * silently-stale follower count is worse than publishing none.
 *
 * So the practical division is: YouTube refreshes itself, and the other six
 * are read off her public profiles — which needs no login, just a browser —
 * and passed to this script. Snapshots may be partial; each platform keeps its
 * own capture date.
 */

import { writeFileSync, readFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'src', 'content', 'audience');

/* Accepted on the command line. The media kit displays only the three she
   actually runs — see PLATFORM_ORDER in src/lib/audience.ts. */
const PLATFORMS = ['instagram', 'tiktok', 'youtube', 'twitch', 'facebook', 'x', 'soundcloud', 'bandcamp'];
const UNITS = { youtube: 'subscribers' };

/* --------------------------------------------------------------------------
   Arguments
   -------------------------------------------------------------------------- */

const argv = process.argv.slice(2);
const args = {};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (!a.startsWith('--')) continue;
  const key = a.slice(2);
  const next = argv[i + 1];
  if (next === undefined || next.startsWith('--')) args[key] = true;
  else {
    args[key] = next;
    i++;
  }
}

if (args.help) {
  console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0].replace('#!/usr/bin/env node\n/**', ''));
  process.exit(0);
}

const fail = (msg) => {
  console.error(`\n  ✗ ${msg}\n`);
  process.exit(1);
};

const toCount = (raw, name) => {
  const n = Number(String(raw).replace(/[, _]/g, ''));
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
    fail(`--${name} must be a whole number. Got: ${raw}`);
  }
  return n;
};

/* --------------------------------------------------------------------------
   YouTube, the one platform that can genuinely refresh itself
   -------------------------------------------------------------------------- */

async function fetchYouTube() {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    fail(
      '--youtube-auto needs YOUTUBE_API_KEY.\n' +
        '    Create one at console.cloud.google.com (enable "YouTube Data API v3").\n' +
        '    It is a plain API key: no OAuth, no login, nothing that expires.'
    );
  }
  const handle = process.env.YOUTUBE_HANDLE || 'deejaytjr';
  const url =
    `https://www.googleapis.com/youtube/v3/channels?part=statistics` +
    `&forHandle=${encodeURIComponent(handle)}&key=${key}`;

  const res = await fetch(url);
  if (!res.ok) fail(`YouTube API returned ${res.status}: ${(await res.text()).slice(0, 300)}`);

  const body = await res.json();
  const stats = body?.items?.[0]?.statistics;
  if (!stats) fail(`YouTube API returned no channel for handle "@${handle}". Set YOUTUBE_HANDLE.`);
  if (stats.hiddenSubscriberCount) {
    fail('That channel hides its subscriber count, so the API will not report it.');
  }

  const subs = Number(stats.subscriberCount);
  if (!Number.isFinite(subs)) fail('YouTube API returned an unreadable subscriberCount.');
  console.log(`  · YouTube: ${subs.toLocaleString('en-CA')} subscribers (from the API)`);
  return subs;
}

/* --------------------------------------------------------------------------
   Build and write
   -------------------------------------------------------------------------- */

const date = typeof args.date === 'string' ? args.date : new Date().toISOString().slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(`--date must be YYYY-MM-DD. Got: ${date}`);

/* --exact instagram,tiktok — platforms whose figure is a precise count rather
   than the rounded one the profile shows by default. */
const exact = new Set(
  typeof args.exact === 'string' ? args.exact.split(',').map((k) => k.trim()) : []
);
for (const k of exact) {
  if (!PLATFORMS.includes(k)) fail(`--exact names an unknown platform: ${k}`);
}

const platforms = [];
for (const key of PLATFORMS) {
  if (key === 'youtube' && args['youtube-auto']) {
    platforms.push({ key, followers: await fetchYouTube(), unit: UNITS[key] ?? 'followers', source: 'api' });
    continue;
  }
  if (args[key] !== undefined && args[key] !== true) {
    platforms.push({
      key,
      followers: toCount(args[key], key),
      unit: UNITS[key] ?? 'followers',
      source: 'manual',
      /* Profiles usually display a rounded count ("78.1K"), so a figure read
         off one is approximate and the published total says so. Some expose an
         exact figure on hover — name those with --exact so they are recorded at
         full precision. */
      approx: args.approx === true && !exact.has(key),
    });
  }
}

if (!platforms.length && !args.male && !args.age) {
  fail(
    'Nothing to record.\n' +
      `    Try:  npm run audience -- --tiktok 18400 --instagram 6200\n` +
      `    Or:   npm run audience -- --youtube-auto\n` +
      `    Platforms: ${PLATFORMS.join(', ')}`
  );
}

let snapshotHighlights = [];

const snapshot = {
  date,
  source: typeof args.source === 'string' ? args.source : 'Read from public profiles',
  platforms,
};

/* --highlight "207,300|Likes across her TikTok videos" — repeatable. */
const rawHighlights = args.highlight ? [args.highlight].flat() : [];
if (rawHighlights.length) {
  snapshotHighlights = rawHighlights
    .filter((h) => typeof h === 'string' && h.includes('|'))
    .map((h) => {
      const [figure, ...rest] = h.split('|');
      return { figure: figure.trim(), label: rest.join('|').trim() };
    });
}

if (args.male || args.age) {
  const malePct = args.male ? toCount(args.male, 'male') : null;
  snapshot.demographics = {
    malePct,
    femalePct: malePct === null ? null : 100 - malePct,
    coreAge: typeof args.age === 'string' ? args.age : null,
  };
}

if (snapshotHighlights.length) snapshot.highlights = snapshotHighlights;

mkdirSync(DIR, { recursive: true });
const file = join(DIR, `${date.slice(0, 7)}.json`);

if (existsSync(file) && !args.force) {
  fail(`${date.slice(0, 7)}.json already exists. Re-run with --force to replace it.`);
}

writeFileSync(file, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');

console.log(`\n  ✓ Wrote src/content/audience/${date.slice(0, 7)}.json`);
console.log(`    ${platforms.length} platform figure(s) recorded, dated ${date}.`);

/* Only the platforms the media kit actually displays. Reporting the dropped
   ones as "missing" tells the operator to go and find numbers nobody wants. */
const TRACKED = ['instagram', 'tiktok', 'youtube', 'twitch'];
const missing = TRACKED.filter((k) => !platforms.some((p) => p.key === k));
if (missing.length) {
  console.log(
    `    Not in this snapshot: ${missing.join(', ')}.\n` +
      `    Those keep whichever figure and date they already had — partial snapshots are fine.`
  );
}

const count = readdirSync(DIR).filter((f) => f.endsWith('.json')).length;
if (count < 2) {
  console.log(`\n    This is the only snapshot, so no growth can be shown yet.`);
  console.log(`    Add a second one later and every percentage calculates itself.`);
}
console.log(`\n    Run "npm run build" to publish.\n`);
