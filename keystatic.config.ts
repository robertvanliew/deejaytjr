import { config, fields, collection, singleton } from '@keystatic/core';

/**
 * The admin at /keystatic.
 *
 * Every save writes the JSON file the site already reads, so the editor and
 * the build never disagree about where content lives. Fields mirror
 * src/content.config.ts; the build re-validates everything, so a typo in the
 * admin fails a deploy loudly rather than shipping a broken page.
 *
 * STORAGE. In development it edits the files on disk. In production it saves
 * by committing to the GitHub repo, and Vercel redeploys within about a
 * minute. Production needs a one-time GitHub App set-up — see
 * ASSETS-NEEDED.md §16 for the steps.
 */
const useGitHub =
  import.meta.env.PROD || import.meta.env.PUBLIC_KEYSTATIC_STORAGE === 'github';

/* PUBLIC_KEYSTATIC_STORAGE=github in .env.local switches local development to
   GitHub mode too — needed once, to run Keystatic's "create GitHub App" set-up
   from this machine. Leave it unset otherwise so local edits stay local. */
const storage = useGitHub
  ? ({ kind: 'github', repo: 'robertvanliew/deejaytjr' } as const)
  : ({ kind: 'local' } as const);

const SERVICES = [
  { label: 'Corporate events', value: 'corporate' },
  { label: 'Private events', value: 'private' },
  { label: 'Clubs and festivals', value: 'club' },
  { label: 'Brand partnerships', value: 'brand' },
] as const;

