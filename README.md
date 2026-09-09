# deejaytjr.com

Booking site for DEEJAY T-JR. Built by Frankpella LLC against
`../deejaytjr-developer-brief.md`, which is the specification. When this README
and the brief disagree, the brief wins.

The site has one job: generate qualified booking leads. Every page either builds
the case for booking her or removes friction from asking.

## Running it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # production build into dist/ and .vercel/output/
npm run preview  # serve the production build
npm run check    # TypeScript + Astro diagnostics
```

Node 22 is the deployment runtime. Newer local versions build fine; Vercel pins 22.

## What is built

Phase 1 of the brief, section 12:

| Route | Notes |
|---|---|
| `/` | Homepage. Section order is fixed by the brief and is final. |
| `/corporate-events` | Service page |
| `/private-events` | Service page |
| `/clubs-and-festivals` | Service page, promoter-facing |
| `/brand-partnerships` | Service page plus the media kit block |
| `/international` | Hub |
| `/international/usa` | Country page |
| `/about` | Long-form story, anchor-linked sections |
| `/press` | Web EPK, ungated |
| `/watch` | Events and Battles tabs |
| `/contact` | Standalone availability form |
| `/privacy`, `/terms` | Legal |
| `/404` | Not found |
| `/api/lead` | Booking form endpoint (the only on-demand route) |

Phase 2 — Brazil, France, UK and South Africa country pages, `/dj/[city]`
programmatic pages, the Academy waitlist — is not built. The international hub
lists those countries as in progress rather than linking to thin stubs, because
the brief forbids publishing city pages without genuinely unique copy.

## Deviations from the developer brief

Three deliberate departures, all authorised by the project lead. Everything else
follows the brief.

**1. Palette — black/gold replaced with her real identity colours.**
Brief section 5 specifies gold `#d4af35`, described as "sampled from her
signature". The actual identity files in `TJR_logos/` are **teal `#4c6971`** and
**sand `#d5c9b1`** — her signature is sand on teal, not gold on black.

The site now runs a **warm near-black base** (`#0e0d0c`) with **tan `#d5c9b1`**
as the accent, used at full strength as a section background. Two things drove
that:

- Brand teal on a dark base measures **3.34:1**, which fails WCAG AA for text,
  and at large sizes it reads green rather than teal. It is retired from site
  chrome and survives inside the logo itself, where it belongs.
- The base is *warm*, not cool. Her entire photo library is stage-lit and dark
  (average luminance 24–59 of 255), so the page has to stay dark for the
  photography to sit in it rather than on it. A light tan page was considered
  and rejected for exactly this reason.

`src/styles/tokens.css` records the measured contrast ratio for every pair.

**2. Body typeface — Inter replaced with Geist.**
Brief section 5 specifies Inter. Geist is the same class of neutral grotesk with
more character in the numerals and lowercase, and it is 40% smaller on the wire
(29KB vs 48KB for the latin subset). Bodoni Moda is unchanged for display. To
revert, swap `--sans` in `tokens.css` and the two `@font-face` blocks.

**3. Motion — the brief forbids it; the client asked for it.**
Brief section 5 says "None on load. No scroll-reveal animations." The client
subsequently asked for an interactive site, which supersedes that line. What was
added is listed under "Motion" below. It is all vanilla, it costs ~3KB, and
`prefers-reduced-motion` disables every part of it.

## Architecture

```
src/
  data/site.ts        Facts that appear in more than one place. Awards, socials,
                      nav, credentials. The JSON-LD sameAs list is generated
                      from here, so it can never drift from the footer links.
  data/faqs.ts        FAQ sets. Each page renders one and emits the matching
                      FAQPage schema from the same array.
  lib/schema.ts       JSON-LD builders. Every page emits one @graph; nodes
                      reference the Person by @id instead of repeating it.
  lib/form.ts         Validation shared by the browser and the endpoint, so a
                      lead cannot pass one and fail the other.
  styles/tokens.css   The design system. Single source of truth.
  styles/global.css   Fonts, reset, typography, layout primitives, buttons.
  components/         The 13 components from brief section 5, one file each.
  layouts/            Base (head, schema, chrome), Service (the 8-block service
                      skeleton), Legal.
  content/            Editable records: videos, press, testimonials, events.
                      Zod-schema'd — malformed content fails the build.
  pages/              Routes.
```

## The tan band

`.section.tan` is a full-bleed section in the brand tan with ink type. It is
where the palette announces itself, so it is used sparingly — two bands on the
homepage (booking lanes and the availability form), one per inner page.

It works by **rebinding the surface tokens inside its own scope** rather than
restyling every child. Components keep using `--bone`, `--body`, `--hairline`
and so on, and those resolve to the on-tan values automatically. Drop any
component into a band and it is correct without knowing the band exists — the
hairline grid inverts to dark rules on light, the buttons flip to an ink fill.

