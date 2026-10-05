/**
 * First-touch attribution.
 *
 * The campaign that FIRST brought someone to the site is the one that earned
 * the lead, even if they come back a week later by typing the address. So the
 * first set of utm_* values is kept for 30 days in a small first-party cookie
 * and sent with any booking request. Later visits never overwrite it.
 *
 * No third party sees it, it holds no personal data, and it is disclosed in
 * the privacy policy.
 */
const NAME = 'tjr_ft';
const DAYS = 30;

export interface FirstTouch {
  ftSource: string;
  ftMedium: string;
  ftCampaign: string;
  ftLanding: string;
}

function read(): FirstTouch | null {
  const raw = document.cookie.split('; ').find((c) => c.startsWith(`${NAME}=`));
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw.slice(NAME.length + 1)));
  } catch {
    return null;
  }
}

/** Call on every page load: records the first campaign visit, once. */
export function recordFirstTouch() {
  if (read()) return;
  const p = new URLSearchParams(location.search);
  const source = p.get('utm_source');
  if (!source) return;
  const ft: FirstTouch = {
    ftSource: source,
    ftMedium: p.get('utm_medium') ?? '',
    ftCampaign: p.get('utm_campaign') ?? '',
    ftLanding: location.pathname,
  };
  const exp = new Date(Date.now() + DAYS * 864e5).toUTCString();
  document.cookie = `${NAME}=${encodeURIComponent(JSON.stringify(ft))}; expires=${exp}; path=/; SameSite=Lax; Secure`;
}

/** Values for the lead payload; empty strings when there was no campaign. */
export function firstTouch(): FirstTouch {
  return read() ?? { ftSource: '', ftMedium: '', ftCampaign: '', ftLanding: '' };
}
