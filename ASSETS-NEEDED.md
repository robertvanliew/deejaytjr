# Assets needed from the client

Every marked placeholder in the build is listed here. The site is structurally
complete; it cannot launch until these land, because the acceptance criteria in
section 13 of the developer brief require no placeholder content and no
dependency on the old Squarespace site.

Placeholders are deliberately visible — diagonal hatching with a caption naming
the slot. If you can see one on a page, that page is not ready to ship.

**Status: photography and logos are now resolved from the client's own files.**
What remains is video, testimonials, rates, the technical rider, and photo
credits.

**Send everything to:** Frankpella LLC (Robert Van Liew)

---

## Blocking for launch

### 1 and 2. Photography — RESOLVED, credits outstanding

**Raptors 905 (Oct 2026).** Four photos from the Raptors 905 Women's Celebration
Game at Paramount Fine Foods Centre are live in the marquee and press gallery.
Captions say "Raptors 905" deliberately — it is the Raptors' G League team, and
"played the Raptors' arena" would be a claim a sponsor could check and find
wrong. All four are credited to **DJ Andre905** (client-confirmed). Worth adding the game to `src/content/events/` with a date.
Also: `portrait-vertical` (red top, outdoor) matches the outfit in `bastids-bbq`,
so it is probably the same Bastid's BBQ and Joanna Foz-Dait's — confirm and credit.

**Credits (Oct 2026).** DMC photography is **Jeff Straw**; Bastid's BBQ is
**Joanna Foz-Dait** — both client-confirmed and now set per image in
`src/data/photos.ts`, which feeds the press gallery and the lightbox caption
together. Still uncredited: `early-set`, `portrait-vertical` (red outfit,
outdoor — a different event, or a different year of the BBQ?) and
`goldie-2019`. Name the photographer for each and it appears everywhere at once.
One to double-check: the Paris World Finals frames (`stage-crowd`, `club-set`)
carry DMC World's sponsor strip — confirm Jeff Straw shot those rather than
DMC's house photographer before they go out in a press pack.

**No longer blocking.** 21 photographs were found in `Deejay T-JR Photos/` and
are now live across the site. Every hero, the story portrait, the about
portrait, the press grid and the photo marquee use her real images. There are no
photographic placeholders left anywhere in the build.