Two traps, both of which bit during the build:

- The band's own background uses a separate `--tan-band` token. Using `--tan`
  would break it, because the band rebinds `--tan` to the ink value and custom
  properties do not care about declaration order.
- Inside a band, set `background-color`, never the `background` shorthand. The
  shorthand resets `background-position/size/repeat`, which the select control's
  CSS-drawn arrow depends on — it tiled the arrow across the whole field and
  turned every select into a dark block.

## Photography

21 of the client's own photographs, processed into `src/assets/photos/` and
registered with alt text in `src/data/photos.ts`. They go through Astro's image
pipeline, so every tag gets a responsive srcset, WebP, and explicit dimensions.

Real production weight, measured against the built output on a threaded local
server (median of five runs):

| | Desktop 1440 | Mobile 390 |
|---|---|---|
| LCP | 840 ms | 624 ms |
| CLS | 0 | 0 |
| Total, incl. deferred hero frames | 796 KB | 538 KB |
| JavaScript | 7.6 KB | 7.6 KB |

The LCP element is the first hero frame, confirmed by reading the
`largest-contentful-paint` entry rather than inferring it.

### Fonts and layout stability

Both faces use `font-display: optional`, not `swap`, and both are preloaded.
They are almost always in cache before first paint; when they are not, the
browser keeps the fallback for that load instead of swapping mid-render.

That matters because the hero copy is vertically centred, so any change in the
headline's height moves the whole block by half the difference. With `swap` this
measured a consistent **0.0218 CLS on every load**.

The fallbacks are metrics-matched with `size-adjust`, measured in-browser rather
than estimated: Geist renders 4.5% wider than Arial, Bodoni Moda 5.9% narrower
than Georgia. There are deliberately **no ascent/descent overrides** — every
line-height here is a unitless number, so line boxes follow font-size, and
guessed vertical overrides made CLS worse rather than better.

## Motion

`src/lib/motion.ts`, ~3KB, no animation library. Every effect writes a CSS custom
property or toggles an attribute; the browser does the animating, off the main
thread.

| Effect | Where | Notes |
|---|---|---|
| Scroll reveal with stagger | every section | 55ms apart, capped at 6 |
| Magnetic buttons | hero, nav CTA, form submit | fine pointers only |
| Cursor spotlight | every hairline card | writes `--mx/--my` on the hovered card only |
| Count-up | credential and KPI figures | preserves the authored string exactly |
| Nav tuck | all pages | hides on scroll down, returns on scroll up |
| Hero clip-path unveil | hero image | wipes open from the right on load |
| Hero rotation | homepage hero | four photographs, 6.5s dwell, 1.4s wipe |
| Photo marquee | under the hero | 10 photos, seamless loop, pauses on hover |

The marquee duplicates its track once and translates by exactly `-50%`, which is
what makes the loop seamless: at the reset frame the second copy sits precisely
where the first began. The duplicate is `aria-hidden`, so a screen reader hears
each photo once. Under `prefers-reduced-motion` it freezes and becomes
horizontally scrollable rather than clipped.

**Removed, deliberately — do not reinstate without a reason:**

- *The credential ticker* that ran under the nav. It read as clutter above the
  hero and pushed the primary CTA toward the fold.
- *The outlined "T-JR." watermark* behind the hero. It carried over from the
  prototype, where the hero was mostly empty. With a real photograph filling the
  right side you only ever saw fragments of the letterforms, so it read as stray
  lines rather than type — the client's reaction was "what are those letters",
  which is the whole verdict on a decorative element.

Two rules this code follows, both of which caused real bugs before they were:

- **Motion never decides whether content is visible.** The hidden state is added
  by JavaScript, so with JS off nothing is ever hidden. Anything already inside
  the first screen reveals on load rather than waiting for a scroll — otherwise
  the hero CTA, which sits just below the observer's trigger line, stays
  invisible until the visitor scrolls. There is also a sweep at the bottom of the
  document that releases anything the observer's negative root margin stranded.
- **Never fade a hairline-grid cell.** The grid paints its separator colour
  behind every cell, so fading the cell exposes that colour as a grey slab. The
  cell stays opaque and its contents animate instead.

### Two things worth knowing before you edit

**The hairline grid.** Cards are grid cells with a 1px gap letting the container
background show through — `.hgrid` in `global.css`. CredentialsStrip,
BookingLanes, PressCards, the KPI grids and the media kit all use it. Use it for
anything new rather than adding borders per card, or the rules will double up
and go ragged at breakpoints.

**Design tokens are closed.** No new colours, no new typefaces. Sand is
punctuation — CTA, focus ring, seal, one italic word per headline, the step
rules. If something new needs sand, it probably does not. And teal is never text:
see the contrast note above.

