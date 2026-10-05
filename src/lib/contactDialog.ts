import { SITE_EMAIL, validate, type LeadPayload } from './form';
import { mountTurnstile, turnstileToken } from './turnstile';

/**
 * Turns the published email address into a form, without taking the address
 * away. See ContactDialog.astro for why `mailto:` is the wrong default here.
 *
 * Only links carrying `data-contact` are intercepted. The rule for which get it
 * is deliberate: an address that IS the escape hatch — "prefer email?", the
 * fallback shown when the endpoint fails, the contact page's own "rather just
 * email" — stays a real mailto, because the whole point of those is to reach
 * someone who does not want a form. The footer, press and media-kit addresses,
 * where the mailto is the primary call to action, become the dialog.
 */
export function contactDialog() {
  const dlg = document.querySelector<HTMLDialogElement>('dialog.cdlg');
  /* Client decision (Oct 2026): every published address opens the form, on
     every page. Two exceptions keep a real mailto: the dialog's own "prefer
     your mail app" line, and the error fallback shown when sending fails. */
  const links = [...document.querySelectorAll<HTMLAnchorElement>('a[href^="mailto:"]')].filter(
    (a) => !a.closest('dialog.cdlg, .formerr, [data-no-contact]')
  );
  if (!dlg || !links.length) return;

  const form = dlg.querySelector<HTMLFormElement>('#contact-form')!;
  const done = dlg.querySelector<HTMLElement>('.done')!;
  const formErr = dlg.querySelector<HTMLParagraphElement>('.formerr')!;
  const field = (n: string) => form.elements.namedItem(n) as HTMLInputElement | null;
  const slotId = (n: string) => `ce-${n === 'eventType' ? 'type' : n}`;

  let opener: HTMLElement | null = null;
  let shownAt = 0;

  const clearErrors = () => {
    form.querySelectorAll('.err').forEach((e) => (e.textContent = ''));
    form.querySelectorAll('[aria-invalid]').forEach((e) => e.removeAttribute('aria-invalid'));
    formErr.hidden = true;
  };

  /* `open` and `close` are hoisted declarations, so the null guard above does
     not narrow `dlg` inside them. Capture it once, after the guard. */
  const d = dlg;

  function open(from: HTMLElement) {
    opener = from;
    /* Reset to a clean form, so a second enquiry in one visit does not open on
       the previous "Sent." panel. */
    form.hidden = false;
    done.hidden = true;
    shownAt = Date.now();
    d.showModal();
    mountTurnstile(form.querySelector<HTMLElement>('[data-turnstile]'));
    field('name')?.focus();
  }

  function close() {
    d.close();
    opener?.focus();
  }

  links.forEach((a) =>
    a.addEventListener('click', (e) => {
      /* Let a modified click through — someone cmd-clicking a mailto is asking
         for their mail client on purpose. */
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      open(a);
    })
  );

  dlg.querySelector('.x')!.addEventListener('click', close);
  dlg.querySelector('.closebtn')!.addEventListener('click', close);
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) close();
  });

  /* Re-validate a field once it has been fixed, not on every keystroke. */
  form.addEventListener(
    'blur',
    (e) => {
      const el = e.target as HTMLInputElement;
      if (!el.hasAttribute('aria-invalid')) return;
      const errors = localValidate();
      if (!errors[el.name]) {
        el.removeAttribute('aria-invalid');
        const slot = document.getElementById(slotId(el.name));
        if (slot) slot.textContent = '';
      }
    },
    true
  );

  /**
   * The shared rules, plus one of our own: the booking form treats the message
   * as optional because the structured fields carry the enquiry. Here it is the
   * entire enquiry, so an empty one is not worth sending.
   */
  function localValidate(): Record<string, string> {
    const raw = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const errors = validate(raw);
    if (!(raw.message ?? '').trim()) errors.message = 'Add a short message so we know what you need.';
    return errors;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    form.setAttribute('data-submitted', '');
    clearErrors();

    const raw = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const errors = localValidate();

    if (Object.keys(errors).length) {
      for (const [name, message] of Object.entries(errors)) {
        const slot = document.getElementById(slotId(name));
        if (slot) slot.textContent = message;
        field(name)?.setAttribute('aria-invalid', 'true');
      }
      (form.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus();
      return;
    }

    const params = new URLSearchParams(location.search);
    const payload: LeadPayload = {
      ...raw,
      pagePath: location.pathname,
      pageTitle: document.title,
      utmSource: params.get('utm_source') ?? '',
      utmMedium: params.get('utm_medium') ?? '',
      utmCampaign: params.get('utm_campaign') ?? '',
      referrer: document.referrer,
      elapsedMs: Date.now() - shownAt,
      turnstileToken: turnstileToken(form),
    } as LeadPayload;

    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending…';

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      (window as any).gtag?.('event', 'generate_lead', {
        event_type: payload.eventType,
        page_path: payload.pagePath,
        currency: 'CAD',
      });

      form.hidden = true;
      done.hidden = false;
      done.focus();
    } catch {
      /* Never swallow an enquiry. If the endpoint is down, hand back the very
         thing this dialog replaced. */
      formErr.innerHTML =
        'Something went wrong sending that. Please email ' +
        `<a href="mailto:${SITE_EMAIL}">${SITE_EMAIL}</a> and we will pick it up directly.`;
      formErr.hidden = false;
      btn.disabled = false;
      btn.textContent = label;
    }
  });
}
