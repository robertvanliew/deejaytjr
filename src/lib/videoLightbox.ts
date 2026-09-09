/**
 * Media lightbox — video and photography.
 *
 * The side tiles in a feature grid are roughly 250px wide. A 16:9 YouTube
 * player at that size is not a video, it is a strip of player chrome — the
 * scrub bar, the captions button and the logo consume the frame and there is
 * almost nothing left to actually watch. A planner deciding whether to book her
 * cannot judge a room from that.
 *
 * So small tiles open into the viewport instead of playing in place, and the
 * visitor never leaves the page to do it. Large lead tiles are already big
 * enough to read, so they keep playing inline — the rule is "play where there
 * is room, pop out where there is not", not an arbitrary per-tile flag.
 *
 * The open is a FLIP morph: the thumbnail's own rectangle is measured, the
 * dialog is opened, and the player is transformed back onto the thumbnail and
 * released. The panel therefore grows out of the exact tile that was clicked,
 * which is what makes it read as one object expanding rather than an unrelated
 * modal appearing over the top.
 *
 * Built on <dialog>.showModal() so the focus trap, the Escape key, the inert
 * background and the top-layer stacking are the browser's job rather than ours.
 *
 * Photographs use the same panel and the same morph. They are not 16:9, so the
 * true aspect ratio travels with each one as `--arn` and drives both the stage
 * and the panel's width cap; a portrait shot gets a tall panel rather than
 * being letterboxed into a landscape frame.
 */

const MORPH = 460;
const EASE = 'cubic-bezier(.23, 1, .32, 1)';

interface Refs {
  dlg: HTMLDialogElement;
  stage: HTMLDivElement;
  thumb: HTMLImageElement;
  title: HTMLHeadingElement;
  meta: HTMLParagraphElement;
  link: HTMLAnchorElement;
  closeBtn: HTMLButtonElement;
}

let refs: Refs | null = null;
let opener: HTMLButtonElement | null = null;
let closing = false;

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function build(): Refs {
  const dlg = document.createElement('dialog');
  dlg.className = 'vbox';
  dlg.setAttribute('aria-labelledby', 'vbox-title');
  dlg.innerHTML = `
    <div class="vbox-panel">
      <div class="vbox-stage">
        <img class="vbox-thumb" alt="" aria-hidden="true">
      </div>
      <div class="vbox-cap">
        <div>
          <h2 class="vbox-title" id="vbox-title"></h2>
          <p class="vbox-meta small muted"></p>
        </div>
        <a class="vbox-link small" rel="noopener" target="_blank">Watch on YouTube &#8599;</a>
      </div>
    </div>
    <button class="vbox-close" type="button" aria-label="Close video">
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.6" fill="none"/>
      </svg>
    </button>`;
  document.body.appendChild(dlg);

  const r: Refs = {
    dlg,
    stage: dlg.querySelector('.vbox-stage')!,
    thumb: dlg.querySelector('.vbox-thumb')!,
    title: dlg.querySelector('.vbox-title')!,
    meta: dlg.querySelector('.vbox-meta')!,
    link: dlg.querySelector('.vbox-link')!,
    closeBtn: dlg.querySelector('.vbox-close')!,
  };

  r.closeBtn.addEventListener('click', () => close());

  /* Clicking the surround closes. The panel is a child, so anything that
     reaches the dialog itself is the area around it. */
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) close();
  });

  /* Escape: take it over so it plays the same morph as every other close
     rather than snapping shut. */
  dlg.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });

  return r;
}

/** Transform that maps `to` back onto `from`, for the start of a FLIP. */
function invert(from: DOMRect, to: DOMRect): string {
  if (!to.width || !to.height) return 'none';
  const sx = from.width / to.width;
  const sy = from.height / to.height;
  return `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${sx}, ${sy})`;
}

interface PanelOpts {
  title: string;
  meta?: string;
  /** Aspect ratio as a bare number. Drives the stage and the width cap. */
  ratio: number;
  /** Optional outward link shown in the caption. */
  href?: string;
  linkLabel?: string;
  /** Builds the thing being shown, appended into the stage. */
  fill: (stage: HTMLDivElement, r: Refs) => void;
}

