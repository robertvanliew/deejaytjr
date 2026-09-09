import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Build-time SVG inliner for third-party logos.
 *
 * Why inline rather than <img src>: a client strip has to sit on the dark
 * band and pick up the same hover-to-tan as the wordmarks beside it. An <img>
 * paints whatever colour the file was authored in, so six suppliers' logos
 * would arrive in six palettes and none of them would respond to hover. Inlined
 * and driven by `currentColor`, every mark inherits the strip's ink from one
 * CSS rule.
 *
 * The alternative — CSS mask-image — fails on these particular files: an SVG
 * mask keys off alpha, and several of these logos are opaque shapes on an
 * opaque plate, which masks down to a filled rectangle.
 *
 * Runs at build time only. Nothing here reaches the browser as JS.
 */

/** Colours we rewrite to currentColor. `none` must survive untouched. */
const FILL_ATTR = /fill="(?!none")[^"]*"/gi;
const FILL_STYLE = /fill\s*:\s*(?!none)(#[0-9a-f]{3,8}|rgba?\([^)]*\)|[a-z]+)/gi;

/**
 * Background plates. Vector logos are routinely exported with an opaque rect
 * covering the whole canvas — invisible on the white artboard they were drawn
 * on, and a solid slab of ink once the artwork is recoloured. MLSE's file has
 * one. Matched by a rect carrying no positioning, which is what a full-bleed
 * plate looks like; a rect that is part of the artwork has x/y or rx.
 *
 * Only ever applied OUTSIDE <defs>. MLSE's clipPath is defined by a rect of
 * exactly these dimensions; removing that one empties the clip path, which
 * clips the entire logo away to nothing.
 */
const PLATE = /<rect(?![^>]*\b(?:x|y|rx|ry)=)[^>]*\/>/gi;
const DEFS = /<defs[\s\S]*?<\/defs>/gi;

/** Runs `fn` over the markup outside <defs>, leaving definitions untouched. */
function outsideDefs(svg: string, fn: (s: string) => string): string {
  const kept: string[] = [];
  /* The sentinel must be something that cannot occur in SVG markup or path
     data: a bare number would collide with every "M 10 20" in the file. */
  const masked = svg.replace(DEFS, (m) => `@@DEFS${kept.push(m) - 1}@@`);
  return fn(masked).replace(/@@DEFS(\d+)@@/g, (_, i) => kept[Number(i)]!);
}

/** Root-level attributes that would override CSS sizing. */
const ROOT_SIZE = /\s(?:width|height)="[^"]*"/gi;

export interface InlinedSvg {
  markup: string;
  /** From the viewBox, so a caller can set height and let width follow. */
  ratio: number | null;
}

export function inlineSvg(publicPath: string, className: string): InlinedSvg {
  /* Resolved from the project root, not from import.meta.url: this module gets
     bundled into dist/server/ for the build, where a URL relative to itself
     points at dist/public and the read fails. Astro always builds from the
     project root, so cwd is the stable anchor. */
  let svg = readFileSync(join(process.cwd(), 'public', publicPath), 'utf8');

  /* Strip the XML prolog and editor comments; they are invalid mid-document. */
  svg = svg.replace(/<\?xml[^>]*\?>/gi, '').replace(/<!--[\s\S]*?-->/g, '').trim();

  svg = outsideDefs(svg, (m) => m.replace(PLATE, ''));

  const head = svg.slice(0, svg.indexOf('>') + 1);
  let newHead = head
    .replace(ROOT_SIZE, '')
    .replace(FILL_ATTR, '')
    /* The root fill cascades to every path that declares none of its own,
       which is how Pioneer DJ's file is authored. */
    .replace(/<svg/i, `<svg fill="currentColor" class="${className}" aria-hidden="true" focusable="false"`);

  let body = svg.slice(head.length).replace(FILL_ATTR, 'fill="currentColor"');
  body = body.replace(FILL_STYLE, 'fill:currentColor');

  const vb = /viewBox="([\d.\s-]+)"/i.exec(head);
  let ratio: number | null = null;
  if (vb?.[1]) {
    const [, , w, h] = vb[1].trim().split(/\s+/).map(Number);
    if (w && h) ratio = w / h;
  }

  return { markup: newHead + body, ratio };
}
