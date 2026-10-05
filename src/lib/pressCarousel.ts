/**
 * Behaviour for PressCarousel.astro: rotation, the article popup, sharing.
 */

const INTERVAL = 7000;

export function pressCarousel() {
  const root = document.querySelector<HTMLElement>('[data-pc]');
  const dlg = document.querySelector<HTMLDialogElement>('dialog.adlg');
  if (!root || !dlg) return;
  const pc: HTMLElement = root;
  const d: HTMLDialogElement = dlg;

  const slides = [...pc.querySelectorAll<HTMLElement>('.slide')];
  const dots = [...pc.querySelectorAll<HTMLButtonElement>('.dot')];
  const count = pc.querySelector<HTMLElement>('[data-count]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  pc.style.setProperty('--pc-ms', `${INTERVAL}ms`);

  let index = 0;
  let timer: number | undefined;
  let started = 0;
  let remaining = INTERVAL;

  /* ---------------- rotation ---------------- */

  function show(n: number, dir = 1) {
    const next = (n + slides.length) % slides.length;
    if (next === index) return;
    const prev = slides[index]!;
    prev.classList.remove('on');
    prev.classList.toggle('out-left', dir > 0);
    prev.setAttribute('aria-hidden', 'true');
    prev.querySelectorAll<HTMLElement>('a, button').forEach((el) => (el.tabIndex = -1));

    const cur = slides[next]!;
    cur.classList.remove('out-left');
    cur.classList.add('on');
    cur.removeAttribute('aria-hidden');
    cur.querySelectorAll<HTMLElement>('a, button').forEach((el) => el.removeAttribute('tabindex'));

    dots.forEach((dt, i) => {
      dt.classList.toggle('on', i === next);
      dt.setAttribute('aria-selected', String(i === next));
    });
    if (count) count.textContent = String(next + 1);
    index = next;
    restart();
  }

  /* Pause reasons stack: hover, focus, open popup, off-screen, hidden tab.
     Rotation only runs when none apply. */
  const holds = new Set<string>();

  function restart() {
    clearTimeout(timer);
    remaining = INTERVAL;
    // Re-trigger the progress bar's CSS animation from zero.
    pc.removeAttribute('data-playing');
    void pc.offsetWidth;
    if (!reduced) pc.setAttribute('data-playing', '');
    tick();
  }

  function tick() {
    clearTimeout(timer);
    if (reduced || holds.size) return;
    started = performance.now();
    timer = window.setTimeout(() => show(index + 1, 1), remaining);
  }

  function hold(reason: string) {
    if (holds.has(reason)) return;
    if (!holds.size && timer !== undefined) {
      remaining = Math.max(400, remaining - (performance.now() - started));
    }
    holds.add(reason);
    clearTimeout(timer);
    pc.setAttribute('data-paused', '');
  }

  function release(reason: string) {
    if (!holds.delete(reason) || holds.size) return;
    pc.removeAttribute('data-paused');
    tick();
  }

  pc.querySelector('[data-prev]')!.addEventListener('click', () => show(index - 1, -1));
  pc.querySelector('[data-next]')!.addEventListener('click', () => show(index + 1, 1));
  dots.forEach((dt) => dt.addEventListener('click', () => show(Number(dt.dataset.go), Number(dt.dataset.go) > index ? 1 : -1)));

  pc.addEventListener('mouseenter', () => hold('hover'));
  pc.addEventListener('mouseleave', () => release('hover'));
  pc.addEventListener('focusin', () => hold('focus'));
  pc.addEventListener('focusout', (e) => {
    if (!pc.contains(e.relatedTarget as Node)) release('focus');
  });
  document.addEventListener('visibilitychange', () =>
    document.hidden ? hold('tab') : release('tab')
  );
  new IntersectionObserver(
    ([entry]) => (entry!.isIntersecting ? release('offscreen') : hold('offscreen')),
    { threshold: 0.35 }
  ).observe(pc);

  // Arrow keys when focus is inside the carousel.
  pc.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1, 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1, -1); }
  });

  // Swipe. Horizontal only; a vertical drag stays a page scroll (touch-action: pan-y).
  let x0: number | null = null;
  let y0 = 0;
  const vp = pc.querySelector<HTMLElement>('.viewport')!;
  vp.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    x0 = e.clientX; y0 = e.clientY;
    hold('touch');
  });
  vp.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    const dy = e.clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    window.setTimeout(() => release('touch'), 2500);
  });
  vp.addEventListener('pointercancel', () => { x0 = null; release('touch'); });

  restart();

  /* ---------------- article popup ---------------- */

  const $ = <T extends HTMLElement>(sel: string) => d.querySelector<T>(sel)!;
  const img = $<HTMLImageElement>('[data-a-img]');
  const note = $<HTMLElement>('[data-share-note]');
  const nativeBtn = $<HTMLButtonElement>('[data-share-native]');
  let current: DOMStringMap | null = null;
  let opener: HTMLElement | null = null;

  /* The native share sheet is the only route into Instagram, TikTok and
     Snapchat from a web page, so it leads wherever the browser offers it. */
  if (typeof navigator.share === 'function') nativeBtn.hidden = false;

  pc.querySelectorAll<HTMLButtonElement>('[data-article]').forEach((btn) =>
    btn.addEventListener('click', () => open(btn))
  );

  function open(btn: HTMLButtonElement) {
    const a = btn.dataset;
    current = a;
    opener = btn;
    img.src = a.img ?? '';
    img.alt = '';
    $('[data-a-credit]').textContent = a.credit ? `Photograph: ${a.credit}` : '';
    $('[data-a-meta]').textContent = [a.outlet, a.when].filter(Boolean).join(' · ');
    $('[data-a-title]').textContent = a.title ?? '';
    $('[data-a-byline]').textContent = a.byline ? `By ${a.byline}` : '';
    $('[data-a-excerpt]').textContent = a.excerpt ?? '';
    $('[data-a-host]').textContent = a.host ?? '';
    $<HTMLAnchorElement>('[data-a-read]').href = a.url ?? '#';
    $<HTMLAnchorElement>('[data-a-read]').innerHTML = `Read the full article on ${esc(a.outlet ?? '')} <span aria-hidden="true">↗</span>`;
    wireShareLinks(a);
    note.textContent = '';
    hold('dialog');
    d.showModal();
    $<HTMLElement>('[data-a-read]').focus();
  }

  function close() {
    d.close();
  }
  d.addEventListener('close', () => {
    release('dialog');
    opener?.focus();
  });
  $('[data-close]').addEventListener('click', close);
  d.addEventListener('click', (e) => { if (e.target === d) close(); });

  /* ---------------- sharing ---------------- */

  const shareText = (a: DOMStringMap) => `DEEJAY T-JR. in ${a.outlet}: “${a.title}”`;

  function wireShareLinks(a: DOMStringMap) {
    const url = encodeURIComponent(a.url ?? '');
    const text = encodeURIComponent(shareText(a));
    const hrefs: Record<string, string> = {
      x: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      email: `mailto:?subject=${text}&body=${text}%0A%0A${url}`,
    };
    d.querySelectorAll<HTMLAnchorElement>('[data-share]').forEach((el) => {
      el.href = hrefs[el.dataset.share!] ?? '#';
    });
  }

  nativeBtn.addEventListener('click', async () => {
    if (!current) return;
    try {
      await navigator.share({ title: current.title, text: shareText(current), url: current.url });
    } catch { /* dismissed */ }
  });

  $('[data-share-copy]').addEventListener('click', async () => {
    if (!current?.url) return;
    try {
      await navigator.clipboard.writeText(current.url);
      note.textContent = 'Link copied.';
    } catch {
      note.textContent = current.url;
    }
  });

  $('[data-share-story]').addEventListener('click', async () => {
    if (!current) return;
    note.textContent = 'Making your story card…';
    try {
      const blob = await storyCard(current);
      const file = new File([blob], 'deejay-tjr-story.png', { type: 'image/png' });
      /* On phones this hands the image to the system share sheet, where
         Instagram, Facebook, Snapchat and TikTok all offer "add to story".
         The article link goes in the text so it travels with it. */
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `${shareText(current)} ${current.url}` });
        note.textContent = '';
      } else {
        // Desktop: save the card, ready to post from a phone.
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = file.name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        note.textContent = 'Story card saved. Post it from your phone and add the link sticker.';
      }
    } catch (err) {
      note.textContent = (err as Error)?.name === 'AbortError' ? '' : 'Could not make the story card.';
    }
  });
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/**
 * A 1080 × 1920 story card drawn on a canvas: her photograph, the outlet, the
 * headline and where to read it. Built from the page's own fonts and palette
 * so it looks like the site rather than a screenshot of it. The image is
 * same-origin, so the canvas stays exportable.
 */
