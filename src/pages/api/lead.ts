import type { APIRoute } from 'astro';
import { validate, type LeadPayload } from '../../lib/form';
import { deliverLead, verifyTurnstile } from '../../lib/leadDelivery';

/** On-demand: the booking form posts here. /mcp delivers through the same module. */
export const prerender = false;

const json = (body: object, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

/* ------------------------------------------------------------------------- */

export const POST: APIRoute = async ({ request }) => {
  let lead: LeadPayload;
  try {
    lead = (await request.json()) as LeadPayload;
  } catch {
    return json({ ok: false, error: 'Malformed request body.' }, 400);
  }

  /* Honeypot. Return 200 so the bot believes it succeeded and moves on. */
  if (lead.company_website?.trim()) {
    return json({ ok: true });
  }

  /**
   * Timing trap. A person needs a few seconds to read the form and type a
   * message; a script posts the instant the page settles. The client sends
   * elapsed time rather than a timestamp so a wrong clock on the visitor's
   * machine cannot fail them. A real person who somehow trips this gets a
   * clear error and the mailto fallback, not a silent drop.
   */
  const elapsed = Number(lead.elapsedMs);
  if (!Number.isFinite(elapsed) || elapsed < 2500) {
    return json({ ok: false, error: 'Could not verify this submission.' }, 400);
  }

  /* Turnstile, when configured. See verifyTurnstile. */
  if (!(await verifyTurnstile(lead.turnstileToken, request.headers.get('x-forwarded-for')))) {
    return json({ ok: false, error: 'Could not verify this submission.' }, 400);
  }

  const errors = validate(lead as unknown as Record<string, string>);
  if (Object.keys(errors).length) {
    return json({ ok: false, errors }, 422);
  }

  const result = await deliverLead(lead);
  if (result.status === 'dev') return json({ ok: true, mode: 'dev' });

  /* If literally everything failed, tell the browser so it can show the mailto
     fallback rather than a false success. */
  if (result.status === 'failed') return json({ ok: false, error: 'Delivery failed.' }, 502);

  return json({ ok: true, degraded: result.failed.length ? result.failed : undefined });
};

/** Anything but POST. Keeps crawlers and probes out of the logs. */
export const GET: APIRoute = () =>
  json({ ok: false, error: 'Send booking requests with POST.' }, 405);
