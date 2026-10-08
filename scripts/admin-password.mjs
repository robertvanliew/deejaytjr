/**
 * Makes the two /admin secrets for Vercel. The password never leaves this
 * computer: you type it here, and only its scrambled form is printed.
 *
 *   node scripts/admin-password.mjs
 *
 * Paste the output into Vercel → Project → Settings → Environment Variables
 * (Production), then redeploy.
 */
import { scryptSync, randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline';
import { Writable } from 'node:stream';

const muted = new Writable({ write: (_c, _e, cb) => cb() });
const ask = (q) =>
  new Promise((resolve) => {
    process.stdout.write(q);
    const rl = createInterface({ input: process.stdin, output: muted, terminal: true });
    rl.question('', (a) => {
      rl.close();
      process.stdout.write('\n');
      resolve(a);
    });
  });

const pw = await ask('New admin password (hidden): ');
const again = await ask('Type it again: ');
if (pw !== again) {
  console.error('The two did not match. Nothing was made.');
  process.exit(1);
}
if (pw.length < 12) console.warn('\nWarning: under 12 characters is easy to guess. A four-word passphrase is better.\n');

const salt = randomBytes(16);
const hash = scryptSync(pw.normalize('NFKC'), salt, 32, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
console.log('\nADMIN_PASSWORD_HASH=' + ['scrypt', salt.toString('base64'), hash.toString('base64')].join('$'));
console.log('ADMIN_SESSION_SECRET=' + randomBytes(32).toString('base64url'));
