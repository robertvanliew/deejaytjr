import { EVENT_TYPE_LABELS, type LeadPayload } from './form';

/**
 * The two emails a lead triggers: the notification to management and the
 * acknowledgement to the enquirer.
 *
 * Email clients are not browsers. Everything here is table layout with inline
 * styles, a 600px column, web-safe font stacks (Bodoni and Geist will not load
 * in Gmail or Outlook) and images by absolute URL. The palette is the site's:
 * warm near-black, sand #d5c9b1, bone text.
 */

const SITE_URL = 'https://www.deejaytjr.com';
const SEAL = `${SITE_URL}/logo/seal.png`;

const C = {
  ink: '#0e0d0c',
  panel: '#1a1714',
  tan: '#d5c9b1',
  tanDeep: '#b9a98a',
  paper: '#f6f2ea',
  card: '#ffffff',
  text: '#17140f',
  soft: '#4a4238',
  muted: '#7a7265',
  rule: '#e4dbc7',
};

const SERIF = "Didot,'Bodoni 72','Bodoni MT',Georgia,'Times New Roman',serif";
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const val = (s: string | undefined) => String(s ?? '').trim();
const firstName = (name: string) => name.trim().split(/\s+/)[0] || 'there';
const eventLabel = (lead: LeadPayload) => EVENT_TYPE_LABELS[lead.eventType] ?? lead.eventType;