## The hero rotation

The homepage hero cycles through four photographs. Service pages deliberately do
not — a corporate planner should not watch the hero cut to a battle shot, so
those pass a single contextual `photo` instead of a `photos` array.

Frames are stacked in one absolutely-positioned box, so switching between them
cannot shift layout. The incoming frame is lifted above the outgoing one and its
`clip-path` opens, wiping the new photograph across the old rather than
dissolving through it — two photographs crossfading reads as mud, a moving edge
reads as deliberate, and it echoes the same clip-path the hero uses on load.

Four things this code does that are easy to get wrong:

- **The scrim sits above every frame** (`z-index: 5`). Frames need a z-index for
  the wipe, and without lifting the scrim above them the gradient that darkens
  the photo ends up *underneath* it — which puts the headline straight onto a
  lit photograph.
- **Inactive frames are `opacity: 0`, not merely clipped.** Chrome excludes
  fully transparent elements from the LCP candidate set; without it the browser
  treated the last stacked frame as the largest paint and LCP waited on every
  hero image (1256ms against 420ms).
- **Frames after the first are built with `getImage()` and parked in `data-`
  attributes** until the `load` event. Rendered as normal `<img src>` they
  download immediately — they are inside the viewport, so `loading="lazy"` does
  not defer them — and compete with the hero for bandwidth.
- **The timer stops while the tab is hidden** and restarts when it returns. A
  timer firing against a background tab burns battery and guarantees the visitor
  comes back mid-transition.

Under `prefers-reduced-motion` the rotation never starts and the first frame
simply stays.

## Audience data and the media kit

`/media-kit` is a shareable, print-friendly page for promoters, agencies and
brands abroad — the ones deciding from a link rather than from a meeting.

Every figure on it comes from dated snapshots in `src/content/audience/`, read
through `src/lib/audience.ts`. Three rules that module never breaks:

- **Growth is calculated, never typed.** Percentages are derived between
  snapshots, so a growth figure cannot contradict the follower count it came
  from.
- **A number that was not supplied stays `null`** and renders as "pending" —
  never as zero, never as an estimate. Brand teams check these against her live
  profiles, so a gap is safer than a guess.
- **Every figure carries its capture date.** Anything older than 120 days is
  flagged internally as stale.

### Updating her numbers

```bash
npm run audience -- --tiktok 18400 --instagram 6200
npm run audience -- --youtube-auto            # needs YOUTUBE_API_KEY
```

Writes a dated snapshot to `src/content/audience/`. **Snapshots may be partial** —
record whichever platforms you have today, and the rest keep their own older
figure and their own date. Each platform tracks its own capture date and
computes growth against the last snapshot that gave it a number, because in
practice you never capture all seven on the same day.

### What can actually be automated

| Platform | Automatable? | Why |
|---|---|---|
| YouTube | **Yes** | Data API returns public stats for a plain API key. No OAuth, nothing expires. |
| Instagram, Facebook | No | Business/Creator account, OAuth, token expires ~60 days |
| TikTok | No | Display API is OAuth-only, same expiry |
| X | No | API is paid |
| SoundCloud | No | API registration closed to new apps for years |
| Bandcamp | No | No public API |

Scraping the public profiles is not a workaround — they render their numbers
with JavaScript, so an HTML fetch returns nothing (verified, not assumed), and
anything that did work would break silently on the next layout change. A
silently-stale follower count is worse than no follower count.

So: YouTube refreshes itself, and the other six are read off her public profiles
in a browser — which needs no login, just a look — and passed to the script.

`getCredentials()` in the same module builds the four-cell credentials strip
used on every page, so the follower figure there is the same one the media kit
shows. Before this existed the same numbers were hardcoded in six files.

Volatile figures were also removed from evergreen copy — the bios on `/press`,
the about page and the FAQs now point at the media kit instead of quoting a
growth percentage. A bio is the worst place for a number that expires:
journalists copy it verbatim and it outlives its accuracy by years.

## The booking form

One component (`AvailabilityForm.astro`) on every page, posting to
`/api/lead`. On submit the endpoint emails management via Resend, appends an
Airtable row, sends the submitter an auto-reply, and the browser fires a GA4
`generate_lead` event and shows an inline success state. No redirect.

Service pages pre-select the event type. A `?type=` URL parameter overrides the
page default, so a campaign link can set it independently of where it lands.

**Without credentials it still works.** With no env vars set, the endpoint
validates, logs the full payload to the console and returns success — so the
whole path is testable now. Set the variables in `.env.example` to go live.

Inline errors reserve their line height once the form has been submitted once
(`form[data-submitted] .err`). Without that, correcting a field clears its
message, the message's space collapses, and the submit button jumps upward while
the visitor is still typing — measured at 0px shift now.

