/**
 * Cloudflare Turnstile on the client.
 *
 * Everything here is a no-op until PUBLIC_TURNSTILE_SITE_KEY is set, so the
 * forms behave identically with or without it. When it is set, the widget is
 * rendered on demand — on page load for the booking form, on open for the
 * contact dialog — in `interaction-only` mode, which shows nothing to a
 * visitor who looks like a person and a checkbox to one who does not.
 *
 * Turnstile writes its token into a hidden input named `cf-turnstile-response`
 * inside the containing <form>; `turnstileToken` reads that back for the
 * payload, and lead.ts verifies it server-side.
 */

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

const SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as string | undefined;

let script: Promise<void> | null = null;

function load(): Promise<void> {
  if (script) return script;
  script = new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => resolve(); // never block the form on a third-party script
    document.head.appendChild(s);
  });
  return script;
}

/** Render the widget into `el`, once. Safe to call with null or repeatedly. */
export async function mountTurnstile(el: HTMLElement | null) {
  if (!SITE_KEY || !el || el.dataset.tsId) return;
  await load();
  if (!window.turnstile || el.dataset.tsId) return;
  el.dataset.tsId = window.turnstile.render(el, {
    sitekey: SITE_KEY,
    appearance: 'interaction-only',
    theme: 'dark',
  });
}

/** The current token for a form, or '' when Turnstile is off or not yet solved. */
export function turnstileToken(form: HTMLFormElement): string {
  return (
    form.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]')?.value ?? ''
  );
}