Processed into `src/assets/photos/` (cropped, downsized, then run through
Astro's image pipeline for responsive WebP). Originals up to 8192px are
untouched in the source folder.

| Placement | Photo |
|---|---|
| Homepage hero | `hero-decks` — at the decks, DMC eliminations |
| Corporate hero | `event-room` |
| Private hero | `performance-wide` |
| Clubs hero | `stage-crowd` |
| Brands hero | `dmc-2024-hands` |
| International hero | `stage-wide` |
| USA hero | `club-set` |
| Story portrait | `portrait-decks` |
| About portrait | `portrait-studio` |
| Photo marquee | 10 images, see `MARQUEE` in `src/data/photos.ts` |
| Press grid | 6 images with credit lines |

**Still needed — and this one does block launch:**

- **Photographer credits and usage clearance.** Only one photographer is
  currently identifiable (Jeff Straw, from the DMC eliminations filenames).
  Every other image on `/press` reads "Credit to be confirmed". We need, per
  image: the photographer's name, and written confirmation we are cleared to
  publish and to let third parties download it. Publishing someone else's
  photography without that is a real liability, not a formality.
- **A clean-background hero portrait** would still improve the homepage. The
  current hero is a strong competition shot, but it was not composed with a
  headline sitting over the left half of it.
- Anything from a **new shoot** (brief section 11, item 1) still improves the
  service pages, which currently reuse competition and event photography rather
  than showing corporate ballrooms and private venues specifically.

### 3. Logo files — RESOLVED, one item outstanding

**No longer blocking.** The identity files were found in `TJR_logos/` and are now
in the build:

- `public/logo/signature-mask.png` — her signature, used in the nav and footer
- `public/logo/seal-mask.png` — the circle seal, used as the hero credential mark
- `public/logo/seal.png` — full-colour seal, used as the favicon
- `public/apple-touch-icon.png`

The signature and seal render as CSS masks, so they take their colour from a
design token. One asset recolours to sand, ink or teal without re-exporting, and
the mark can never drift from the palette.

**Brand colours are sampled from these files:** teal `#4c6971`, sand `#d5c9b1`.
They replace the black-and-gold palette in brief section 5 — see "Deviations
from the brief" in README.md.

Still worth getting: **the vector source**. `TJR_logos/` holds `.ai` and `.eps`,
but a clean `.svg` export would make the mark resolution-independent. At the
sizes used on the site the 3x mask is indistinguishable, so this is a nice-to-
have rather than a launch blocker.

### 4. Video — 13 clips live, only event footage still missing

Battles and interviews are complete. All load on click, never autoplay, and each
tile credits the publishing channel.

| Tab | Real | Placeholders |
|---|---|---|
| Battles | 8 | **0** |
| Interviews | 2 | **0** |
| Events | 3 | 3 |

**Deep links open at her segment.** Several of these are multi-hour streams and
documentaries — her 2024 DMC World set begins 5h 28m into DMC World's stream of
the night. Videos carry a `start` field in seconds, honoured by the player and
by the `VideoObject` schema, so nobody lands at 0:00 of a six-hour broadcast.

**A credential the site did not have.** The footage shows she competed at the
**2024 Technics DMC World Finals in Paris**, not only the 2023 Finals in London.
That is now in the awards list, sourced to DMC World's stream. Her 2024 placing
is unknown — the stream is not a results page. **Send the 2024 result** and it
goes in beside the 9th from 2023.

**Newly sourced by footage:** Red Bull 3Style Canada 2018 third place, confirmed
by the routine video on her own channel, which carries the placing in its title.

**Still needed — corporate and private event footage.** This is now the only
video gap, and it is the one that matters most: the two buyers this site is
built to convert are a corporate planner and a private host, and neither can
currently see her working a room like theirs. Everything on the site is
competition, club, showcase or brand work.

| File | What is needed |
|---|---|
| `corporate-ballroom-set.json` | A corporate event clip — **the biggest gap on the site** |
| `private-event-set.json` | A private event clip |
| `scratch-showcase.json` | A dedicated scratch showcase |

**Also outstanding for every clip:** `uploadDate` and `duration`, both required
for Google's video rich results.

### 5. Testimonials (brief section 11, item 4)

Three quotes, each with name, title, company and **written permission to
publish**. One JSON file per quote in `src/content/testimonials/` — see
`_template.json`. A quote with `permissionOnFile: false` will not render. We do
not write these on the client's behalf.

### 6. Client list and logo permissions (brief section 11, item 5)

**Logos are live.** The client confirmed (Sept 2026) that logo use is permitted,
and the homepage strip now renders the six marks. Each file was taken from that
organisation's own web property rather than a logo-aggregator site, so the
artwork is the current official one — sources are listed against `CLIENT_MARKS`
in `src/data/site.ts`.

Two things still need doing, and neither is a design task:

1. **Get the permission in writing and keep it on file.** Verbal confirmation is
   what we built on. A written record per client — even an email thread — is what
   makes this defensible if a brand team ever asks. Ontario in particular is
   worth confirming explicitly: its visual identity rules are stricter than a
   normal corporate mark, which is why that logo alone renders unaltered in full
   colour instead of being knocked out to match the row.
2. **Confirm the list itself.** If any of the six was a one-off appearance rather
   than a client engagement, it should come off the strip regardless of whether
   we hold the logo. A client strip claims a working relationship.

Separately, `src/content/events/` still has these clients at
`permissionOnFile: false`, so the event pages show the generic event name rather
than the client name. That flag is about naming clients against specific dates,
which is a broader claim than showing a logo — set it to `true` per client only
where the permission covers it.

If a file ever needs replacing, drop the new one into `public/logo/clients/` and
update the entry in `CLIENT_MARKS`. Removing the `file` key reverts that mark to
a serif wordmark with no other change.

### 7. Rates (brief section 11, item 6)

Confirm the budget ranges and the currency in `BUDGET_RANGES` in
`src/data/site.ts`. They are the brief's placeholder ranges in CAD. Also confirm
whether a "from" price can be published — it materially changes how the service
pages read.

### 8. Stage plot and technical rider (brief section 11, item 7)

**Draft published (Oct 2026).** A top-down plot, input list and bring/provide
split are live on `/press` (`StagePlot.astro`), built from the gear the client
named: 2 × Pioneer DJ PLX-CRSS12 (battle style, tone arm left), QSC K12.2, a DJ
table with facade; laptop upstage left, monitor upstage right, per her direction. The DJM-S11
is inferred from the AlphaTheta session and should be confirmed. Also to confirm
before the draft tag comes off: table height, power requirement, whether she or
the venue supplies the K12.2s, the monitor, and the mic channel on hosting
bookings. A PDF export should follow once her team signs it off.

For `/press`. Send as a document and we will publish it as HTML with a PDF
alongside, so a production manager can read it on a phone.

### 9. Bios (brief section 11, item 8)

Drafts at 50, 150 and 400 words are already written on `/press` from the
credentials in the brief. **They need her approval and reconciliation against
the three press articles.** Frankpella to confirm.

### 10. One-sheet PDF

Generated from `/press` once photography and confirmed numbers land. The old
Squarespace PDF path `/s/deejay-t-jr-EPK-122.pdf` already 301s to `/press`.

---

## Needed, not strictly blocking

### 11. Audience numbers — the media kit is built, the numbers are not

There is now a **media kit at `/media-kit`** and a tracking system behind it.
This is the highest-value outstanding item: she is pitching for international
bookings, and a promoter in Paris or São Paulo decides from that page alone.

**How it works.** Numbers live in dated snapshots — one JSON file per capture
date in `src/content/audience/`. The newest drives every figure on the site, and
**growth is calculated between snapshots rather than typed anywhere**, so a
percentage can never contradict the follower count it came from. Adding a file
updates the media kit, the brand page, the international page and the
credentials strip on every page, together.

To update her numbers, add one file:

```jsonc
// src/content/audience/2026-09.json
{
  "date": "2026-09-01",
  "source": "Platform analytics screenshots",
  "platforms": [
    { "key": "tiktok",    "followers": 18400 },
    { "key": "instagram", "followers": 6200 },
    { "key": "youtube",   "followers": 2100, "unit": "subscribers" }
  ],
  "demographics": { "malePct": 92, "femalePct": 8, "coreAge": "35 to 54" },
  "countries": [
    { "name": "United States", "sharePct": 34, "cities": ["Houston", "Dallas"] }
  ]
}
```

**What is still needed.** Only one snapshot exists — the June 2026 baseline from
the brief, which has an aggregate total but **no per-platform split**, so all
seven platforms currently render as "Figure pending". A number that was not
supplied is never estimated: a brand team checks these against her live
profiles, and an invented figure is worse than a gap.

Tracked platforms are Instagram, TikTok, YouTube and Twitch. Send, per
platform: current follower or subscriber count. Plus, if her analytics
expose them: audience share by country, and top cities per country. The country
list is the load-bearing part for international booking — a promoter is not
buying a follower count, they are buying whether anyone in their city knows her.

**The June 2026 baseline is already stale** (it is now past that by months). The
code flags anything older than 120 days internally, and every figure on the site
carries the date it was captured, so nothing silently pretends to be current.

**Updating is now one command**, not hand-edited JSON:

```bash
npm run audience -- --tiktok 18400 --instagram 6200 --male 92 --age "35 to 54"
npm run audience -- --youtube-auto     # automatic, needs YOUTUBE_API_KEY
```

Snapshots may be partial. Record whichever platforms you have today; the rest
keep their own figure and their own date.

**On "without logging in".** Only YouTube can genuinely refresh itself: its Data
API returns public channel statistics for a plain API key from
console.cloud.google.com — no OAuth, no login, nothing that expires. Set
`YOUTUBE_API_KEY` and it is automatic from then on.

The other six cannot be automated. Instagram, Facebook and TikTok all require a
Business/Creator account, OAuth, and a token that expires roughly every 60 days,
which means someone re-authorising six times a year and the page going quietly
stale when they forget. X's API is paid. SoundCloud closed API registration
years ago. Bandcamp has none. Scraping the public pages was tested and does not
work — they render their numbers with JavaScript, so an HTML fetch returns
nothing, and anything that did work would break silently.

**But the human step still needs no login.** Follower counts are publicly
visible on her profiles in a browser: open six tabs, read six numbers, run one
command. That is the realistic answer, and it is roughly a two-minute job a
month.

If full automation is worth paying for, the route is a creator-data aggregator
(Social Blade, Modash, Phyllo and Apify all cover Instagram and TikTok via one
API key). That is a subscription and a third-party dependency, so it is a
business call rather than a technical one — say the word and it is a small
change to the refresh script.

### 12. Press article links

`src/content/press/` has the two DMC results with `url: null`, so they render
without a link. Send the URLs. Also send the three press articles referenced in
brief section 6 so `/about` can host them in full — those sections currently
carry summaries with a note that the source article is pending.

### 13. Open Graph images

`public/og/default.png` (1200×630) does not exist yet. Per brief section 9, but
with the corrected palette: **teal-ink background, sand signature**, plus a
page-specific photo. One per page ideally, one shared image at minimum. These
can be generated from the logo assets once the photography lands.

---

## Claims needing a source

Every result on the site is now rendered from `AWARDS` in `src/data/site.ts`,
and any entry carrying a `source` renders as a clickable link on `/press`,
`/about` and `/media-kit`. A promoter can confirm the claim rather than trust it.

**Sourced and verified — 5 of 7 results:**

| Claim | Source |
|---|---|
| 2024, 2023 and 2022 DMC Canada DJ Champion | DMC World's 2025 branch announcement, which describes her as a "3X DMC Canadian National Champion" |
| 9th, 2023 Technics DMC World Finals | DMC World's own results and judges' scores page |
| DMC Canada Branch Manager, 2025 | DMC World's branch announcement |
| Competed at the 2019 Goldie Awards | goldieawards.com/2019 |

**Still unsourced — find the page that proves each, or we soften the wording:**

- 2023 IDA World Technical Category Finalist
- 2018 Red Bull 3Style Canada, 3rd place
- **2021 DMC Canada DJ Finalist** — added Oct 2026, client-supplied
- **2017 DMC Canada DJ Scratch Finalist** — added Oct 2026, client-supplied
- **2016 DMC Canada DJ Scratch Finalist** — added Oct 2026, client-supplied
- **2016 IDA Canada DJ Scratch Finalist** — added Oct 2026, client-supplied

  These four came from the client rather than from a results page, and they are
  the oldest claims on the site — DMC and IDA archives from 2016–2021 are the
  hardest to find. They render without a source link, which is honest but leaves
  four of the twelve results unverifiable by a promoter. Worth asking DMC Canada
  directly: she is a branch manager, so the archive is a question to a colleague
  rather than a research project.
- **NAMM 2024.** The session URL supplied returns a 404, so it cannot be linked.
  The claim is still on the brand page from the brief. A working link, or a
  photograph with a date, would fix it.

**One claim was changed.** The site said "2019 Goldie Awards Finalist" in four
places. The Goldie Awards page lists her as a battle contestant and does not
confirm a finalist placing — and since that page is now linked publicly,
"finalist" beside a source saying "contestant" invites exactly the scrutiny the
proof strategy exists to survive. It now reads "competed at the Goldie Awards"
everywhere. **This does not weaken the headline claim** — "the only woman to
have competed at all four majors" is about competing, not placing. If you can
source the finalist placing, it goes straight back.

## Entity records — verified, with fixes needed upstream

The site now emits three authority records in `sameAs` and two as schema.org
identifiers, and lists all three on `/press`:

| Record | Value |
|---|---|
| Wikidata | `Q124713741` |
| ISNI | `0000 0005 1421 2597` |
| MusicBrainz | `792331fe-6e0b-48cc-911f-a986c03e4883` |

**The cross-check passed.** The ISNI supplied by the client and the ISNI stored
on the Wikidata item are identical, and every social handle on the Wikidata item
(Instagram, TikTok, YouTube, X, Facebook) matches the site's `sameAs` list
exactly. Two independent records describe the same person, which is precisely
what section 9's entity work is trying to establish.

MusicBrainz already exists, so the brief's assumption that it needed creating is
out of date.

### 15. Latest page (`/latest`, Oct 2026) — to confirm

- **DMC Canada 2026 champion's name.** No public result yet, so the page and
  alt text say "the 2026 champion". Send the name (and DMC's results link)
  and it goes in.
- **Photographer for `IMG_3949 [TOP PICK]`** (her hosting portrait). The other
  four are credited to Raisedwithfilm from their filenames.
- **Photographer for the PLAYLIST Retreat photos.**
- **CDJ option on the rider:** CDJ-3000 with CDJ-2000NXS2 accepted, and
  DJM-S11 / DJM-A9 / DJM-900NXS2 mixers are a standard spec, not her stated
  preference. Confirm or correct the models.

### 16. Site editor (`/keystatic`) — one-time set-up to make it work on the live site

The editor is built and tested locally: edit, Save, and the page updates. On the
live site it saves by committing to the GitHub repo (Vercel then redeploys in
about a minute), which needs a GitHub App connecting the two. Once:

1. In `deejaytjr-site/.env.local` add `PUBLIC_KEYSTATIC_STORAGE=github`, run
   `npm run dev`, open http://localhost:4321/keystatic and click **Create GitHub
   App**. Sign in to GitHub as the repo owner. Keystatic creates the app and
   writes four values into `.env`: `KEYSTATIC_GITHUB_CLIENT_ID`,
   `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`,
   `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`. Then remove the `PUBLIC_KEYSTATIC_STORAGE`
   line again.
2. Add those four to Vercel → Settings → Environment Variables (Production).
3. In the new GitHub App's settings, add the callback URL
   `https://www.deejaytjr.com/api/keystatic/github/oauth/callback` and make sure
   the app is installed on `robertvanliew/deejaytjr`.
4. Give her a GitHub account and add it as a collaborator on the repo
   (repo → Settings → Collaborators). Only collaborators can save.
5. Push and redeploy. She signs in at https://www.deejaytjr.com/keystatic.

Editable today: awards and results, timeline, positions held, press, videos,
past events, testimonials, audience numbers. Page body copy (headlines,
paragraphs) is still in the page files — move sections into the editor on
request.

### 17. International visibility build — Phase 1 (Oct 2026)

**Live (English):** `/international/usa/houston`, `/dallas`, `/austin`,
`/new-york`, `/international/brazil`, `/international/france`,
`/destination-events`, the `#offsites` section on `/corporate-events`, and
`/go` (noindex link-in-bio: use `deejaytjr.com/go?s=tiktok`, `?s=instagram`).
All facts are in `src/data/markets.json`.

**Built as drafts, NOT published:** `/pt-br/internacional/brasil`,
`/pt-br/internacional/brasil/sao-paulo`, `/fr/international/france`,
`/fr/international/france/paris`. Machine-drafted, so they are noindex, out of
the sitemap and hreflang, linked from nowhere, and carry a reviewer banner.
**To publish one:** a native speaker reviews the page at its URL, corrects the
text in `markets.json` (and shared strings in `src/i18n/ui.ts`), then set that
page's `"reviewed": true`. Hreflang, sitemap alternates and the EN/PT/FR
switcher switch on automatically.

**Leads now carry:** market, page language, other cities on the trip,
event-location/based-in, and the first-touch campaign (30-day cookie,
disclosed in the privacy policy). Subject line: `[Booking] <market> · <type> · <date>`.
If Airtable is used as the market sheet, add these columns: Market, Locale,
Other cities, Based in, First touch source, First touch campaign, First touch landing.

**Budget floors:** CAD from $3,000; USD from $5,000. "Under $2,500" is gone.
Confirm these with Linda's rate card.

**Open questions from the spec, still open:**
- Albuquerque (TikTok) has no page; confirm before Phase 2.
- Rio de Janeiro (June data) vs Brasília (spec's September export): send the
  September export so the Brazil city list matches it.
- The spec's TikTok figure (24.4K, +827%) and 92% men 35–54 are the June
  snapshot; the site uses the newer September count (36.8K). Send her
  September analytics to refresh demographics.

**Still needed from her (spec):** past dates outside Canada; promoter or venue
contacts per city; a native pt-BR and a native fr reviewer; two client quotes
with permission; currency preference per market.

**Note on FAQ schema:** FAQPage is emitted on every market page, but since
Aug 2023 Google shows FAQ rich results only for government and health sites.
It is there for AI answers, which do cite it — not for a Google rich result.

### 14. Bot protection keys (Cloudflare Turnstile)

Both forms already carry a honeypot and a timing trap. Turnstile is wired in
and dormant until two keys exist. Create a free widget at dash.cloudflare.com
→ Turnstile with hostnames `deejaytjr.com` and `localhost`, then set
`PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` in Vercel. It is
invisible to ordinary visitors and shows a checkbox only to one that looks
automated.

### The Wikidata item is in good shape

Checked against the rendered item in September 2026. Identifiers present and
correct, each in its proper field:

ISNI · Apple Music (`1734354584`) · Spotify (`1y5sAktWX9goimMIlwDHkk`) ·
MusicBrainz · Shazam · Bandcamp · Mixcloud · SoundCloud · Instagram · TikTok ·
Threads · Twitch (with numeric channel ID) · X · Facebook · YouTube channel ID
and handle.

Every one of these matches the site's `sameAs` list. The YouTube statistics on
the item are qualified with a point in time, which is the correct way to record
a figure that moves.

**A correction to an earlier version of this file.** It previously claimed the
Spotify field held an Apple Music ID, and that Twitch and Mixcloud were missing.
All three claims were wrong. They came from reading the item through an
automated JSON fetch that mislabelled the property IDs — it reported P2850 as
"Spotify artist ID" when P2850 is Apple Music, and called Twitch's P5797 a
TikTok field. The property numbers were never checked against Wikidata's own
schema. Treat any future automated read of structured data the same way: confirm
the property IDs, not the labels a summariser puts on them.

### Still worth adding to Wikidata

Lower confidence than the above, because it rests on the same automated read —
**confirm before acting.** The item's property list did not appear to include
P166 (award received), and the property IDs themselves were read straight from
the JSON keys, so that part is more reliable than the labels were.

If awards really are absent, they are the biggest opportunity on the record. All
of these can now be cited to primary sources already linked on `/press`:

- Three DMC Canada national titles, 2022 to 2024
- 9th place, 2023 Technics DMC World Finals
- Competitor, 2024 Technics DMC World Finals, Paris
- 3rd place, Red Bull 3Style Canada 2018
- DMC Canada Branch Manager, 2025

The site can only assert these. Wikidata is what the language models actually
read, so a sourced award statement there does more for the brief's fourth
success metric than anything left to do on the site.

### Profile handles — checked

Every handle below was verified in September 2026 against her live profiles, the
Wikidata item, and each platform's own API where one exists. All fifteen feed
the Person node's `sameAs`.

| Platform | Handle or ID | How it was checked |
|---|---|---|
| Instagram | `deejaytjr` | live profile, matches Wikidata |
| TikTok | `deejaytjr` | live profile, matches Wikidata |
| YouTube | `deejaytjr` | live profile, matches Wikidata |
| Twitch | `deejaytjr` | live profile (verified badge) |
| X | `deejaytjr` | matches Wikidata |
| Facebook | `deejaytjrofficial` | matches Wikidata |
| Spotify | `1y5sAktWX9goimMIlwDHkk` | Spotify oEmbed returns "DEEJAY T-JR." |
| Apple Music | `1734354584` | page resolves to DEEJAY T-JR. |
| SoundCloud | `deejaytjr` | supplied |
| Mixcloud | `deejaytjr` | Mixcloud API confirms the account |
| Bandcamp | `deejaytjr.bandcamp.com` | supplied |
| **Patreon** | `deejaytjr` | **UNVERIFIED** |

**One item to confirm:** the Patreon page renders entirely in JavaScript, so it
could not be read to confirm the account exists or belongs to her. It is in
`sameAs` on your say-so. A `sameAs` pointing at a page that does not exist
weakens entity resolution rather than helping it, so please confirm the URL — or
say the word and it comes out. It is one line in
`SUPPORT_PLATFORMS` in `src/data/site.ts`.

## Not assets, but blocking

- **Photo credits and clearance** — see section 1. This is the one genuinely
  legal item outstanding on the imagery.
- **Any new photography should be warm or neutral in tone.** The palette is a
  warm near-black with a tan accent; cool blue-toned images fight it. Worth
  saying to the photographer before the next shoot.
- **Legal review** of `/privacy` and `/terms`. Both describe accurately what the
  site does, but neither has been reviewed by a lawyer. PIPEDA at minimum; GDPR
  if EU or UK traffic is material.
- **Environment variables** for the booking form — see `.env.example`. Without
  them the endpoint validates and logs but sends nothing.
- **Domain DNS** moved off Squarespace.
