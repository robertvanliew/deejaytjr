/**
 * FAQ sets. Each set is rendered by Faq.astro and emitted as FAQPage JSON-LD
 * by the same page, so the two can never drift.
 *
 * Answers are written for the buyer named in section 2 of the brief. Anything
 * involving rates says "on request" until the client confirms ranges
 * (section 11, item 6).
 */

export interface FaqItem {
  q: string;
  a: string;
}

export const HOME_FAQ: FaqItem[] = [
  {
    q: 'What does it cost to book her?',
    a: '<p>Fees depend on the date, the city, the set length and what the night needs — a two-hour reception is a different quote from a full evening with a scratch showcase and hosting. Send the date and the room through the form and you will have a quote within one business day.</p>',
  },
  {
    q: 'Does she travel outside Toronto?',
    a: '<p>Constantly. She is based in Toronto and flies from Pearson. She has performed across Canada and internationally, and her audience is largest in the United States, Brazil, France, the United Kingdom and South Africa. For dates outside the Greater Toronto Area, budget travel and accommodation alongside the fee.</p>',
  },
  {
    q: 'Is a championship DJ the right fit for a corporate event?',
    a: '<p>That is the usual worry and it is the wrong way round. The championship is the reason she can read a room — six minutes of judged, note-perfect performance is a harder brief than a ballroom. For corporate dates she works to a run of show, keeps the volume conversational through dinner and speeches, and lifts the room on cue. The turntablism is a feature you can dial up or leave out entirely.</p>',
  },
  {
    q: 'Can she host or MC as well as DJ?',
    a: '<p>Yes. DJ plus host is one of the standard formats, and it removes a vendor from your budget and your run of show. Say so in your enquiry and it will be in the quote.</p>',
  },
  {
    q: 'What does she need from the venue?',
    a: '<p>Her technical rider and stage plot are on the <a href="/press">press page</a>, with no form to fill in. She travels with her own controller and needs sound, power and a table at the right height. Most venues need nothing beyond what they already have.</p>',
  },
  {
    q: 'How far ahead should we book?',
    a: '<p>Corporate season — October through December — fills months out, and so do summer wedding Saturdays. If your date is inside eight weeks it is still worth asking; send it through and you will get a straight yes or no on availability.</p>',
  },
];

export const CORPORATE_FAQ: FaqItem[] = [
  {
    q: 'Will she work to our run of show?',
    a: '<p>Yes, and she will ask for it. Before the date we run a planning call with your team to map timings: doors, dinner, speeches, awards, the transition to the party and the hard out. She holds those cues live.</p>',
  },
  {
    q: 'Can she keep the volume down during dinner and speeches?',
    a: '<p>Yes. Background level through arrival and dinner, nothing over the speeches, and the room lifted after. This is the part most planners are actually worried about, and it is the part she is most practised at.</p>',
  },
  {
    q: 'Do you carry insurance and can you provide a certificate?',
    a: '<p>Yes. Send the certificate holder details and any wording your venue requires with your enquiry and it will come back with the agreement.</p>',
  },
  {
    q: 'What music does she play for a corporate audience?',
    a: '<p>Open format, tuned to your crowd — a room of engineers is not a room of sales directors. You can send a must-play list, a do-not-play list, or neither. If your event has a theme or a brand moment, she builds around it.</p>',
  },
  {
    q: 'Can we add a scratch showcase to the night?',
    a: '<p>Yes, and for awards nights and product launches it is the moment people film. It runs three to six minutes as a featured performance, usually placed just before or just after the main programme.</p>',
  },
];

export const PRIVATE_FAQ: FaqItem[] = [
  {
    q: 'Do you do weddings?',
    a: '<p>Yes, including ceremony, cocktail hour and reception as one booking. She will work through your music taste in advance — the first dance, the must-plays, and the list of songs you never want to hear.</p>',
  },
  {
    q: 'Will our event be posted on social media?',
    a: '<p>Only if you want it to be. Discretion is the default for private events: nothing is filmed or posted without your say-so, and that is written into the agreement.</p>',
  },
  {
    q: 'Can she take requests from guests on the night?',
    a: '<p>Yes, within whatever boundaries you set. Some hosts want an open floor, others want the request list agreed in advance. Tell us which and she will hold the line for you.</p>',
  },
  {
    q: 'What size of event does she play?',
    a: '<p>From forty guests in a private room to eight hundred in a ballroom. The set changes, the preparation does not.</p>',
  },
  {
    q: 'How long is a typical set?',
    a: '<p>Most private events run three to five hours including cocktail hour. Longer nights are possible; say what you need and it will be in the quote.</p>',
  },
];

