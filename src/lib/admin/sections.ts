/**
 * What the admin at /admin can edit, described once. The forms, the list
 * pages and the server-side validation are all generated from this file, so
 * adding a section is a matter of describing its fields here.
 *
 * Mirrors keystatic.config.ts and src/content.config.ts. The build validates
 * every file again, so the admin can never ship content the site rejects.
 *
 * Two shapes:
 *  - "list": one JSON file holding { items: [...] } (awards, timeline, roles)
 *  - "collection": one JSON file per entry in a folder (press, videos, ...)
 */
import { PHOTOS } from '../../data/photos';

export type Field =
  | { key: string; type: 'text' | 'textarea' | 'url'; label: string; help?: string; required?: boolean; pattern?: RegExp; patternMessage?: string }
  | { key: string; type: 'integer'; label: string; help?: string; required?: boolean; default?: number }
  | { key: string; type: 'checkbox'; label: string; help?: string }
  | { key: string; type: 'select'; label: string; help?: string; options: { value: string; label: string }[]; required?: boolean; default?: string }
  | { key: string; type: 'multiselect'; label: string; help?: string; options: { value: string; label: string }[] };

export interface Section {
  key: string;
  label: string;
  /** One line under the heading on the list page. */
  intro: string;
  /** Singular, for buttons: "Add a result". */
  noun: string;
  kind: 'list' | 'collection';
  /** list: the JSON file. collection: the folder. Repo-relative. */
  path: string;
  fields: Field[];
  /** collection: which field names the file on first save. */
  slugFrom?: string;
  /** How an item reads in the list. */
  title: (d: Record<string, unknown>) => string;
  subtitle?: (d: Record<string, unknown>) => string;
  /** Sort for the list page only; the site sorts on its own. */
  sort?: (a: Record<string, unknown>, b: Record<string, unknown>) => number;
}

const YEAR = { pattern: /^\d{4}$/, patternMessage: 'Four digits, e.g. 2026' };
const SERVICES = [
  { value: 'corporate', label: 'Corporate events' },
  { value: 'private', label: 'Private events' },
  { value: 'club', label: 'Clubs and festivals' },
  { value: 'brand', label: 'Brand partnerships' },
];
const PHOTO_OPTIONS = [{ value: '', label: 'No photo' }, ...Object.keys(PHOTOS).map((k) => ({ value: k, label: k }))];
const s = (v: unknown) => (v == null ? '' : String(v));
const byYearDesc = (a: Record<string, unknown>, b: Record<string, unknown>) => s(b.year).localeCompare(s(a.year));
const byOrder = (a: Record<string, unknown>, b: Record<string, unknown>) => Number(a.order ?? 50) - Number(b.order ?? 50);

