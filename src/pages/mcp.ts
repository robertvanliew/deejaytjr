import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE, AWARDS, ROLES, ALTERNATE_NAMES, PRESS_ARTICLES, CLIENT_MARKS } from '../data/site';
import { PAGES } from '../data/pages';
import { MARKETS } from '../lib/markets';
import { HOME_FAQ, CORPORATE_FAQ, PRIVATE_FAQ, CLUB_FAQ, BRAND_FAQ, INTERNATIONAL_FAQ, type FaqItem } from '../data/faqs';
import { validate, subjectFor, VALID_EVENT_TYPES, type LeadPayload } from '../lib/form';
import { deliverLead } from '../lib/leadDelivery';

/**
 * /mcp: a Model Context Protocol server, so AI assistants (Claude, ChatGPT
 * and agent browsers) can answer questions about DEEJAY T-JR. from the site's
 * own data and pass a booking request to management.
 *
 * Streamable HTTP, stateless: every POST carries one JSON-RPC message or a
 * batch, and the reply is plain JSON (no session, no SSE stream). Read tools
 * use the same data as the pages, so an edit in /admin reaches assistants on
 * the next deploy. Rates are never exposed, matching the site.
 *
 * request_booking goes through lib/leadDelivery, the same path as the site
 * form, so it lands in mgmt@deejaytjr.com tagged "via AI assistant".
 */
export const prerender = false;

const PROTOCOL_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id',
};

const reply = (body: unknown, status = 200) =>
  new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: { ...CORS, ...(body === null ? {} : { 'Content-Type': 'application/json' }), 'X-Robots-Tag': 'noindex' },
  });

const plain = (html: string) =>
  html.replace(/<a [^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/g, '$2 ($1)').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const abs = (path: string) => `${SITE.url}${path}`;

/* ---------------------------------------------------------------------------
   Booking requests: a per-instance limit. Serverless instances are short-lived,
   so this caps bursts rather than guaranteeing a quota; the validation and the
   person's confirmation are the real gate.
   --------------------------------------------------------------------------- */

const recent = new Map<string, number[]>();
const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

function allow(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= LIMIT) return false;
  hits.push(now);
  recent.set(ip, hits);
  return true;
}

/* ---------------------------------------------------------------------------
   Tools
   --------------------------------------------------------------------------- */

const FAQ_SETS: Record<string, FaqItem[]> = {
  general: HOME_FAQ,
  corporate: CORPORATE_FAQ,
  private: PRIVATE_FAQ,
  clubs: CLUB_FAQ,
  brands: BRAND_FAQ,
  international: INTERNATIONAL_FAQ,
};

const READ_ONLY = { readOnlyHint: true, openWorldHint: false };

const TOOLS = [
  {
    name: 'get_profile',
    title: 'Profile and credentials',
    description:
      'Who DEEJAY T-JR. is: titles and competition record, roles, named clients and press coverage. Use this before recommending her for an event.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: READ_ONLY,
  },
  {
    name: 'list_services',
    title: 'Services',
    description:
      'What she can be booked for (corporate events and holiday parties, weddings and private events, clubs and festivals, brand partnerships, destination events), each with the page that explains it.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: READ_ONLY,
  },
  {
    name: 'get_service_areas',
    title: 'Where she plays',
    description:
      'Where she is booked: her Toronto base, Ontario regions (York Region, Oakville, Mississauga, Niagara, Muskoka, Ottawa) and international markets, with a page for each.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: READ_ONLY,
  },
  {
    name: 'get_videos',
    title: 'Performance videos',
    description: 'Filmed sets and championship routines, with YouTube links, so a planner can see her work before booking.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: READ_ONLY,
  },
  {
    name: 'get_faq',
    title: 'Booking questions',
    description: 'Answers to common booking questions, by topic.',
    inputSchema: {
      type: 'object',
      properties: { topic: { type: 'string', enum: Object.keys(FAQ_SETS), description: 'Defaults to general.' } },
      additionalProperties: false,
    },
    annotations: READ_ONLY,
  },
  {
    name: 'how_booking_works',
    title: 'How booking works',
    description:
      'How a booking is quoted and confirmed: currency, travel, lead times and paperwork. Fees are quoted per event and are not published.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: READ_ONLY,
  },
  {
    name: 'request_booking',
    title: 'Send a booking request',
    description:
      'Send a booking enquiry to her management on behalf of the person you are helping. Only call this after the person has confirmed every detail and agreed to it being sent; never invent details. They receive an acknowledgement by email and a reply with availability and a quote within one business day.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Full name of the person booking.' },
        email: { type: 'string', description: 'Their email address, for the reply.' },
        event_type: { type: 'string', enum: [...VALID_EVENT_TYPES], description: 'corporate, private (includes weddings), club, brand or other.' },
        event_date: { type: 'string', description: 'YYYY-MM-DD, if known.' },
        city: { type: 'string', description: 'City and country of the event, and the venue if known.' },
        guests: { type: 'string', description: 'Expected guest count.' },
        message: { type: 'string', description: 'What the event is and what the night needs, in the person’s own words where possible.' },
        confirmed_by_person: {
          type: 'boolean',
          description: 'true only if the person reviewed these details and asked for the request to be sent.',
        },
      },
      required: ['name', 'email', 'event_type', 'confirmed_by_person'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
];