export const CLUB_FAQ: FaqItem[] = [
  {
    q: 'What is her draw?',
    a: '<p>Her audience is largest in the United States, Brazil, France, the United Kingdom and South Africa. Current per-platform and per-country numbers, with the date they were captured, are in the <a href="/media-kit">media kit</a> — taken from her own analytics rather than estimated.</p>',
  },
  {
    q: 'What does she play in a club?',
    a: '<p>Open format with live turntablism — hip hop, R&amp;B, house and Latin depending on the room, cut with the routines that won three national titles. It is a set that works as a headline slot and gives your photographers something to shoot.</p>',
  },
  {
    q: 'Do you supply promotional assets?',
    a: '<p>Yes. Hi-res photos, logo pack, three bio lengths and video clips are on the <a href="/press">press page</a> with no gate. Take what you need.</p>',
  },
  {
    q: 'What are the technical requirements?',
    a: '<p>Standard club setup: two decks or a supported controller, a mixer with the channels free, and monitoring she can actually hear. The full rider is on the press page.</p>',
  },
  {
    q: 'Do you handle international dates and visas?',
    a: '<p>Yes. She has performed internationally and we handle work authorisation and travel logistics. Build the lead time in — some markets need six to eight weeks.</p>',
  },
];

export const BRAND_FAQ: FaqItem[] = [
  {
    q: 'What kinds of partnership does she take?',
    a: '<p>Gear and audio, spirits, sneakers and apparel, automotive and sport. Formats include trade show demos, campaign shoots, ambassador terms, event activations and content series. She has performed at NAMM and in Pioneer DJ showcases.</p>',
  },
  {
    q: 'Who is her audience?',
    a: '<p>Skewed male, 35 to 54, and substantially outside Canada — the United States, Brazil, France, the United Kingdom and South Africa lead. That is a DJ-gear and culture audience, not a local-events audience, and it is the right fit for product and lifestyle brands rather than regional retail.</p>',
  },
  {
    q: 'Can you produce content as part of the deal?',
    a: '<p>Yes. Short-form performance content is what grew the account, and it can be produced against your product and your posting schedule as part of the agreement.</p>',
  },
  {
    q: 'Do you work through agencies?',
    a: '<p>Yes, routinely. Send the brief, the flight dates and the usage terms you need and we will come back with a rate and availability.</p>',
  },
  {
    q: 'Is there a media kit we can circulate internally?',
    a: '<p>Yes — the <a href="/media-kit">media kit</a> is a single page you can send on or save as a PDF: reach by platform and by country, demographics, performance video and her competitive record, each figure carrying the date it was captured. No form, no gate. Net rates on request.</p>',
  },
];

export const INTERNATIONAL_FAQ: FaqItem[] = [
  {
    q: 'Where does she travel from?',
    a: '<p>Toronto Pearson, which is a direct flight to most of North America, western Europe and a growing list of Latin American cities. For most dates that means she arrives the day before and leaves the day after.</p>',
  },
  {
    q: 'Who covers travel and accommodation?',
    a: '<p>The booker, on top of the performance fee. We quote the full landed cost so there are no surprises — flights, accommodation and ground transport itemised.</p>',
  },
  {
    q: 'Can you handle work permits and visas?',
    a: '<p>Yes, we handle authorisation for the territory. Lead time varies by country; six to eight weeks is a safe assumption and some markets are faster.</p>',
  },
  {
    q: 'What currency will we be quoted in?',
    a: '<p>Canadian dollars by default, or the local currency of the territory on request. Say which you need in your enquiry.</p>',
  },
  {
    q: 'Does she bring her own equipment internationally?',
    a: '<p>She travels with her controller and needs the venue to supply sound and monitoring. For long-haul dates a supported local backline is usually simpler, and the rider lists what works.</p>',
  },
];
