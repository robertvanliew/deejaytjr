/**
 * Photo registry.
 *
 * Sources are the client's own files from `Deejay T-JR Photos/`, cropped and
 * downsized into src/assets/photos. Importing them here (rather than putting
 * them in /public) puts them through Astro's image pipeline: responsive
 * srcset, WebP/AVIF, and explicit width/height on every tag, which is what
 * holds CLS at zero.
 *
 * Alt text is descriptive rather than decorative because these images ARE the
 * argument on this site — a planner using a screen reader should still learn
 * that she works a real stage in front of a real crowd.
 */

import type { ImageMetadata } from 'astro';
import heroDecks from '../assets/photos/hero-decks.jpg';
import stageCrowd from '../assets/photos/stage-crowd.jpg';
import stageWide from '../assets/photos/stage-wide.jpg';
import dmc2024Booth from '../assets/photos/dmc-2024-booth.jpg';
import dmc2024Hands from '../assets/photos/dmc-2024-hands.jpg';
import performanceWide from '../assets/photos/performance-wide.jpg';
import clubSet from '../assets/photos/club-set.jpg';
import eventRoom from '../assets/photos/event-room.jpg';
import bastidsBbq from '../assets/photos/bastids-bbq.jpg';
import goldie2019 from '../assets/photos/goldie-2019.jpg';
import earlySet from '../assets/photos/early-set.jpg';
import portraitDecks from '../assets/photos/portrait-decks.jpg';
import portraitBooth from '../assets/photos/portrait-booth.jpg';
import portraitClose from '../assets/photos/portrait-close.jpg';
import portraitStudio from '../assets/photos/portrait-studio.jpg';
import portraitSide from '../assets/photos/portrait-side.jpg';
import portraitTurntable from '../assets/photos/portrait-turntable.jpg';
import portraitVertical from '../assets/photos/portrait-vertical.jpg';
import proof2024 from '../assets/photos/proof-2024.jpg';
import proof2023 from '../assets/photos/proof-2023.jpg';
import proof2022 from '../assets/photos/proof-2022.jpg';
import raptors905Purple from '../assets/photos/raptors905-purple.jpg';
import raptors905Black from '../assets/photos/raptors905-black.jpg';
import raptors905Booth from '../assets/photos/raptors905-booth.jpg';
import raptors905Jumbotron from '../assets/photos/raptors905-jumbotron.jpg';
import dmcCanada2026Host from '../assets/photos/dmc-canada-2026-host.jpg';
import dmcCanada2026Mic from '../assets/photos/dmc-canada-2026-mic.jpg';
import dmcCanada2026Champion from '../assets/photos/dmc-canada-2026-champion.jpg';
import dmcCanada2026Prize from '../assets/photos/dmc-canada-2026-prize.jpg';
import dmcCanada2026Group from '../assets/photos/dmc-canada-2026-group.jpg';
import dmcWorld2025HostFlyer from '../assets/photos/dmc-world-2025-host-flyer.jpg';
import dmcWorld2025LineupFlyer from '../assets/photos/dmc-world-2025-lineup-flyer.jpg';
import playlistPoint from '../assets/photos/playlist-retreat-point.jpg';
import playlistWall from '../assets/photos/playlist-retreat-wall.jpg';
import playlistSign from '../assets/photos/playlist-retreat-sign.jpg';
import dmcWorld2024Jacket from '../assets/photos/dmc-world-2024-jacket.jpg';

export type PhotoKey = keyof typeof PHOTOS;

export interface PhotoEntry {
  src: ImageMetadata;
  alt: string;
  /**
   * Photographer, shown wherever the image is shown at size. DMC photography
   * is Jeff Straw; Bastid's BBQ is Joanna Foz-Dait (client-confirmed, Oct
   * 2026). Entries without one are from events whose photographer has not been
   * named yet — see ASSETS-NEEDED.md.
   */
  credit?: string;
}

/** Credit for a photo, if its photographer is known. */
export const creditFor = (k: PhotoKey): string | undefined => (PHOTOS[k] as PhotoEntry).credit;

