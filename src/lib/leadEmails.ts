import { EVENT_TYPE_LABELS, type LeadPayload } from './form';

/**
 * The two emails a lead triggers: the notification to management and the
 * acknowledgement to the enquirer.
 *
 * Laid out like the DJ DX emails management already works from: the
 * notification is one flat label/value list, contact first, with a Reply
 * button; the acknowledgement is a dark card. Colours are hers, not his:
 * warm near-black and sand #d5c9b1 in place of black and gold.
 *
 * Email clients are not browsers. Table layout, inline styles, a 600px
 * column, web-safe fonts (Bodoni and Geist will not load in Gmail or Outlook)
 * and images by absolute URL.
 */

const SITE_URL = 'https://www.deejaytjr.com';
const SEAL = `${SITE_URL}/logo/seal.png`;

const C = {
  ink: '#0e0d0c',
  tan: '#d5c9b1',
  /** Sand is too light for links on white; this is its darker relative. 4.6:1 on white. */
  link: '#7d6a47',
  text: '#17140f',
  label: '#8f8a82',
  rule: '#eeeae2',
  bone: '#f2ede2',
  body: '#c9c0b1',
  muted: '#948b7d',
};

const SERIF = "Didot,'Bodoni 72','Bodoni MT',Georgia,'Times New Roman',serif";
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const val = (s: string | undefined) => String(s ?? '').trim();
const text = (s: string | undefined) => esc(val(s)).replace(/\n/g, '<br>');
const firstName = (name: string) => name.trim().split(/\s+/)[0] || 'there';
const eventLabel = (lead: LeadPayload) => EVENT_TYPE_LABELS[lead.eventType] ?? lead.eventType;
const received = () =>
  new Date().toLocaleString('en-CA', { timeZone: 'America/Toronto', dateStyle: 'medium', timeStyle: 'short' });

const button = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:${C.tan};color:${C.text};padding:13px 28px;border-radius:6px;text-decoration:none;font:700 13px/1 ${SANS};letter-spacing:1px;text-transform:uppercase">${esc(label)}</a>`;

/* ---------------------------------------------------------------------------
   To management
   --------------------------------------------------------------------------- */