The three side effects run through `Promise.allSettled`: a full Airtable base or
a bounced auto-reply must not cost us the notification to management. If all
three fail the endpoint returns 502 and the form shows a mailto fallback rather
than a false success. A lead is never silently dropped.

## Assets

Read `ASSETS-NEEDED.md`. Her logo files are now in the build, sourced from
`TJR_logos/` and rendered as recolourable CSS masks. Still outstanding and still
blocking: photography, video links, testimonials and confirmed rates.

Placeholders are deliberately visible — diagonal hatching with a caption naming
the slot. If you can see one, that page is not ready to ship. They reserve the
exact aspect ratio the real asset will occupy, so dropping images in later
causes no layout shift.

## Deployment

Vercel, via `@astrojs/vercel`. `vercel.json` carries the 301 map from the old
Squarespace site (brief section 4) plus security and font-caching headers.

To move to Cloudflare Pages instead: `npm i @astrojs/cloudflare` and swap the
adapter in `astro.config.mjs`. Everything else is portable; only `/api/lead`
runs on-demand.

## Voice

The site is run by her and her team, and the copy has to sound like it. Two
voices, used deliberately:

- **"her team"** — third person, describing what her operation does.
  *"Her team handles work authorisation for the territory."*
- **"we" / "us"** — her team speaking directly to the reader. Every promise,
  confirmation and contact line uses this.
  *"We reply within one business day."* · *"Reach us at…"* ·
  *"You'll hear from us within one business day."*

She stays in third person as the artist — that is what lets the credentials read
as fact rather than as boast — while the team speaks in first person.

**Never "her management".** It reads as an outside agency handling her, which is
the opposite of the impression this site exists to give. It appeared 27 times
across 16 files and has been removed; the auto-reply email signs off as
*"The DEEJAY T-JR. team"*.

## Claim discipline

**She is a three-time DMC *Canadian* Champion who finished top 9 at the World
Finals. She is not a world champion.** The hero headline claimed she was, from
the approved prototype onward — the only place on the site that did. The awards
list, the credentials strip and her own Instagram bio all say Canadian champion.

That matters more here than on most sites. The entire strategy is verifiable
proof for risk-averse buyers, and a DMC-literate promoter would catch the
overclaim in seconds and then discount the true claims sitting beneath it. The
honest record is strong enough without inflating.

The headline is now **"Canada's most decorated DJ. Available for *your* date."**
— credential plus availability, which is the question a planner actually arrives
with. "Most decorated" is defensible on three consecutive national titles plus
being the only woman to have competed at all four majors.

Before changing any claim on this site, check it against `AWARDS` in
`src/data/site.ts`. If it is not in that list, it needs a source.

`AWARDS` entries carry an optional `source` URL, which renders as a clickable
link beside the result on `/press`, `/about` and `/media-kit`. `ROLES` holds
positions held rather than results won — currently her DMC Canada branch
managership, which is authority rather than achievement and reads differently.

### ISNI

`ISNI` in `src/data/site.ts` is emitted as a `PropertyValue` identifier on the
Person node and included in `sameAs`. It is the ISO standard identifier for her
public identity, and it is the single most useful thing on the site for the
brief's fourth success metric — correct entity description in AI answers —
because it is what lets Wikidata, MusicBrainz and the models trained on them
resolve every mention of "DEEJAY T-JR" to one person. It must match the external
records exactly.

### Headline typography

Three things keep that headline working, and all three break if it is edited
carelessly:

- **An explicit `<br>` after the first sentence.** Without it the line broke as
  "DJ. Available", putting the end of one sentence and the start of another on
  the same line.
- **`&nbsp;` binding "your date."** Without it "date." orphaned onto its own
  line while the line above ran furthest right, over the subject of the photo.
- **`text-wrap: pretty`, not `balance`.** `balance` redistributes words across
  an author-specified break and undoes both of the above.
- **`font-size: min(var(--h1), 10.5vh)`.** Four lines at the full 96px pushes
  the primary CTA below the fold on a 1366x768 laptop. The type gives way
  instead. Verified visible at 1920, 1440x900, 1440x800, 1366x768 and 390.

## Conventions

- Sentence case everywhere. No all-caps, no eyebrow labels above headings.
- Left-aligned. No centred hero text.
- No motion on load, none on scroll. Hover states only, 200ms.
  `prefers-reduced-motion` disables everything.
- Every interactive element gets a sand focus ring. Form controls use
  `:focus-within`, not `:focus` — keyboard focus on `<input type="date">` lands
  inside the control's shadow tree, so `:focus` never matches the host.
- YouTube loads only on click, never on arrival.
- No invented facts. Where the brief says "client to supply", the slot renders
  as a marked placeholder rather than as plausible-looking fiction.