export const PHOTOS = {
  'hero-decks': {
    src: heroDecks,
    alt: 'DEEJAY T-JR. at the turntables in profile during a DMC championship set, a crowd of competitors and judges behind her.',
    credit: 'Jeff Straw',
  },
  'stage-crowd': {
    src: stageCrowd,
    alt: 'DEEJAY T-JR. performing on a lit stage with the audience visible in front of the booth.',
    credit: 'Jeff Straw',
  },
  'stage-wide': {
    src: stageWide,
    alt: 'Wide view of DEEJAY T-JR. behind a DMC-branded booth mid-routine.',
    credit: 'Jeff Straw',
  },
  'dmc-2024-booth': {
    src: dmc2024Booth,
    alt: 'DEEJAY T-JR. at the decks during the 2024 DMC Canada final, a camera operator filming from the right.',
    credit: 'Jeff Straw',
  },
  'dmc-2024-hands': {
    src: dmc2024Hands,
    alt: "Close view of DEEJAY T-JR.'s hands working the crossfader during a championship routine.",
    credit: 'Jeff Straw',
  },
  'performance-wide': {
    src: performanceWide,
    alt: 'DEEJAY T-JR. performing for a full room.',
    credit: 'Joanna Foz-Dait',
  },
  'club-set': {
    src: clubSet,
    alt: 'DEEJAY T-JR. playing a club set under stage lighting.',
    credit: 'Jeff Straw',
  },
  'event-room': {
    src: eventRoom,
    alt: 'DEEJAY T-JR. playing to a seated event room.',
    credit: 'Jeff Straw',
  },
  'bastids-bbq': {
    src: bastidsBbq,
    alt: "DEEJAY T-JR. behind the turntables at Bastid's BBQ in Toronto.",
    credit: 'Joanna Foz-Dait',
  },
  'goldie-2019': {
    src: goldie2019,
    alt: 'DEEJAY T-JR. competing at the 2019 Goldie Awards.',
  },
  'early-set': {
    src: earlySet,
    alt: 'DEEJAY T-JR. performing early in her competitive career.',
  },
  'portrait-decks': {
    src: portraitDecks,
    alt: 'Portrait of DEEJAY T-JR. at the turntables, looking down at the record.',
    credit: 'Joanna Foz-Dait',
  },
  'portrait-booth': {
    src: portraitBooth,
    alt: 'Portrait of DEEJAY T-JR. in the DJ booth mid-set.',
    credit: 'Joanna Foz-Dait',
  },
  'portrait-close': {
    src: portraitClose,
    alt: 'Close portrait of DEEJAY T-JR. performing.',
    credit: 'Joanna Foz-Dait',
  },
  'portrait-studio': {
    src: portraitStudio,
    alt: 'Portrait of DEEJAY T-JR. with her equipment.',
    credit: 'Joanna Foz-Dait',
  },
  'portrait-side': {
    src: portraitSide,
    alt: 'Side portrait of DEEJAY T-JR. at the decks.',
    credit: 'Joanna Foz-Dait',
  },
  'portrait-turntable': {
    src: portraitTurntable,
    alt: 'DEEJAY T-JR. cueing a record on the turntable.',
    credit: 'Joanna Foz-Dait',
  },
  'portrait-vertical': {
    src: portraitVertical,
    alt: 'Vertical portrait of DEEJAY T-JR. performing.',
  },
  'proof-2024': {
    src: proof2024,
    alt: 'Official 2024 DMC Canada DJ Championships results: 1st place, DEEJAY T-JR., Toronto, Ontario.',
  },
  'proof-2023': {
    src: proof2023,
    alt: 'Official 2023 DMC Canada DJ Championships results showing DEEJAY T-JR. in first place.',
  },
  'proof-2022': {
    src: proof2022,
    alt: 'Official 2022 DMC Canada DJ Championships results showing DEEJAY T-JR. in first place.',
  },
  /* Raptors 905 Women's Celebration Game, Paramount Fine Foods Centre,
     Mississauga. Raptors 905 is the Toronto Raptors' G League affiliate —
     captions say "Raptors 905", never "the Raptors' arena": the claim a
     sponsor can check is the one that has to be exact. Photographs: DJ Andre905
     (client-confirmed, Oct 2026). */
  'raptors905-purple': {
    src: raptors905Purple,
    alt: 'DEEJAY T-JR. on the decks courtside in a Raptors 905 jersey, wearing a headset, empty arena seats behind her.',
    credit: 'DJ Andre905',
  },
  'raptors905-black': {
    src: raptors905Black,
    alt: 'DEEJAY T-JR. smiling at her laptop behind the Raptors 905 DJ booth before tip-off.',
    credit: 'DJ Andre905',
  },
  'raptors905-booth': {
    src: raptors905Booth,
    alt: 'DEEJAY T-JR. behind the Raptors 905 branded DJ booth on the arena floor at Paramount Fine Foods Centre.',
    credit: 'DJ Andre905',
  },
  'raptors905-jumbotron': {
    src: raptors905Jumbotron,
    alt: "The arena scoreboard reading: Raptors 905 Women's Celebration Game, featuring guest DJ DEEJAY T-JR.",
    credit: 'DJ Andre905',
  },
  /* 2026 DMC Canadian DJ Championships, The Rec Room Roundhouse, Toronto,
     6 September 2026 — the national final she ran as DMC Canada branch
     manager. The "by Raisedwithfilm" files are credited from their filenames;
     the hosting portrait came without a name and stays uncredited until
     confirmed. The champion is not named anywhere: no public source yet. */
  'dmc-canada-2026-host': {
    src: dmcCanada2026Host,
    alt: 'DEEJAY T-JR. on the microphone, hosting the 2026 DMC Canadian DJ Championships.',
  },
  'dmc-canada-2026-mic': {
    src: dmcCanada2026Mic,
    alt: 'DEEJAY T-JR. reading from her phone into the microphone between rounds of the 2026 DMC Canadian DJ Championships.',
    credit: 'Raisedwithfilm',
  },
  'dmc-canada-2026-champion': {
    src: dmcCanada2026Champion,
    alt: 'DEEJAY T-JR. on stage with the 2026 DMC Canadian champion, who holds up the winner’s plaque, in front of the DMC Canada table.',
    credit: 'Raisedwithfilm',
  },
  'dmc-canada-2026-prize': {
    src: dmcCanada2026Prize,
    alt: 'DEEJAY T-JR. presenting a Pioneer DJ PLX-CRSS12 turntable as a prize at the 2026 DMC Canadian DJ Championships.',
    credit: 'Raisedwithfilm',
  },
  'dmc-canada-2026-group': {
    src: dmcCanada2026Group,
    alt: 'DEEJAY T-JR. with the judges, competitors and the 2026 champion in front of the Pioneer DJ and AlphaTheta sponsor wall.',
    credit: 'Raisedwithfilm',
  },
  /* Official DMC World flyers, 40th edition, Tokyo, October 2025. */
  'dmc-world-2025-host-flyer': {
    src: dmcWorld2025HostFlyer,
    alt: '“I’m a host”: official Technics DMC World DJ Championship flyer for DEEJAY T-JR., Saturday 11 October at O-EAST and Sunday 12 October at Harlem, Tokyo.',
  },
  'dmc-world-2025-lineup-flyer': {
    src: dmcWorld2025LineupFlyer,
    alt: 'Official DMC World Championships 2025 line-up flyer, listing DEEJAY T-JR. as a host alongside Craze, DJ Babu and Darthreider.',
  },
  /* DJ Jazzy Jeff’s PLAYLIST Retreat, 2026. Photographer TBC. */
  'playlist-retreat-point': {
    src: playlistPoint,
    alt: 'DEEJAY T-JR. holding the PLAYLIST sign in front of a graffiti wall at DJ Jazzy Jeff’s PLAYLIST Retreat.',
  },
  'playlist-retreat-wall': {
    src: playlistWall,
    alt: 'DEEJAY T-JR. with the PLAYLIST sign in front of the retreat’s graffiti mural.',
  },
  'playlist-retreat-sign': {
    src: playlistSign,
    alt: 'DEEJAY T-JR. smiling with the PLAYLIST sign at DJ Jazzy Jeff’s PLAYLIST Retreat.',
  },
  'dmc-world-2024-jacket': {
    src: dmcWorld2024Jacket,
    alt: 'DEEJAY T-JR. from behind in her DMC World Finals Paris jacket at the 2024 world final.',
    credit: 'Jeff Straw',
  },
} as const;

/** The band that runs under the hero. Ordered for visual rhythm, not by date. */
export const MARQUEE: PhotoKey[] = [
  'dmc-2024-booth',
  'raptors905-purple',
  'portrait-decks',
  'stage-crowd',
  'raptors905-booth',
  'club-set',
  'portrait-close',
  'performance-wide',
  'bastids-bbq',
  'portrait-turntable',
  'stage-wide',
  'raptors905-black',
  'event-room',
];
