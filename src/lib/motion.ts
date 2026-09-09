/**
 * Motion engine.
 *
 * Vanilla, ~2KB, no animation library. Every effect here follows the same
 * rule: JavaScript only ever writes a CSS custom property or toggles an
 * attribute — the browser does the animating, off the main thread. That is
 * what keeps this smooth while the page is still loading images, and what
 * keeps the homepage inside the brief's 50KB JS budget.
 *
 * Everything is opt-in per element via a data attribute, and everything is
 * disabled wholesale under prefers-reduced-motion.
 */

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

/* ---------------------------------------------------------------------------
   1. Scroll reveal, with stagger.

   The elements are NOT hidden in the HTML — this script adds [data-reveal],
   which is what applies the hidden state. With JS off, or if this module
   fails, every element renders normally. Content is never hostage to motion.
   --------------------------------------------------------------------------- */
function reveal() {
  const groups = document.querySelectorAll<HTMLElement>('[data-reveal-group]');
  if (!groups.length) return;

  const all: HTMLElement[] = [];

  const show = (el: HTMLElement) => el.setAttribute('data-shown', '');

  let io: IntersectionObserver | null = null;
  try {
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          show(e.target as HTMLElement);
          io!.unobserve(e.target); // reveal once; re-animating on scroll-back is nauseating
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.02 }
    );
  } catch {
    io = null;
  }

  for (const group of groups) {
    // Direct children stagger; a group with no children staggers itself.
    const items = group.hasAttribute('data-reveal-self')
      ? [group]
      : (Array.from(group.children) as HTMLElement[]);

    items.forEach((item, i) => {
      item.setAttribute('data-reveal', '');
      // 55ms apart, capped: past ~6 items a long cascade reads as slow.
      item.style.setProperty('--reveal-delay', `${Math.min(i, 6) * 55}ms`);
      all.push(item);
    });
  }

  // Anything already inside the first screen reveals on load rather than on
  // scroll. Without this, an element sitting just below the observer's
  // rootMargin line — the hero CTA, for one — stays at opacity 0 until the
  // visitor scrolls, which hides the most important control on the page.
  // Motion must never be what decides whether content is visible.
  const fold = window.innerHeight;
  for (const item of all) {
    if (!io || item.getBoundingClientRect().top < fold) {
      requestAnimationFrame(() => requestAnimationFrame(() => show(item)));
    } else {
      io.observe(item);
    }
  }

  if (!io) return;

  // Safety net. The observer's negative bottom margin pulls its trigger line
  // above the viewport floor, so anything sitting in that last slice at
  // maximum scroll could never cross it and would stay invisible forever —
  // on this site that was the FAQ, the related-links row and a form field.
  // Once the visitor reaches the end of the document, release everything left.
  const atBottom = () =>
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

  const sweep = () => {
    if (!atBottom()) return;
    for (const item of all) {
      if (!item.hasAttribute('data-shown')) {
        show(item);
        io!.unobserve(item);
      }
    }
    removeEventListener('scroll', sweep);
    removeEventListener('resize', sweep);
  };

  addEventListener('scroll', sweep, { passive: true });
  addEventListener('resize', sweep, { passive: true });
  sweep();
}

/* ---------------------------------------------------------------------------
   2. Magnetic buttons.

   The button pulls toward the cursor as it approaches. Coarse pointers get
   nothing — there is no cursor to be magnetic toward, and the transform would
   only fight the tap.
   --------------------------------------------------------------------------- */
function magnetic() {
  if (!finePointer.matches) return;

  for (const el of document.querySelectorAll<HTMLElement>('[data-magnetic]')) {
    const strength = Number(el.dataset.magnetic) || 0.28;
    let frame = 0;

    const move = (ev: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const dx = ev.clientX - (r.left + r.width / 2);
        const dy = ev.clientY - (r.top + r.height / 2);
        el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
      });
    };

    const reset = () => {
      cancelAnimationFrame(frame);
      // Only the release is transitioned. While tracking, the transform must
      // follow the cursor exactly — a transition there feels like lag.
      el.style.transition = 'transform 420ms cubic-bezier(.23,1,.32,1)';
      el.style.transform = '';
      setTimeout(() => (el.style.transition = ''), 420);
    };

    el.addEventListener('pointerenter', () => (el.style.transition = ''));
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', reset);
  }
}

/* ---------------------------------------------------------------------------
   3. Cursor spotlight on cards.

   Writes --mx/--my on the hovered card only. Deliberately not written on a
   shared parent: a custom property set high in the tree forces a style
   recalculation on every descendant, which is expensive in a grid.
   --------------------------------------------------------------------------- */
function spotlight() {
  if (!finePointer.matches) return;

  for (const card of document.querySelectorAll<HTMLElement>('.spot')) {
    let frame = 0;
    card.addEventListener('pointermove', (ev) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${ev.clientX - r.left}px`);
        card.style.setProperty('--my', `${ev.clientY - r.top}px`);
      });
    });
  }
}

/* ---------------------------------------------------------------------------
   4. Count-up on figures.

   Only fires when the figure scrolls into view. Preserves whatever prefix,
   suffix and separators the copy uses, so "24,000+" and "+827%" both count
   correctly and land on exactly the string that was authored.
   --------------------------------------------------------------------------- */
function countUp() {
  const els = document.querySelectorAll<HTMLElement>('[data-count]');
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        io.unobserve(el);

        const final = el.textContent ?? '';
        const match = final.match(/[\d,.]+/);
        if (!match) continue;

        const target = Number(match[0].replace(/,/g, ''));
        if (!Number.isFinite(target)) continue;

        const decimals = (match[0].split('.')[1] ?? '').length;
        const grouped = match[0].includes(',');
        const start = performance.now();
        const dur = 1100;

        const tick = (now: number) => {
          const p = Math.min((now - start) / dur, 1);
          // Same ease-out family as the CSS, so motion across the page agrees.
          const eased = 1 - Math.pow(1 - p, 3);
          const value = target * eased;
          const shown = grouped
            ? Math.round(value).toLocaleString('en-CA')
            : value.toFixed(decimals);
          el.textContent = final.replace(match[0], shown);
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = final; // land on the authored string exactly
        };
        requestAnimationFrame(tick);
      }
    },
    { threshold: 0.6 }
  );

  els.forEach((el) => io.observe(el));
}

/* ---------------------------------------------------------------------------
   5. Nav state.

   Marks the bar as scrolled (so it can deepen its background), and hides it
   on downward scroll past the hero. Never hides while a menu is open, and
   never while the keyboard focus is inside it.
   --------------------------------------------------------------------------- */
function navState() {
  const nav = document.querySelector<HTMLElement>('.nav');
  if (!nav) return;

  let last = window.scrollY;
  let frame = 0;

  const update = () => {
    const y = window.scrollY;
    nav.toggleAttribute('data-scrolled', y > 24);

    const menuOpen = nav.querySelector('.burger')?.getAttribute('aria-expanded') === 'true';
    const focusInside = nav.contains(document.activeElement);

    if (!menuOpen && !focusInside && !reduced.matches) {
      nav.toggleAttribute('data-tucked', y > last && y > 420);
    } else {
      nav.removeAttribute('data-tucked');
    }
    last = y;
  };

  addEventListener(
    'scroll',
    () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    },
    { passive: true }
  );
  update();
}

/* ------------------------------------------------------------------------- */

export function initMotion() {
  // These two are not motion, they are state — they run regardless.
  navState();

  if (reduced.matches) return;

  reveal();
  magnetic();
  spotlight();
  countUp();
}