function openPanel(btn: HTMLButtonElement, o: PanelOpts) {
  refs ??= build();
  const r = refs;
  opener = btn;
  closing = false;

  r.title.textContent = o.title;
  r.meta.textContent = o.meta ?? '';
  r.meta.hidden = !o.meta;
  r.dlg.style.setProperty('--arn', String(o.ratio || 1.7778));

  /* The photographs carry no captions — there are none in the registry, and
     inventing them is not on the table. So the caption row collapses and the
     height reserved for it is handed back to the image. */
  const hasCap = Boolean(o.title || o.meta || o.href);
  const cap = r.dlg.querySelector<HTMLElement>('.vbox-cap')!;
  cap.hidden = !hasCap;
  r.dlg.style.setProperty('--cap', hasCap ? '200px' : '96px');

  if (o.href) {
    r.link.href = o.href;
    r.link.innerHTML = o.linkLabel ?? 'Watch on YouTube &#8599;';
    r.link.hidden = false;
  } else {
    r.link.hidden = true;
  }

  r.stage.querySelectorAll('iframe, .vbox-full').forEach((n) => n.remove());
  o.fill(r.stage, r);

  /* A previous close left forwards-filled animations on these elements. Left
     in place they win over the opening ones and the panel reopens invisible. */
  [r.stage, cap, r.dlg].forEach((el) => el.getAnimations().forEach((an) => an.cancel()));

  const first = btn.getBoundingClientRect();
  document.documentElement.classList.add('vbox-open');
  r.dlg.showModal();

  /* showModal() focuses the first tabbable child, which is the player iframe.
     Focus inside a cross-origin frame belongs to YouTube, so Escape would be
     swallowed by their player and the dialog would refuse to close. Putting
     focus on the close button keeps the key ours and is the right first stop
     for a screen reader besides. */
  r.closeBtn.focus();

  if (!reduced()) {
    const last = r.stage.getBoundingClientRect();
    r.stage.style.transformOrigin = 'top left';
    r.stage.animate(
      [{ transform: invert(first, last) }, { transform: 'none' }],
      { duration: MORPH, easing: EASE }
    );
    /* The caption is not part of the object that grew, so it arrives just
       behind the panel instead of being stretched along with it. */
    cap.animate(
      [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
      { duration: 300, delay: 160, easing: EASE, fill: 'backwards' }
    );
  }
}

function close() {
  const r = refs;
  if (!r || closing) return;
  closing = true;

  const done = () => {
    /* Removing the iframe is what stops playback; dropping the full-size
       photograph keeps a multi-megabyte decode from sitting in memory for the
       rest of the visit. */
    r.stage.querySelectorAll('iframe, .vbox-full').forEach((n) => n.remove());
    r.dlg.close();
    document.documentElement.classList.remove('vbox-open');
    opener?.focus();
    closing = false;
  };

  const first = opener?.getBoundingClientRect();
  const last = r.stage.getBoundingClientRect();

  /* Morph back into the tile, but only while the tile is actually on screen —
     shrinking toward something the visitor cannot see reads as a glitch. */
  const canMorph = !reduced() && first && first.width > 0 &&
    first.bottom > 0 && first.top < window.innerHeight;

  if (!canMorph) {
    r.dlg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: 'ease-out' })
      .finished.then(done, done);
    return;
  }

  r.thumb.style.opacity = '1';
  r.dlg.querySelector('.vbox-cap')!.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: 140,
    easing: 'ease-out',
    fill: 'forwards',
  });
  const a = r.stage.animate(
    [{ transform: 'none' }, { transform: invert(first!, last) }],
    { duration: 340, easing: EASE, fill: 'forwards' }
  );
  r.dlg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 340, easing: 'ease-in' });
  a.finished.then(done, done);
}

/**
 * Wire every facade marked for the lightbox. Tiles without the marker keep
 * their existing inline swap, which VideoGrid still owns.
 */
export function videoLightbox() {
  document
    .querySelectorAll<HTMLButtonElement>('button.facade[data-lightbox]')
    .forEach((btn) =>
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.dataset.youtube;
        if (!id) return;
        const start = btn.dataset.start;

        openPanel(btn, {
          title: btn.dataset.title ?? 'Video',
          meta: btn.dataset.meta,
          ratio: 16 / 9,
          href: `https://www.youtube.com/watch?v=${id}${start ? `&t=${start}` : ''}`,
          fill: (stage, r) => {
            /* The thumbnail the tile already decoded carries the morph, so the
               panel is never an empty black box while YouTube boots. Reuse the
               exact src the tile settled on — it may have fallen back from
               maxres to hq. */
            const tileImg = btn.querySelector('img');
            r.thumb.src = tileImg?.currentSrc || tileImg?.src || '';
            r.thumb.style.opacity = '1';

            const frame = document.createElement('iframe');
            frame.src =
              `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` +
              (start ? `&start=${encodeURIComponent(start)}` : '');
            frame.title = r.title.textContent ?? 'Video';
            frame.allow =
              'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            frame.allowFullscreen = true;
            stage.appendChild(frame);

            /* Hold the thumbnail until the player has something of its own. */
            const drop = () => { r.thumb.style.opacity = '0'; };
            frame.addEventListener('load', () => setTimeout(drop, 260), { once: true });
            setTimeout(drop, 2000);
          },
        });
      })
    );
}

/**
 * Photographs. The trigger carries a large rendition in `data-full` — the
 * marquee itself only ships images a few hundred pixels wide, which would look
 * like a smear once blown up to fill the viewport.
 */
export function photoLightbox() {
  const triggers = document.querySelectorAll<HTMLButtonElement>('button[data-photo]');
  triggers.forEach((btn) =>
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const full = btn.dataset.full;
      if (!full) return;

      const w = Number(btn.dataset.w) || 0;
      const h = Number(btn.dataset.h) || 0;

      openPanel(btn, {
        title: btn.dataset.title || '',
        meta: btn.dataset.meta,
        ratio: w && h ? w / h : 3 / 2,
        fill: (stage, r) => {
          /* Show the small copy the marquee already has while the full-size
             file downloads, so the morph never opens onto an empty frame. */
          const src = btn.querySelector('img');
          r.thumb.src = src?.currentSrc || src?.src || '';
          r.thumb.style.opacity = '1';

          const img = document.createElement('img');
          img.className = 'vbox-full';
          img.src = full;
          img.alt = btn.dataset.alt ?? '';
          img.draggable = false;
          img.addEventListener('load', () => { r.thumb.style.opacity = '0'; }, { once: true });
          setTimeout(() => { r.thumb.style.opacity = '0'; }, 2500);
          stage.appendChild(img);
        },
      });
    })
  );
}