export function internalEmail(lead: LeadPayload): string {
  const fromAssistant = lead.heard === 'AI assistant (MCP)';
  const email = esc(lead.email);
  const campaign = [lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(' / ');
  const firstTouch = [lead.ftSource, lead.ftMedium, lead.ftCampaign].filter(Boolean).join(' / ');
  const link = (href: string, label: string) => `<a href="${href}" style="color:${C.link};text-decoration:none">${label}</a>`;

  const fact = (label: string, html: string) => `<tr>
    <td valign="top" style="padding:11px 12px 11px 0;border-bottom:1px solid ${C.rule};font:700 11px/1.6 ${SANS};color:${C.label};letter-spacing:1px;text-transform:uppercase;white-space:nowrap;width:130px">${label}</td>
    <td valign="top" style="padding:11px 0;border-bottom:1px solid ${C.rule};font:15px/1.6 ${SANS};color:${C.text}">${html}</td>
  </tr>`;

  const list = [
    fact('Name', `<strong>${esc(lead.name)}</strong>`),
    fact('Email', link(`mailto:${email}`, email)),
    fact('Event type', esc(eventLabel(lead))),
    val(lead.eventDate) && fact('Event date', text(lead.eventDate)),
    val(lead.city) && fact('Location', text(lead.city)),
    val(lead.guests) && fact('Guests', text(lead.guests)),
    val(lead.budget) && fact('Budget', text(lead.budget)),
    val(lead.otherCities) && fact('Other cities', text(lead.otherCities)),
    val(lead.basedIn) && fact('Based in', text(lead.basedIn)),
    val(lead.heard) && !fromAssistant && fact('Heard about us', text(lead.heard)),
    fromAssistant && fact('AI referral', 'Sent by an AI assistant through deejaytjr.com/mcp, after the person confirmed it'),
    val(lead.message) && fact('Message', text(lead.message)),
    val(lead.pagePath) && !fromAssistant && fact('Submitted from', link(`${SITE_URL}${esc(val(lead.pagePath))}`, text(lead.pagePath))),
    campaign && fact('Campaign', esc(campaign)),
    firstTouch && fact('First touch', esc(firstTouch) + (val(lead.ftLanding) ? ` → ${text(lead.ftLanding)}` : '')),
  ]
    .filter(Boolean)
    .join('');

  const replySubject = encodeURIComponent(
    `Re: your ${eventLabel(lead).toLowerCase()} inquiry${val(lead.eventDate) ? ` for ${val(lead.eventDate)}` : ''}`
  );

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>New booking inquiry</title></head>
<body style="margin:0;padding:24px 12px;background:#ffffff">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(eventLabel(lead))} from ${esc(lead.name)}${val(lead.eventDate) ? `, ${text(lead.eventDate)}` : ''}</div>
<table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;margin:0 auto;border:1px solid #e5e1d8;border-radius:8px;border-collapse:separate">
  <tr><td style="background:${C.ink};padding:28px 32px;border-bottom:3px solid ${C.tan};border-radius:8px 8px 0 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td valign="middle">
        <div style="font:700 22px/1.25 ${SANS};color:${C.tan};letter-spacing:1px">NEW BOOKING INQUIRY</div>
        <div style="font:13px/1.6 ${SANS};color:${C.muted};padding-top:4px">via <a href="${SITE_URL}" style="color:${C.muted}">deejaytjr.com</a>${fromAssistant ? ' · AI assistant' : ''}</div>
      </td>
      <td width="52" valign="middle" align="right"><img src="${SEAL}" width="44" height="44" alt="" style="display:block;border:0"></td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:20px 32px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${list}</table></td></tr>
  <tr><td style="padding:20px 32px 32px">
    ${button(`mailto:${email}?subject=${replySubject}`, `Reply to ${firstName(lead.name)}`)}
    <div style="font:12px/1.6 ${SANS};color:${C.label};padding-top:14px">They have been sent a confirmation. Received ${received()} Toronto time.</div>
  </td></tr>
</table>
</body></html>`;
}

/* ---------------------------------------------------------------------------
   To the enquirer
   --------------------------------------------------------------------------- */

export function autoReply(lead: LeadPayload, replyTo: string): string {
  const strong = (s: string) => `<strong style="color:${C.bone}">${s}</strong>`;
  const when = val(lead.eventDate);
  const where = val(lead.city);

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DEEJAY T-JR.</title></head>
<body style="margin:0;padding:24px 12px;background:#ffffff">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">We have your inquiry. You will hear back within one business day.</div>
<table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;margin:0 auto;background:${C.ink};border-radius:12px;border-collapse:separate">
  <tr><td style="padding:32px 32px 0"><img src="${SEAL}" width="52" height="52" alt="T-JR." style="display:block;border:0"></td></tr>
  <tr><td style="padding:24px 32px 0">
    <div style="font:400 30px/1.2 ${SERIF};color:${C.bone}">Thanks for reaching out.</div>
    <div style="font:16px/1.7 ${SANS};color:${C.body};padding-top:16px">Hi ${esc(firstName(lead.name))}, your booking inquiry for ${strong(esc(eventLabel(lead).toLowerCase()))}${when ? ` on ${strong(text(when))}` : ''}${where ? ` in ${text(where)}` : ''} has been received.</div>
    <div style="font:16px/1.7 ${SANS};color:${C.body};padding-top:14px">DEEJAY T-JR.'s management will get back to you within <strong style="color:${C.tan}">one business day</strong> with availability and a quote.</div>
  </td></tr>
  <tr><td style="padding:28px 32px 0">
    <div style="border:1px solid #3a342b;border-radius:8px;padding:18px 20px">
      <div style="font:700 11px/1.5 ${SANS};color:${C.tan};letter-spacing:1.5px;text-transform:uppercase">While you wait</div>
      <div style="font:15px/1.7 ${SANS};color:${C.body};padding-top:6px">Her one-sheet, hi-res photos, bios, stage plot and technical rider are in the press kit.</div>
      <div style="padding-top:14px">${button(`${SITE_URL}/press`, 'Open the press kit')}</div>
    </div>
  </td></tr>
  <tr><td style="padding:28px 32px 36px">
    <div style="font:15px/1.7 ${SANS};color:${C.body}">If anything changes before then, just reply to this email.</div>
    <div style="border-top:1px solid #2c2721;margin-top:26px;padding-top:20px;font:13px/1.7 ${SANS};color:${C.muted}">DEEJAY T-JR. Management · Three-time DMC Canadian DJ Champion<br><a href="mailto:${esc(replyTo)}" style="color:${C.muted}">${esc(replyTo)}</a> · <a href="${SITE_URL}" style="color:${C.muted}">deejaytjr.com</a></div>
  </td></tr>
</table>
</body></html>`;
}

/** Plain-text alternative for the acknowledgement. Helps deliverability. */
export function autoReplyText(lead: LeadPayload, replyTo: string): string {
  const when = val(lead.eventDate);
  return `Thanks for reaching out.

Hi ${firstName(lead.name)}, your booking inquiry for ${eventLabel(lead).toLowerCase()}${when ? ` on ${when}` : ''} has been received. DEEJAY T-JR.'s management will get back to you within one business day with availability and a quote.

Her one-sheet, hi-res photos, bios, stage plot and technical rider are in the press kit: ${SITE_URL}/press

If anything changes before then, just reply to this email.

DEEJAY T-JR. Management
${replyTo} · deejaytjr.com
`;
}