export const SECTIONS: Section[] = [
  {
    key: 'awards',
    label: 'Awards and results',
    intro: 'Every result on the site. Newest year always shows first.',
    noun: 'result',
    kind: 'list',
    path: 'src/data/editable/awards.json',
    fields: [
      { key: 'title', type: 'text', label: 'Result', help: 'As it should read on the site, e.g. "2024 DMC Canada DJ Champion".', required: true },
      { key: 'year', type: 'text', label: 'Year', required: true, ...YEAR },
      { key: 'source', type: 'url', label: 'Proof link (optional)', help: 'A page that confirms the result, ideally the organiser’s own.' },
      { key: 'sourceLabel', type: 'text', label: 'Proof link text', help: 'e.g. "DMC World". Only shown when there is a link.' },
    ],
    title: (d) => s(d.title),
    subtitle: (d) => s(d.year),
    sort: byYearDesc,
  },
  {
    key: 'timeline',
    label: 'Timeline',
    intro: 'One line per result. Keep different competitions on separate lines.',
    noun: 'line',
    kind: 'list',
    path: 'src/data/editable/timeline.json',
    fields: [
      { key: 'year', type: 'text', label: 'Year', required: true, ...YEAR },
      { key: 'note', type: 'text', label: 'What happened', required: true },
    ],
    title: (d) => s(d.note),
    subtitle: (d) => s(d.year),
    sort: byYearDesc,
  },
  {
    key: 'roles',
    label: 'Positions held',
    intro: 'Roles like DMC Canada branch manager or event host.',
    noun: 'position',
    kind: 'list',
    path: 'src/data/editable/roles.json',
    fields: [
      { key: 'title', type: 'text', label: 'Position', required: true },
      { key: 'detail', type: 'textarea', label: 'Detail' },
      { key: 'source', type: 'url', label: 'Proof link (optional)' },
      { key: 'sourceLabel', type: 'text', label: 'Proof link text' },
    ],
    title: (d) => s(d.title),
  },
  {
    key: 'press',
    label: 'Press',
    intro: 'Articles, interviews and features about her.',
    noun: 'article',
    kind: 'collection',
    path: 'src/content/press',
    slugFrom: 'title',
    fields: [
      { key: 'title', type: 'text', label: 'Headline', required: true },
      { key: 'outlet', type: 'text', label: 'Outlet', required: true },
      { key: 'url', type: 'url', label: 'Link to the article' },
      { key: 'date', type: 'text', label: 'Year shown', help: 'e.g. 2026', ...YEAR },
      { key: 'published', type: 'text', label: 'Exact date', help: 'YYYY-MM-DD, e.g. 2026-09-18.', pattern: /^\d{4}-\d{2}-\d{2}$/, patternMessage: 'Use YYYY-MM-DD, e.g. 2026-09-18' },
      { key: 'byline', type: 'text', label: 'Writer' },
      { key: 'excerpt', type: 'textarea', label: 'Our one-line summary', required: true },
      { key: 'photo', type: 'select', label: 'Her photo to show with it (optional)', options: PHOTO_OPTIONS },
      { key: 'order', type: 'integer', label: 'Order', help: 'Lower shows first.', default: 50 },
    ],
    title: (d) => s(d.title),
    subtitle: (d) => [s(d.outlet), s(d.published || d.date)].filter(Boolean).join(' · '),
    sort: byOrder,
  },
  {
    key: 'videos',
    label: 'Videos',
    intro: 'Everything on /watch, and the videos shown on other pages.',
    noun: 'video',
    kind: 'collection',
    path: 'src/content/videos',
    slugFrom: 'title',
    fields: [
      { key: 'title', type: 'text', label: 'Title', required: true },
      {
        key: 'category', type: 'select', label: 'Tab on /watch', required: true, default: 'event',
        options: [{ value: 'event', label: 'Events' }, { value: 'battle', label: 'Battles' }, { value: 'interview', label: 'Interviews' }],
      },
      { key: 'youtubeId', type: 'text', label: 'YouTube ID', help: 'The part after watch?v= in the link, e.g. gyc6bCMAWmk.', pattern: /^[A-Za-z0-9_-]{11}$/, patternMessage: 'An 11-character YouTube ID' },
      { key: 'start', type: 'integer', label: 'Start at (seconds)', help: 'For long streams: where her part begins.' },
      { key: 'description', type: 'textarea', label: 'Description', required: true },
      { key: 'venue', type: 'text', label: 'Venue or channel' },
      { key: 'date', type: 'text', label: 'Year', ...YEAR },
      { key: 'credit', type: 'text', label: 'Video by', help: 'When someone else published it.' },
      { key: 'creditUrl', type: 'url', label: 'Their channel link' },
      { key: 'services', type: 'multiselect', label: 'Also show on', options: SERVICES },
      { key: 'order', type: 'integer', label: 'Order', help: '1 is the big tile.', default: 50 },
      { key: 'featured', type: 'checkbox', label: 'Featured' },
      { key: 'uploadDate', type: 'text', label: 'Upload date', help: 'From YouTube, e.g. 2025-01-06 or 2025-01-06T16:16:27-08:00.', pattern: /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:\d{2}|Z))?$/, patternMessage: 'Use 2025-01-06 or 2025-01-06T16:16:27-08:00' },
      { key: 'duration', type: 'text', label: 'Length (optional)', help: 'e.g. PT4M12S for 4 minutes 12 seconds.', pattern: /^PT(\d+H)?(\d+M)?(\d+S)?$/, patternMessage: 'e.g. PT4M12S' },
    ],
    title: (d) => s(d.title),
    subtitle: (d) => [s(d.category), s(d.date)].filter(Boolean).join(' · '),
    sort: byOrder,
  },
  {
    key: 'events',
    label: 'Past events',
    intro: 'Rooms she has played. A client is only named once written permission is ticked.',
    noun: 'event',
    kind: 'collection',
    path: 'src/content/events',
    slugFrom: 'client',
    fields: [
      { key: 'name', type: 'text', label: 'Event name', help: 'Shown when the client cannot be named, e.g. "Ballroom event".', required: true },
      { key: 'client', type: 'text', label: 'Client', required: true },
      { key: 'permissionOnFile', type: 'checkbox', label: 'We have written permission to name this client' },
      { key: 'type', type: 'select', label: 'Service page', required: true, default: 'corporate', options: SERVICES },
      { key: 'city', type: 'text', label: 'City', required: true },
      { key: 'year', type: 'text', label: 'Year', required: true, ...YEAR },
      { key: 'venue', type: 'text', label: 'Venue' },
      { key: 'note', type: 'textarea', label: 'Note' },
    ],
    title: (d) => (d.permissionOnFile ? s(d.client) : `${s(d.name)} (${s(d.client)})`),
    subtitle: (d) => [s(d.city), s(d.year)].filter(Boolean).join(' · '),
    sort: byYearDesc,
  },
  {
    key: 'testimonials',
    label: 'Testimonials',
    intro: 'Client quotes. Nothing shows on the site until written permission is ticked.',
    noun: 'testimonial',
    kind: 'collection',
    path: 'src/content/testimonials',
    slugFrom: 'name',
    fields: [
      { key: 'quote', type: 'textarea', label: 'Quote', help: 'Their own words. Do not paraphrase or tidy them up.', required: true },
      { key: 'name', type: 'text', label: 'Their name', required: true },
      { key: 'role', type: 'text', label: 'Their title', required: true },
      { key: 'company', type: 'text', label: 'Company', required: true },
      { key: 'permissionOnFile', type: 'checkbox', label: 'Written permission to publish is on file' },
      { key: 'services', type: 'multiselect', label: 'Show on', options: SERVICES },
    ],
    title: (d) => `${s(d.name)}, ${s(d.company)}`,
    subtitle: (d) => (d.permissionOnFile ? 'Published' : 'Not published: no permission yet'),
  },
];

