import { subjectFor, EVENT_TYPE_LABELS, type LeadPayload } from './form';

/**
 * Lead delivery, shared by every channel that takes a booking request: the
 * site form (/api/lead) and the AI-assistant endpoint (/mcp). Spam checks and
 * validation stay with each channel; everything after "this is a real lead"
 * lives here, so a lead reaches management the same way whichever door it
 * came through.
 */

const env = (key: string) => import.meta.env[key] ?? process.env[key] ?? '';

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/* ---------------------------------------------------------------------------
   Rendering
   --------------------------------------------------------------------------- */

const ROWS: [keyof LeadPayload, string][] = [
  ['name', 'Name'],
  ['email', 'Email'],
  ['eventType', 'Event type'],
  ['eventDate', 'Event date'],
  ['city', 'City and country'],
  ['guests', 'Guest count'],
  ['budget', 'Budget'],
  ['heard', 'How they heard'],
  ['message', 'About the event'],
  ['otherCities', 'Other cities on the trip'],
  ['basedIn', 'Event location / buyer based in'],
  ['marketName', 'Market'],
  ['locale', 'Page language'],
  ['pagePath', 'Submitted from'],
  ['utmSource', 'UTM source'],
  ['utmMedium', 'UTM medium'],
  ['utmCampaign', 'UTM campaign'],
  ['referrer', 'Referrer'],
  ['ftSource', 'First touch: source'],
  ['ftMedium', 'First touch: medium'],
  ['ftCampaign', 'First touch: campaign'],
  ['ftLanding', 'First touch: landing page'],
];

function internalEmail(lead: LeadPayload): string {
  const rows = ROWS.filter(([k]) => String(lead[k] ?? '').trim())
    .map(([k, label]) => {
      const raw = String(lead[k]);
      const value = k === 'eventType' ? (EVENT_TYPE_LABELS[raw] ?? raw) : raw;
      return `<tr>
        <td style="padding:6px 16px 6px 0;color:#9a9ca6;font:14px system-ui;vertical-align:top;white-space:nowrap">${esc(label)}</td>
        <td style="padding:6px 0;color:#111;font:14px system-ui">${esc(value).replace(/\n/g, '<br>')}</td>
      </tr>`;
    })
    .join('');

  return `<div style="font:14px system-ui;color:#111">
    <p style="margin:0 0 18px"><strong>New booking request from deejaytjr.com</strong></p>
    <table style="border-collapse:collapse">${rows}</table>
    <p style="margin:22px 0 0;color:#9a9ca6;font-size:12px">Reply directly to this message to answer ${esc(lead.email)}.</p>
  </div>`;
}

function autoReply(lead: LeadPayload, replyTo: string): string {
  const first = esc(lead.name.trim().split(/\s+/)[0] ?? 'there');
  return `<div style="font:15px/1.6 system-ui;color:#111;max-width:520px">
    <p>Hi ${first},</p>
    <p>Thanks for getting in touch about booking DEEJAY T-JR. Your request has landed with us and you will have a reply within one business day, including availability for your date and a quote.</p>
    <p>In the meantime, her one-sheet, hi-res photos, bios, stage plot and technical rider are all here, with nothing to fill in:</p>
    <p><a href="https://www.deejaytjr.com/press" style="color:#9a7d22">www.deejaytjr.com/press</a></p>
    <p>If anything about the event changes before you hear back, just reply to this message.</p>
    <p style="margin-top:26px;color:#666">The DEEJAY T-JR. team<br>${esc(replyTo)}</p>
  </div>`;
}

/* ---------------------------------------------------------------------------
   Side effects. Each is independent: one failing must not lose the lead.
   --------------------------------------------------------------------------- */

async function sendEmail(opts: { to: string; subject: string; html: string; replyTo?: string }) {
  const key = env('RESEND_API_KEY');
  const from = env('LEAD_FROM_EMAIL') || 'bookings@deejaytjr.com';
  if (!key) return { skipped: true as const };

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `DEEJAY T-JR. <${from}>`,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
      ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return { skipped: false as const };
}

/**
 * Formspree.
 *
 * Delivery only — it is not a second copy of the form. The submission has
 * already been validated, had the honeypot checked and been assembled here, so
 * this posts the finished lead rather than letting the browser talk to
 * Formspree directly. That keeps one entry point for every channel and means
 * the endpoint URL is never exposed to bots scraping the page for something to
 * hammer.
 *
 * `_replyto` and `_subject` are Formspree's own field names: they make Reply
 * in her mail client go to the enquirer instead of to Formspree.
 */
