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

export type PhotoKey = keyof typeof PHOTOS;

export const PHOTOS = {
  'hero-decks': {
    src: heroDecks,
    alt: 'DEEJAY T-JR. at the turntables in profile during a DMC championship set, a crowd of competitors and judges behind her.',
  },
  'stage-crowd': {
    src: stageCrowd,
    alt: 'DEEJAY T-JR. performing on a lit stage with the audience visible in front of the booth.',
  },
  'stage-wide': {
    src: stageWide,
    alt: 'Wide view of DEEJAY T-JR. behind a DMC-branded booth mid-routine.',
  },
  'dmc-2024-booth': {
    src: dmc2024Booth,
    alt: 'DEEJAY T-JR. at the decks during the 2024 DMC Canada final, a camera operator filming from the right.',
  },
  'dmc-2024-hands': {
    src: dmc2024Hands,
    alt: "Close view of DEEJAY T-JR.'s hands working the crossfader during a championship routine.",
  },
  'performance-wide': {
    src: performanceWide,
    alt: 'DEEJAY T-JR. performing for a full room.',
  },
  'club-set': {
    src: clubSet,
    alt: 'DEEJAY T-JR. playing a club set under stage lighting.',
  },
  'event-room': {
    src: eventRoom,
    alt: 'DEEJAY T-JR. playing to a seated event room.',
  },
  'bastids-bbq': {
    src: bastidsBbq,
    alt: "DEEJAY T-JR. behind the turntables at Bastid's BBQ in Toronto.",
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
  },
  'portrait-booth': {
    src: portraitBooth,
    alt: 'Portrait of DEEJAY T-JR. in the DJ booth mid-set.',
  },
  'portrait-close': {
    src: portraitClose,
    alt: 'Close portrait of DEEJAY T-JR. performing.',
  },
  'portrait-studio': {
    src: portraitStudio,
    alt: 'Portrait of DEEJAY T-JR. with her equipment.',
  },
  'portrait-side': {
    src: portraitSide,
    alt: 'Side portrait of DEEJAY T-JR. at the decks.',
  },
  'portrait-turntable': {
    src: portraitTurntable,
    alt: 'DEEJAY T-JR. cueing a record on the turntable.',
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
} as const;

/** The band that runs under the hero. Ordered for visual rhythm, not by date. */
export const MARQUEE: PhotoKey[] = [
  'dmc-2024-booth',
  'portrait-decks',
  'stage-crowd',
  'club-set',
  'portrait-close',
  'performance-wide',
  'bastids-bbq',
  'portrait-turntable',
  'stage-wide',
  'event-room',
];