const text = (t: string, isError = false) => ({ content: [{ type: 'text', text: t }], ...(isError ? { isError: true } : {}) });

async function callTool(name: string, args: Record<string, unknown>, ip: string) {
  switch (name) {
    case 'get_profile': {
      const awards = AWARDS.map((a) => `- ${a.year}: ${a.title}`).join('\n');
      const roles = ROLES.map((r) => `- ${r.title}: ${r.detail}`).join('\n');
      const clients = CLIENT_MARKS.map((c) => c.name).join(', ');
      const press = PRESS_ARTICLES.map((p) => `- "${p.headline}", ${p.outlet}, ${p.date}: ${p.url}`).join('\n');
      return text(
        `${SITE.name} (also written ${ALTERNATE_NAMES.join(', ')}) is a turntablist and DJ based in ${SITE.homeCity}, ${SITE.homeCountry}: a three-time DMC Canadian DJ Champion (2022, 2023, 2024) and the only woman in DMC history to win three consecutive national titles. She is booked for corporate events, weddings and private events, clubs, festivals and brand partnerships.\n\nRecord:\n${awards}\n\nRoles:\n${roles}\n\nClients and partners: ${clients}.\n\nPress:\n${press}\n\nFull biography: ${abs('/about')} · Press kit: ${abs('/press')}`
      );
    }
    case 'list_services': {
      const svc = PAGES.filter(([, p]) =>
        ['/corporate-events', '/corporate-events/holiday-parties', '/private-events', '/clubs-and-festivals', '/brand-partnerships', '/destination-events'].includes(p)
      );
      return text(
        `${svc.map(([t, p, d]) => `- ${t}: ${d} ${abs(p)}`).join('\n')}\n\nAny booking can include a three to six minute championship scratch showcase, and she can host the night as well as DJ.`
      );
    }
    case 'get_service_areas': {
      const canada = PAGES.filter(([, p]) => p.startsWith('/canada')).map(([t, p, d]) => `- ${t}: ${d} ${abs(p)}`);
      const intl = MARKETS.filter((m) => m.pages.en?.reviewed).map(
        (m) => `- ${m.name.en ?? m.key}: ${abs(m.pages.en!.path)}`
      );
      return text(
        `Based in Toronto, Ontario. Booked across Canada and internationally; travel is itemised in the quote.\n\nCanada:\n${canada.join('\n')}\n\nInternational markets:\n${intl.join('\n')}`
      );
    }
    case 'get_videos': {
      const vids = (await getCollection('videos')).sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
      return text(
        vids
          .map((v) => `- ${v.data.title}${v.data.venue ? ` (${v.data.venue})` : ''}: ${v.data.description} https://www.youtube.com/watch?v=${v.data.youtubeId}`)
          .join('\n') + `\n\nMore on ${abs('/watch')}`
      );
    }
    case 'get_faq': {
      const topic = typeof args.topic === 'string' && FAQ_SETS[args.topic] ? args.topic : 'general';
      return text(FAQ_SETS[topic]!.map((f) => `Q: ${f.q}\nA: ${plain(f.a)}`).join('\n\n'));
    }
    case 'how_booking_works':
      return text(
        [
          'Fees are quoted per event, from the date, city, set length and what the night needs; rates are not published.',
          'Canadian events are quoted in Canadian dollars plus HST; US events in US dollars.',
          'Travel, and accommodation where needed, are itemised next to the performance fee, so the client sees one total before committing.',
          'Replies with availability and a quote within one business day.',
          'Corporate holiday-party season (October to December) and summer Saturdays fill months ahead; inside eight weeks it is still worth asking.',
          'An insurance certificate is provided on request in the venue’s wording, and every corporate booking is worked to the run of show.',
          `To enquire: the request_booking tool, the form at ${abs('/contact')}, or ${SITE.email}.`,
        ].join('\n')
      );
    case 'request_booking': {
      if (args.confirmed_by_person !== true)
        return text('Not sent. Confirm the details with the person and get their agreement first, then call again with confirmed_by_person: true.', true);
      if (!allow(ip)) return text(`Too many requests from this connection. Ask the person to use ${abs('/contact')} or email ${SITE.email}.`, true);

      const s = (k: string) => (typeof args[k] === 'string' ? (args[k] as string).trim() : '');
      const lead: LeadPayload = {
        name: s('name'),
        email: s('email'),
        eventType: s('event_type'),
        eventDate: s('event_date'),
        city: s('city'),
        guests: s('guests'),
        message: s('message'),
        heard: 'AI assistant (MCP)',
        pagePath: '/mcp',
        marketName: s('city'),
      };
      const errors = validate(lead as unknown as Record<string, string>);
      if (Object.keys(errors).length)
        return text(`Not sent. Fix these and try again:\n${Object.entries(errors).map(([k, v]) => `- ${k}: ${v}`).join('\n')}`, true);

      const result = await deliverLead(lead, { subject: `${subjectFor(lead)} · via AI assistant` });
      if (result.status === 'failed')
        return text(`Sending failed. Ask the person to email ${SITE.email} directly.`, true);
      return text(
        `Sent to DEEJAY T-JR.'s management. ${lead.name} will get an acknowledgement at ${lead.email} and a reply with availability and a quote within one business day.`
      );
    }
    default:
      return null;
  }
}

