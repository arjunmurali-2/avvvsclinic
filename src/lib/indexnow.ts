import 'server-only';
import { INDEXABLE, SITE_URL, abs } from './site';

/*
 * IndexNow: tells Bing (and through it ChatGPT search and Copilot), Yandex and others that a page
 * changed, so new treatments, doctors and articles are crawled in minutes rather than weeks.
 * Needs INDEXNOW_KEY (32 hex characters); the key is published at /indexnow.txt. Only production
 * announces; a failure never blocks a save.
 */

export const INDEXNOW_KEY = (process.env.INDEXNOW_KEY ?? '').trim();

export function pingIndexNow(paths: string[]) {
  if (!INDEXNOW_KEY || !INDEXABLE || process.env.NODE_ENV !== 'production' || !paths.length) return;
  const host = new URL(SITE_URL).host;
  const urlList = [...new Set(paths.map((p) => abs(p)))];
  void fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation: abs('/indexnow.txt'), urlList }),
  }).catch((e) => console.error('[indexnow] ping failed', e));
}