async function storyCard(a: DOMStringMap): Promise<Blob> {
  const W = 1080, H = 1920;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d')!;
  await document.fonts.ready;

  g.fillStyle = '#0e0d0c';
  g.fillRect(0, 0, W, H);

  // Photo, cover-cropped into the top 62%.
  const ph = Math.round(H * 0.62);
  const im = await loadImage(a.img ?? '');
  const s = Math.max(W / im.width, ph / im.height);
  const iw = im.width * s, ih = im.height * s;
  g.drawImage(im, (W - iw) / 2, (ph - ih) / 2.4, iw, ih);
  const fade = g.createLinearGradient(0, ph * 0.55, 0, ph);
  fade.addColorStop(0, 'rgba(14,13,12,0)');
  fade.addColorStop(1, 'rgba(14,13,12,1)');
  g.fillStyle = fade;
  g.fillRect(0, 0, W, ph);

  const pad = 84;
  let y = ph + 30;

  g.fillStyle = '#d5c9b1';
  g.font = '600 34px "Geist Variable", "Geist", system-ui, sans-serif';
  g.fillText(`FEATURED IN ${(a.outlet ?? '').toUpperCase()}`, pad, y);
  y += 40;
  g.fillStyle = 'rgba(213,201,177,.35)';
  g.fillRect(pad, y, 120, 3);
  y += 72;

  g.fillStyle = '#f2ede2';
  let size = 76;
  let lines: string[];
  do {
    g.font = `600 ${size}px "Bodoni Moda Variable", "Bodoni Moda", Didot, Georgia, serif`;
    lines = wrap(g, a.title ?? '', W - pad * 2);
    size -= 4;
  } while (lines.length > 5 && size > 44);
  const lh = (size + 4) * 1.12;
  for (const line of lines) { g.fillText(line, pad, y); y += lh; }

  if (a.byline) {
    y += 14;
    g.fillStyle = '#948b7d';
    g.font = '400 32px "Geist Variable", "Geist", system-ui, sans-serif';
    g.fillText(`By ${a.byline}`, pad, y);
  }

  g.fillStyle = '#d5c9b1';
  g.font = '600 40px "Bodoni Moda Variable", Didot, Georgia, serif';
  g.fillText('DEEJAY T-JR.', pad, H - 150);
  g.fillStyle = '#948b7d';
  g.font = '400 30px "Geist Variable", "Geist", system-ui, sans-serif';
  g.fillText(`Read it at ${a.host}`, pad, H - 100);

  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('toBlob'))), 'image/png'));
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = src;
  });
}

function wrap(g: CanvasRenderingContext2D, text: string, max: number): string[] {
  const words = text.split(/\s+/);
  const out: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (g.measureText(test).width > max && line) { out.push(line); line = w; }
    else line = test;
  }
  if (line) out.push(line);
  return out;
}
