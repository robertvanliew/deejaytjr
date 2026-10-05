/**
 * IndexNow: tells Bing (and so Copilot), Yandex, Naver and Seznam about every
 * URL in the live sitemap, so new or changed pages are recrawled in minutes
 * instead of days. Google does not use IndexNow; Search Console covers it.
 *
 * Run after a deploy has finished:  node scripts/indexnow.mjs
 * The key file is public/d9582d8da69fe58a8eb04bb178b0ea5f.txt.
 */
const HOST = 'www.deejaytjr.com';
const KEY = 'd9582d8da69fe58a8eb04bb178b0ea5f';

const xml = await (await fetch(`https://${HOST}/sitemap-0.xml`)).text();
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
});
console.log(`IndexNow: ${urlList.length} URLs submitted, HTTP ${res.status}`);