export const section = (key: string) => SECTIONS.find((x) => x.key === key);

/**
 * Turn a submitted form into the JSON to save, or a list of errors.
 * Empty optional values are dropped rather than saved as "", which keeps the
 * files identical to what the site and Keystatic already write.
 */
export function readForm(sec: Section, form: FormData, previous: Record<string, unknown> = {}) {
  const data: Record<string, unknown> = { ...previous };
  const errors: Record<string, string> = {};
  for (const f of sec.fields) {
    if (f.type === 'checkbox') {
      data[f.key] = form.get(f.key) === 'on';
      continue;
    }
    if (f.type === 'multiselect') {
      const vals = form.getAll(f.key).map(String).filter((v) => f.options.some((o) => o.value === v));
      if (vals.length) data[f.key] = vals;
      else delete data[f.key];
      continue;
    }
    const raw = String(form.get(f.key) ?? '').trim();
    if (!raw) {
      if ('required' in f && f.required) errors[f.key] = 'Required.';
      delete data[f.key];
      continue;
    }
    if (raw.length > 4000) {
      errors[f.key] = 'Too long.';
      continue;
    }
    if (f.type === 'integer') {
      if (!/^-?\d+$/.test(raw)) errors[f.key] = 'A whole number.';
      else data[f.key] = Number(raw);
      continue;
    }
    if (f.type === 'select') {
      if (!f.options.some((o) => o.value === raw)) errors[f.key] = 'Choose one of the options.';
      else data[f.key] = raw;
      continue;
    }
    if (f.type === 'url') {
      try {
        const u = new URL(raw);
        if (!/^https?:$/.test(u.protocol)) throw new Error();
        data[f.key] = raw;
      } catch {
        errors[f.key] = 'A full link starting with https://';
      }
      continue;
    }
    if ('pattern' in f && f.pattern && !f.pattern.test(raw)) {
      errors[f.key] = f.patternMessage ?? 'Not in the expected format.';
      continue;
    }
    data[f.key] = raw;
  }
  return { data, errors };
}

/** File name for a new collection entry: "The Source, Bastid's BBQ" -> "the-source-bastids-bbq". */
export function slugify(v: string) {
  return (
    v
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'entry'
  );
}
