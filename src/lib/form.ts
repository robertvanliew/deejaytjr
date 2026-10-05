/**
 * Shared between the browser and the serverless endpoint, so a lead can never
 * pass client validation and then be silently rejected by the server with a
 * different rule.
 */

export const SITE_EMAIL = 'mgmt@deejaytjr.com';

export const VALID_EVENT_TYPES = ['corporate', 'private', 'club', 'brand', 'other'] as const;

export const EVENT_TYPE_LABELS: Record<string, string> = {
  corporate: 'Corporate event',
  private: 'Private event',
  club: 'Club or festival',
  brand: 'Brand partnership or showcase',
  other: 'Other',
};

export interface LeadPayload {
  name: string;
  email: string;
  eventType: string;
  eventDate?: string;
  city?: string;
  guests?: string;
  budget?: string;
  heard?: string;
  message?: string;
  company_website?: string;
  pagePath?: string;
  pageTitle?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  /** Milliseconds between the form being shown and submitted. See lead.ts. */
  elapsedMs?: number;
  /** Cloudflare Turnstile token, when the site key is configured. */
  turnstileToken?: string;
}

/**
 * Error messages are specific, never generic. Section 7 of the brief.
 * Returns a map of field name to message; empty means valid.
 */
export function validate(data: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};

  const name = (data.name ?? '').trim();
  if (!name) errors.name = 'Enter your name so we know who is asking.';
  else if (name.length > 120) errors.name = 'That name is longer than we can store. Shorten it.';

  const email = (data.email ?? '').trim();
  if (!email) errors.email = 'Enter an email address so we can reply.';
  else if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email))
    errors.email = 'Enter an email address like name@company.com';

  const type = (data.eventType ?? '').trim();
  if (!type) errors.eventType = 'Choose the kind of event so we can route this correctly.';
  else if (!VALID_EVENT_TYPES.includes(type as (typeof VALID_EVENT_TYPES)[number]))
    errors.eventType = 'Choose one of the listed event types.';

  /* Optional, but if given it must be a real future-ish date. */
  const date = (data.eventDate ?? '').trim();
  if (date) {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      errors.eventDate = 'Enter the date as YYYY-MM-DD, or leave it blank.';
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (parsed < yesterday) errors.eventDate = 'That date has passed. Enter an upcoming date.';
    }
  }

  if ((data.message ?? '').length > 5000)
    errors.message = 'That is longer than 5,000 characters. Trim it and send the detail by email.';

  return errors;
}

/** Subject line format is fixed by section 7, step 1. */
export function subjectFor(lead: LeadPayload): string {
  const type = EVENT_TYPE_LABELS[lead.eventType] ?? lead.eventType;
  const where = lead.city?.trim() ? ` in ${lead.city.trim()}` : '';
  const when = lead.eventDate?.trim() ? ` on ${lead.eventDate.trim()}` : '';
  return `Booking request: ${type}${where}${when}`;
}
