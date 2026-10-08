import { scryptSync, timingSafeEqual, createHmac, randomBytes } from 'node:crypto';
import type { AstroCookies } from 'astro';

/**
 * Sign-in for /admin: one password, no accounts.
 *
 * Vercel holds two secrets, never the code:
 *  - ADMIN_PASSWORD_HASH  "scrypt$<salt>$<hash>" made by scripts/admin-password.mjs.
 *                         The password itself is stored nowhere.
 *  - ADMIN_SESSION_SECRET random string that signs the session cookie.
 *
 * The session is a signed expiry time in an HttpOnly, SameSite=Strict cookie.
 * Changing ADMIN_SESSION_SECRET signs everyone out at once.
 */
const COOKIE = 'tjr_admin';
const HOURS = 12;

const env = (k: string) => (import.meta.env[k] as string | undefined) ?? process.env[k];

export const adminConfigured = () => Boolean(env('ADMIN_PASSWORD_HASH') && env('ADMIN_SESSION_SECRET'));

export function checkPassword(password: string): boolean {
  const stored = env('ADMIN_PASSWORD_HASH') ?? '';
  const [scheme, saltB64, hashB64] = stored.split('$');
  if (scheme !== 'scrypt' || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64');
  const actual = scryptSync(password.normalize('NFKC'), Buffer.from(saltB64, 'base64'), expected.length, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

const sign = (payload: string) => createHmac('sha256', env('ADMIN_SESSION_SECRET') ?? '').update(payload).digest('base64url');

export function startSession(cookies: AstroCookies) {
  const exp = String(Date.now() + HOURS * 3600_000);
  const nonce = randomBytes(9).toString('base64url');
  const payload = `${exp}.${nonce}`;
  cookies.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'strict',
    path: '/',
    maxAge: HOURS * 3600,
  });
}

export function endSession(cookies: AstroCookies) {
  cookies.delete(COOKIE, { path: '/' });
}

export function isSignedIn(cookies: AstroCookies): boolean {
  if (!adminConfigured()) return false;
  const v = cookies.get(COOKIE)?.value;
  if (!v) return false;
  const i = v.lastIndexOf('.');
  const payload = v.slice(0, i);
  const mac = Buffer.from(v.slice(i + 1));
  const good = Buffer.from(sign(payload));
  if (mac.length !== good.length || !timingSafeEqual(mac, good)) return false;
  return Number(payload.split('.')[0]) > Date.now();
}

/**
 * Forms only post from this site. SameSite=Strict already keeps the cookie
 * off cross-site requests; this is the second lock.
 */
export function sameOrigin(request: Request, url: URL): boolean {
  const origin = request.headers.get('origin');
  return origin === url.origin;
}