/** Shared frame: dark header with the seal, a paper body, a dark footer. */
function frame(opts: { preheader: string; eyebrow: string; body: string; footer: string }): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><title>DEEJAY T-JR.</title></head>
<body style="margin:0;padding:0;background:${C.paper}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper}">
<tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${C.card};border:1px solid ${C.rule}">
  <tr><td style="background:${C.ink};padding:28px 32px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="56" valign="middle"><img src="${SEAL}" width="48" height="48" alt="T-JR." style="display:block;border:0"></td>
      <td valign="middle" style="padding-left:14px">
        <div style="font:400 22px/1.1 ${SERIF};color:#f2ede2;letter-spacing:1px">DEEJAY T-JR.</div>
        <div style="font:600 10px/1.6 ${SANS};color:${C.tan};letter-spacing:2.5px;text-transform:uppercase;padding-top:4px">${esc(opts.eyebrow)}</div>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="height:3px;background:${C.tan};line-height:3px;font-size:0">&nbsp;</td></tr>
  ${opts.body}
  <tr><td style="background:${C.panel};padding:20px 32px;font:12px/1.6 ${SANS};color:#948b7d">${opts.footer}</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td style="background:${C.ink};border-radius:2px">
      <a href="${href}" style="display:inline-block;padding:13px 24px;font:600 13px/1 ${SANS};color:${C.tan};text-decoration:none;letter-spacing:1.5px;text-transform:uppercase">${esc(label)}</a>
    </td></tr></table>`;
}

/** A label/value grid row. Empty values are dropped by the caller. */
function factRow(label: string, value: string): string {
  return `<tr>
    <td valign="top" style="padding:10px 16px 10px 0;border-bottom:1px solid ${C.rule};font:600 11px/1.5 ${SANS};color:${C.muted};letter-spacing:1.5px;text-transform:uppercase;white-space:nowrap;width:130px">${esc(label)}</td>
    <td valign="top" style="padding:10px 0;border-bottom:1px solid ${C.rule};font:15px/1.5 ${SANS};color:${C.text}">${esc(value).replace(/\n/g, '<br>')}</td>
  </tr>`;
}

const rows = (pairs: [string, string | undefined][]) =>
  pairs.filter(([, v]) => val(v)).map(([l, v]) => factRow(l, val(v))).join('');

/* ---------------------------------------------------------------------------
   To management
   --------------------------------------------------------------------------- */

export function internalEmail(lead: LeadPayload): string {
  const fromAssistant = lead.heard === 'AI assistant (MCP)';
  const source = fromAssistant ? 'Via an AI assistant' : 'Via the website';
  const headline = [eventLabel(lead), val(lead.city) || val(lead.marketName)].filter(Boolean).join(' · ');

  const event = rows([
    ['Event', eventLabel(lead)],
    ['Date', lead.eventDate],
    ['Location', lead.city],
    ['Guests', lead.guests],
    ['Budget', lead.budget],
    ['Other cities', lead.otherCities],
    ['Based in', lead.basedIn],
  ]);

  const contact = rows([
    ['Name', lead.name],
    ['Email', lead.email],
    ['Heard via', lead.heard],
  ]);

  const tracking = [
    ['Page', lead.pagePath],
    ['Market', lead.marketName || lead.market],
    ['Language', lead.locale],
    ['Campaign', [lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(' / ')],
    ['First touch', [lead.ftSource, lead.ftMedium, lead.ftCampaign].filter(Boolean).join(' / ')],
    ['Landing', lead.ftLanding],
    ['Referrer', lead.referrer],
  ]
    .filter(([, v]) => val(v))
    .map(([l, v]) => `${esc(l!)}: ${esc(val(v))}`)
    .join('<br>');

  const subject = encodeURIComponent(`Re: ${eventLabel(lead)}${val(lead.eventDate) ? ` on ${val(lead.eventDate)}` : ''} with DEEJAY T-JR.`);

  const body = `
  <tr><td style="padding:32px 32px 8px">
    <div style="font:600 11px/1.5 ${SANS};color:${C.muted};letter-spacing:2px;text-transform:uppercase">New booking request · ${esc(source)}</div>
    <div style="font:400 30px/1.2 ${SERIF};color:${C.text};padding-top:8px">${esc(headline || 'Booking request')}</div>
    <div style="font:15px/1.6 ${SANS};color:${C.soft};padding-top:6px">From ${esc(lead.name)}${val(lead.eventDate) ? `, for ${esc(val(lead.eventDate))}` : ''}.</div>
  </td></tr>
  <tr><td style="padding:16px 32px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${event}</table></td></tr>
  ${val(lead.message) ? `<tr><td style="padding:24px 32px 0">
    <div style="font:600 11px/1.5 ${SANS};color:${C.muted};letter-spacing:1.5px;text-transform:uppercase;padding-bottom:8px">About the event</div>
    <div style="border-left:3px solid ${C.tan};background:${C.paper};padding:14px 18px;font:15px/1.65 ${SANS};color:${C.text}">${esc(val(lead.message)).replace(/\n/g, '<br>')}</div>
  </td></tr>` : ''}
  <tr><td style="padding:24px 32px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${contact}</table></td></tr>
  <tr><td style="padding:28px 32px 32px">${button(`mailto:${encodeURIComponent(lead.email)}?subject=${subject}`, `Reply to ${firstName(lead.name)}`)}
    <div style="font:13px/1.6 ${SANS};color:${C.muted};padding-top:12px">Or just hit Reply: it goes to ${esc(lead.email)}. They have already been sent a confirmation.</div>
  </td></tr>
  ${tracking ? `<tr><td style="padding:0 32px 28px;font:12px/1.7 ${SANS};color:${C.muted}"><div style="border-top:1px solid ${C.rule};padding-top:16px">${tracking}</div></td></tr>` : ''}`;

  return frame({
    preheader: `${eventLabel(lead)} from ${lead.name}${val(lead.eventDate) ? `, ${val(lead.eventDate)}` : ''}`,
    eyebrow: 'Booking request',
    body,
    footer: `Received ${new Date().toLocaleString('en-CA', { timeZone: 'America/Toronto', dateStyle: 'medium', timeStyle: 'short' })} Toronto time.`,
  });
}

/* ---------------------------------------------------------------------------
   To the enquirer
   --------------------------------------------------------------------------- */

export function autoReply(lead: LeadPayload, replyTo: string): string {
  const recap = rows([
    ['Event', eventLabel(lead)],
    ['Date', lead.eventDate],
    ['Location', lead.city],
    ['Guests', lead.guests],
  ]);

  const body = `
  <tr><td style="padding:36px 32px 8px">
    <div style="font:400 30px/1.2 ${SERIF};color:${C.text}">Thank you, ${esc(firstName(lead.name))}.</div>
    <div style="font:16px/1.7 ${SANS};color:${C.soft};padding-top:14px">Your booking request for DEEJAY T-JR. has reached her management. You will hear back within one business day with her availability for your date and a quote.</div>
  </td></tr>
  ${recap ? `<tr><td style="padding:20px 32px 0">
    <div style="font:600 11px/1.5 ${SANS};color:${C.muted};letter-spacing:1.5px;text-transform:uppercase;padding-bottom:4px">What you sent us</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${recap}</table>
  </td></tr>` : ''}
  <tr><td style="padding:28px 32px 0">
    <div style="font:600 11px/1.5 ${SANS};color:${C.muted};letter-spacing:1.5px;text-transform:uppercase;padding-bottom:8px">While you wait</div>
    <div style="font:15px/1.7 ${SANS};color:${C.soft}">Her one-sheet, hi-res photos, bios, stage plot and technical rider are in the press kit, ready to download.</div>
  </td></tr>
  <tr><td style="padding:20px 32px 0">${button(`${SITE_URL}/press`, 'Open the press kit')}</td></tr>
  <tr><td style="padding:28px 32px 36px">
    <div style="font:15px/1.7 ${SANS};color:${C.soft}">If anything about the event changes before then, reply to this email and it will come straight to us.</div>
    <div style="font:400 18px/1.4 ${SERIF};color:${C.text};padding-top:22px">DEEJAY T-JR. Management</div>
    <div style="font:14px/1.6 ${SANS};color:${C.muted}"><a href="mailto:${esc(replyTo)}" style="color:${C.soft}">${esc(replyTo)}</a> · <a href="${SITE_URL}" style="color:${C.soft}">deejaytjr.com</a></div>
  </td></tr>`;

  return frame({
    preheader: 'We have your request. You will hear back within one business day.',
    eyebrow: '3× DMC Canadian DJ Champion',
    body,
    footer: `You are receiving this because a booking request was sent from deejaytjr.com with this address. If that was not you, you can ignore it.`,
  });
}

/** Plain-text alternative for the acknowledgement. Helps deliverability. */
export function autoReplyText(lead: LeadPayload, replyTo: string): string {
  return `Thank you, ${firstName(lead.name)}.

Your booking request for DEEJAY T-JR. has reached her management. You will hear back within one business day with her availability for your date and a quote.

Her one-sheet, hi-res photos, bios, stage plot and technical rider are in the press kit: ${SITE_URL}/press

If anything about the event changes before then, reply to this email and it will come straight to us.

DEEJAY T-JR. Management
${replyTo} · deejaytjr.com
`;
}