export default config({
  storage,
  ui: {
    brand: { name: 'DEEJAY T-JR. · Site editor' },
    navigation: {
      'Her record': ['awards', 'timeline', 'roles'],
      'Coverage and video': ['press', 'videos'],
      'Bookings': ['events', 'testimonials'],
      'Audience': ['audience'],
    },
  },

  singletons: {
    awards: singleton({
      label: 'Awards and results',
      path: 'src/data/editable/awards',
      format: { data: 'json' },
      schema: {
        items: fields.array(
          fields.object({
            title: fields.text({
              label: 'Result',
              description: 'As it should read on the site, e.g. "2024 DMC Canada DJ Champion".',
              validation: { isRequired: true },
            }),
            year: fields.text({
              label: 'Year',
              description: 'Four digits, e.g. 2026. Used to sort; newest always shows first.',
              validation: { isRequired: true, pattern: { regex: /^\d{4}$/, message: 'Enter a four-digit year, e.g. 2026' } },
            }),
            source: fields.url({
              label: 'Proof link (optional)',
              description: 'A page that confirms the result, ideally the organiser’s own. Leave empty if there is none.',
            }),
            sourceLabel: fields.text({ label: 'Proof link text', description: 'e.g. "DMC World". Only shown when there is a link.' }),
          }),
          { label: 'Results', itemLabel: (p) => p.fields.title.value || 'New result' }
        ),
      },
    }),

    timeline: singleton({
      label: 'Timeline',
      path: 'src/data/editable/timeline',
      format: { data: 'json' },
      schema: {
        items: fields.array(
          fields.object({
            year: fields.text({
              label: 'Year',
              description: 'Four digits, e.g. 2026. Used to sort; newest always shows first.',
              validation: { isRequired: true, pattern: { regex: /^\d{4}$/, message: 'Enter a four-digit year, e.g. 2026' } },
            }),
            note: fields.text({ label: 'What happened', validation: { isRequired: true } }),
          }),
          {
            label: 'Years',
            description: 'One line per result. A year can have more than one line — keep different competitions separate.',
            itemLabel: (p) => `${p.fields.year.value} · ${p.fields.note.value}`,
          }
        ),
      },
    }),

    roles: singleton({
      label: 'Positions held',
      path: 'src/data/editable/roles',
      format: { data: 'json' },
      schema: {
        items: fields.array(
          fields.object({
            title: fields.text({ label: 'Position', validation: { isRequired: true } }),
            detail: fields.text({ label: 'Detail', multiline: true }),
            source: fields.url({ label: 'Proof link (optional)' }),
            sourceLabel: fields.text({ label: 'Proof link text' }),
          }),
          { label: 'Positions', itemLabel: (p) => p.fields.title.value || 'New position' }
        ),
      },
    }),
  },

  collections: {
    press: collection({
      label: 'Press',
      path: 'src/content/press/*',
      format: { data: 'json' },
      slugField: 'title',
      columns: ['outlet', 'date'],
      schema: {
        title: fields.slug({ name: { label: 'Headline' } }),
        outlet: fields.text({ label: 'Outlet', validation: { isRequired: true } }),
        date: fields.text({ label: 'Year shown', description: 'e.g. "2026"' }),
        published: fields.text({ label: 'Exact date', description: 'YYYY-MM-DD. Shown in the article popup.' }),
        byline: fields.text({ label: 'Writer' }),
        url: fields.url({ label: 'Link to the article' }),
        excerpt: fields.text({ label: 'Our one-line summary', multiline: true, validation: { isRequired: true } }),
        photo: fields.text({
          label: 'Her photo to show with it (optional)',
          description: 'A photo key from the site, e.g. "bastids-bbq" or "hero-decks".',
        }),
        order: fields.integer({ label: 'Order', description: 'Lower shows first.', defaultValue: 50 }),
      },
    }),

    videos: collection({
      label: 'Videos',
      path: 'src/content/videos/*',
      format: { data: 'json' },
      slugField: 'title',
      columns: ['category', 'order'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        category: fields.select({
          label: 'Tab on /watch',
          options: [
            { label: 'Events', value: 'event' },
            { label: 'Battles', value: 'battle' },
            { label: 'Interviews', value: 'interview' },
          ],
          defaultValue: 'event',
        }),
        youtubeId: fields.text({ label: 'YouTube ID', description: 'The part after watch?v= in the link, e.g. "gyc6bCMAWmk".' }),
        start: fields.integer({ label: 'Start at (seconds)', description: 'For long streams: where her part begins.' }),
        description: fields.text({ label: 'Description', multiline: true, validation: { isRequired: true } }),
        venue: fields.text({ label: 'Venue or channel' }),
        date: fields.text({ label: 'Year' }),
        credit: fields.text({ label: 'Video by', description: 'When someone else published it.' }),
        creditUrl: fields.url({ label: 'Their channel link' }),
        services: fields.multiselect({ label: 'Also show on', options: SERVICES }),
        order: fields.integer({ label: 'Order', description: '1 is the big tile.', defaultValue: 50 }),
        featured: fields.checkbox({ label: 'Featured' }),
        duration: fields.text({ label: 'Length (ISO, optional)', description: 'e.g. "PT4M12S". Helps search engines.' }),
        uploadDate: fields.text({
          label: 'Upload date',
          description: 'When it went up on YouTube. Best: the full timestamp, e.g. 2025-01-06T16:16:27-08:00. A plain date (2025-01-06) also works.',
          validation: {
            pattern: {
              regex: /^(\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:\d{2}|Z))?)?$/,
              message: 'Use 2025-01-06 or 2025-01-06T16:16:27-08:00',
            },
          },
        }),
      },
    }),

    events: collection({
      label: 'Past events',
      path: 'src/content/events/*',
      format: { data: 'json' },
      slugField: 'name',
      columns: ['client', 'year'],
      schema: {
        name: fields.slug({ name: { label: 'Event name (shown when the client cannot be named)' } }),
        client: fields.text({ label: 'Client', validation: { isRequired: true } }),
        permissionOnFile: fields.checkbox({
          label: 'We have written permission to name this client',
          description: 'Unticked, the site shows the event name instead of the client.',
        }),
        type: fields.select({
          label: 'Service page',
          options: SERVICES,
          defaultValue: 'corporate',
        }),
        city: fields.text({ label: 'City', validation: { isRequired: true } }),
        year: fields.text({ label: 'Year', validation: { isRequired: true } }),
        venue: fields.text({ label: 'Venue' }),
        note: fields.text({ label: 'Note', multiline: true }),
      },
    }),

    testimonials: collection({
      label: 'Testimonials',
      path: 'src/content/testimonials/*',
      format: { data: 'json' },
      slugField: 'name',
      columns: ['company'],
      schema: {
        name: fields.slug({ name: { label: 'Their name' } }),
        role: fields.text({ label: 'Their title', validation: { isRequired: true } }),
        company: fields.text({ label: 'Company', validation: { isRequired: true } }),
        quote: fields.text({ label: 'Quote', multiline: true, validation: { isRequired: true } }),
        permissionOnFile: fields.checkbox({
          label: 'Written permission to publish is on file',
          description: 'Nothing shows on the site until this is ticked.',
        }),
        services: fields.multiselect({ label: 'Show on', options: SERVICES }),
      },
    }),

    audience: collection({
      label: 'Audience snapshots',
      path: 'src/content/audience/*',
      format: { data: 'json' },
      slugField: 'date',
      columns: ['source'],
      schema: {
        date: fields.slug({
          name: { label: 'Date captured', description: 'YYYY-MM-DD. Add a new snapshot rather than overwriting an old one — growth is calculated between them.' },
        }),
        source: fields.text({ label: 'Where the numbers came from' }),
        platforms: fields.array(
          fields.object({
            key: fields.select({
              label: 'Platform',
              options: [
                { label: 'Instagram', value: 'instagram' },
                { label: 'TikTok', value: 'tiktok' },
                { label: 'YouTube', value: 'youtube' },
                { label: 'Twitch', value: 'twitch' },
                { label: 'Facebook', value: 'facebook' },
                { label: 'X', value: 'x' },
                { label: 'SoundCloud', value: 'soundcloud' },
                { label: 'Bandcamp', value: 'bandcamp' },
              ],
              defaultValue: 'instagram',
            }),
            followers: fields.integer({ label: 'Followers', description: 'Leave empty if unknown. Never estimate.' }),
            unit: fields.text({ label: 'Unit', defaultValue: 'followers' }),
            source: fields.select({
              label: 'How it was read',
              options: [
                { label: 'Read off the profile', value: 'manual' },
                { label: 'From the API', value: 'api' },
              ],
              defaultValue: 'manual',
            }),
            approx: fields.checkbox({ label: 'The platform rounds this number (e.g. "78K")' }),
          }),
          { label: 'Platforms', itemLabel: (p) => `${p.fields.key.value}: ${p.fields.followers.value ?? '—'}` }
        ),
        totalFollowersOverride: fields.integer({ label: 'Total followers override (only if per-platform numbers are unknown)' }),
        demographics: fields.object({
          malePct: fields.integer({ label: 'Male %' }),
          femalePct: fields.integer({ label: 'Female %' }),
          coreAge: fields.text({ label: 'Core age range', description: 'e.g. "25 to 34"' }),
        }),
        countries: fields.array(
          fields.object({
            name: fields.text({ label: 'Country' }),
            sharePct: fields.number({ label: 'Share of audience %' }),
            cities: fields.array(fields.text({ label: 'City' }), { label: 'Top cities', itemLabel: (p) => p.value }),
          }),
          { label: 'Countries (largest first)', itemLabel: (p) => p.fields.name.value }
        ),
        highlights: fields.array(
          fields.object({ figure: fields.text({ label: 'Figure' }), label: fields.text({ label: 'What it measures' }) }),
          { label: 'Highlights', itemLabel: (p) => `${p.fields.figure.value} ${p.fields.label.value}` }
        ),
      },
    }),
  },
});