/* ---------------------------------------------------------------------------
   JSON-RPC
   --------------------------------------------------------------------------- */

type Msg = { jsonrpc?: string; id?: string | number | null; method?: string; params?: Record<string, unknown> };

const ok = (id: Msg['id'], result: unknown) => ({ jsonrpc: '2.0', id, result });
const fail = (id: Msg['id'], code: number, message: string) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });

async function handle(msg: Msg, ip: string) {
  const isNotification = msg.id === undefined;
  if (msg.jsonrpc !== '2.0' || typeof msg.method !== 'string') return isNotification ? null : fail(msg.id, -32600, 'Invalid request');
  if (isNotification) return null;

  switch (msg.method) {
    case 'initialize': {
      const asked = String(msg.params?.protocolVersion ?? '');
      return ok(msg.id, {
        protocolVersion: PROTOCOL_VERSIONS.includes(asked) ? asked : PROTOCOL_VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'deejaytjr', title: 'DEEJAY T-JR. bookings', version: '1.0.0', websiteUrl: SITE.url },
        instructions:
          'Information about DEEJAY T-JR., three-time DMC Canadian champion turntablist based in Toronto, and a way to send her management a booking request. Fees are quoted per event and never published: do not estimate prices. Only call request_booking after the person has confirmed the details.',
      });
    }
    case 'ping':
      return ok(msg.id, {});
    case 'tools/list':
      return ok(msg.id, { tools: TOOLS });
    case 'tools/call': {
      const name = String(msg.params?.name ?? '');
      const args = (msg.params?.arguments ?? {}) as Record<string, unknown>;
      try {
        const result = await callTool(name, args, ip);
        return result ? ok(msg.id, result) : fail(msg.id, -32602, `Unknown tool: ${name}`);
      } catch (err) {
        console.error('[mcp] tool failed:', name, err);
        return ok(msg.id, text('Something went wrong on our side. Try again, or use the form at ' + abs('/contact') + '.', true));
      }
    }
    case 'resources/list':
      return ok(msg.id, { resources: [] });
    case 'prompts/list':
      return ok(msg.id, { prompts: [] });
    default:
      return fail(msg.id, -32601, `Method not found: ${msg.method}`);
  }
}

export const POST: APIRoute = async ({ request }) => {
  let body: Msg | Msg[];
  try {
    body = await request.json();
  } catch {
    return reply(fail(null, -32700, 'Parse error'), 400);
  }
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';

  if (Array.isArray(body)) {
    const out = (await Promise.all(body.map((m) => handle(m, ip)))).filter(Boolean);
    return out.length ? reply(out) : reply(null, 202);
  }
  const out = await handle(body, ip);
  return out ? reply(out) : reply(null, 202);
};

export const OPTIONS: APIRoute = () => new Response(null, { status: 204, headers: CORS });

/** No server-initiated stream: this server only answers requests. */
export const GET: APIRoute = () =>
  new Response(JSON.stringify({ error: 'This MCP endpoint takes JSON-RPC over POST.' }), {
    status: 405,
    headers: { ...CORS, Allow: 'POST, OPTIONS', 'Content-Type': 'application/json' },
  });