async function sendToFormspree(lead: LeadPayload, subject: string) {
  const url = env('FORMSPREE_ENDPOINT');
  if (!url) return { skipped: true as const };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      _replyto: lead.email,
      _subject: subject,
      Name: lead.name,
      Email: lead.email,
      'Event type': EVENT_TYPE_LABELS[lead.eventType] ?? lead.eventType,
      'Event date': lead.eventDate || '—',
      'City and country': lead.city || '—',
      'Guest count': lead.guests || '—',
      Budget: lead.budget || '—',
      'How they heard': lead.heard || '—',
      'About the event': lead.message || '—',
      'Submitted from': lead.pagePath || '—',
      Market: lead.marketName || lead.market || '—',
      Language: lead.locale || 'en',
      'Other cities on the trip': lead.otherCities || '—',
      'Event location / buyer based in': lead.basedIn || '—',
      'First touch': [lead.ftSource, lead.ftMedium, lead.ftCampaign].filter(Boolean).join(' / ') || '—',
      Campaign: [lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(' / ') || '—',
    }),
  });
  if (!res.ok) throw new Error(`Formspree ${res.status}: ${await res.text()}`);
  return { skipped: false as const };
}

/**
 * Cloudflare Turnstile. Free, no puzzles for ordinary visitors, and it does
 * the one thing a honeypot cannot: tell a headless browser from a person.
 * Inactive until TURNSTILE_SECRET_KEY is set, so the site works with or
 * without it; once set, a missing or failed token is rejected.
 */
export async function verifyTurnstile(token: string | undefined, ip: string | null) {
  const secret = env('TURNSTILE_SECRET_KEY');
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip: ip?.split(',')[0]?.trim() }),
    });
    const data = (await res.json()) as { success?: boolean };
    return !!data.success;
  } catch (err) {
    console.error('[lead] Turnstile verify failed:', err);
    return false;
  }
}

async function logToAirtable(lead: LeadPayload) {
  const key = env('AIRTABLE_API_KEY');
  const base = env('AIRTABLE_BASE_ID');
  const table = env('AIRTABLE_TABLE_NAME') || 'Leads';
  if (!key || !base) return { skipped: true as const };

  const res = await fetch(`https://api.airtable.com/v0/${base}/${encodeURIComponent(table)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        Name: lead.name,
        Email: lead.email,
        'Event type': EVENT_TYPE_LABELS[lead.eventType] ?? lead.eventType,
        'Event date': lead.eventDate || '',
        City: lead.city || '',
        Guests: lead.guests || '',
        Budget: lead.budget || '',
        'Heard via': lead.heard || '',
        Message: lead.message || '',
        Page: lead.pagePath || '',
        'UTM source': lead.utmSource || '',
        'UTM medium': lead.utmMedium || '',
        'UTM campaign': lead.utmCampaign || '',
        Referrer: lead.referrer || '',
        Market: lead.market || '',
        Locale: lead.locale || 'en',
        'Other cities': lead.otherCities || '',
        'Based in': lead.basedIn || '',
        'First touch source': lead.ftSource || '',
        'First touch campaign': lead.ftCampaign || '',
        'First touch landing': lead.ftLanding || '',
        Received: new Date().toISOString(),
      },
      typecast: true,
    }),
  });
  if (!res.ok) throw new Error(`Airtable ${res.status}: ${await res.text()}`);
  return { skipped: false as const };
}

/* ------------------------------------------------------------------------- */

export type DeliveryResult =
  | { status: 'sent'; failed: string[] }
  | { status: 'dev' }
  | { status: 'failed'; failed: string[] };

/** Notify management, send the acknowledgement and log the lead. */
export async function deliverLead(lead: LeadPayload, opts: { subject?: string } = {}): Promise<DeliveryResult> {
  const to = env('LEAD_TO_EMAIL') || 'mgmt@deejaytjr.com';
  const subject = opts.subject ?? subjectFor(lead);

  /* allSettled, not all: a failed auto-reply or a full Airtable base must not
     cost us the notification to management. */
  const results = await Promise.allSettled([
    sendEmail({ to, subject, html: internalEmail(lead), replyTo: lead.email }),
    sendToFormspree(lead, subject),
    logToAirtable(lead),
    /**
     * The acknowledgement invites the enquirer to reply if anything changes,
     * so it must reply somewhere a person reads. It is sent FROM the sending
     * address, which is a verified sending identity rather than a mailbox —
     * without this, hitting Reply would bounce or vanish, on the one message
     * where we explicitly asked them to do it.
     */
    sendEmail({
      to: lead.email,
      subject: 'We have your booking request — DEEJAY T-JR.',
      html: autoReply(lead, to),
      replyTo: to,
    }),
  ]);

  const labels = ['notification email', 'Formspree', 'lead log', 'auto-reply'];
  const failed: string[] = [];
  let anyConfigured = false;

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      failed.push(labels[i]!);
      console.error(`[lead] ${labels[i]} failed:`, r.reason);
    } else if (!('skipped' in r.value) || !r.value.skipped) {
      anyConfigured = true;
    }
  });

  /* Dev mode: no credentials anywhere. Log the whole lead so the flow is
     testable end to end before Resend and Airtable are wired up. */
  if (!anyConfigured && failed.length === 0) {
    console.info('[lead] No integrations configured. Lead received:\n', JSON.stringify(lead, null, 2));
    return { status: 'dev' };
  }
  return failed.length === results.length ? { status: 'failed', failed } : { status: 'sent', failed };
}
