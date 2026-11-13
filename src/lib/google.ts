import 'server-only';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { ensureSchema, sql } from './db';

/*
 * Google Calendar and Meet, for online consultations.
 *
 * The clinic authorises its own Google account once, from Admin → Settings. The refresh token is
 * kept encrypted (AES-256-GCM, key from APP_SECRET) in clinic_meta. Every online consultation is
 * then an event on that account's calendar, with a Meet link, and the patient and the doctor as
 * guests. Calls are plain REST, so there is no Google SDK to keep up to date.
 *
 * In development, with Google not connected, a stand-in returns a placeholder link so the whole
 * booking flow can be tried on a laptop. In production, nothing is faked.
 */

const SCOPES = ['https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/userinfo.email'];
const CALENDAR = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID?.trim() || 'primary');
const API = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR}`;
const DEV = process.env.NODE_ENV !== 'production';

const clientId = () => process.env.GOOGLE_CLIENT_ID?.trim() || '';
const clientSecret = () => process.env.GOOGLE_CLIENT_SECRET?.trim() || '';
export const googleConfigured = () => !!clientId() && !!clientSecret();

// ---------- secrets ----------

function key() {
  const secret = process.env.APP_SECRET?.trim();
  if (!secret && !DEV) throw new Error('APP_SECRET is not set.');
  return createHash('sha256').update(secret || 'development-only-secret').digest();
}

export function seal(text: string) {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', key(), iv);
  const body = Buffer.concat([c.update(text, 'utf8'), c.final()]);
  return [iv, c.getAuthTag(), body].map((b) => b.toString('base64url')).join('.');
}

export function unseal(sealed: string) {
  const [iv, tag, body] = sealed.split('.').map((p) => Buffer.from(p, 'base64url'));
  const d = createDecipheriv('aes-256-gcm', key(), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(body), d.final()]).toString('utf8');
}

// ---------- the connection ----------

interface Stored { refresh_token: string; email: string; connected_at: string }

async function stored(): Promise<Stored | null> {
  await ensureSchema();
  const r = await sql()`SELECT value FROM clinic_meta WHERE key = 'google'`;
  if (!r.length) return null;
  try { return JSON.parse(unseal(String(r[0].value))) as Stored; } catch { return null; }
}

/** Who is connected, for the Settings page. Never returns the token. */
export async function googleStatus() {
  const s = googleConfigured() ? await stored() : null;
  return { configured: googleConfigured(), connected: !!s, email: s?.email ?? null, since: s?.connected_at ?? null };
}

export const googleReady = async () => (await googleStatus()).connected;

export function authUrl(redirectUri: string, state: string) {
  const q = new URLSearchParams({
    client_id: clientId(), redirect_uri: redirectUri, response_type: 'code', scope: SCOPES.join(' '),
    access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true', state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${q}`;
}

async function token(body: Record<string, string>) {
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId(), client_secret: clientSecret(), ...body }),
  });
  const j = (await r.json().catch(() => ({}))) as { access_token?: string; refresh_token?: string; expires_in?: number; error?: string; error_description?: string };
  if (!r.ok || !j.access_token) throw new Error(`Google sign-in failed: ${j.error_description || j.error || r.status}`);
  return j;
}

/** Finishes the "Connect Google Calendar" step: swaps the code for tokens and stores them. */
export async function connectGoogle(code: string, redirectUri: string) {
  const t = await token({ code, redirect_uri: redirectUri, grant_type: 'authorization_code' });
  if (!t.refresh_token) throw new Error('Google did not return a refresh token. Remove the app at myaccount.google.com/permissions and connect again.');
  const who = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${t.access_token}` } })
    .then((r) => r.json() as Promise<{ email?: string }>).catch(() => ({} as { email?: string }));
  const value = seal(JSON.stringify({ refresh_token: t.refresh_token, email: who.email ?? '', connected_at: new Date().toISOString() } satisfies Stored));
  await ensureSchema();
  await sql()`INSERT INTO clinic_meta (key, value) VALUES ('google', ${value}) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
  cache = null;
  return who.email ?? '';
}

export async function disconnectGoogle() {
  const s = await stored();
  if (s) await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(s.refresh_token)}`, { method: 'POST' }).catch(() => {});
  await sql()`DELETE FROM clinic_meta WHERE key = 'google'`;
  cache = null;
}

let cache: { token: string; until: number } | null = null;
async function accessToken() {
  if (cache && cache.until > Date.now() + 60_000) return cache.token;
  const s = await stored();
  if (!s) throw new Error('Google Calendar is not connected.');
  const t = await token({ refresh_token: s.refresh_token, grant_type: 'refresh_token' });
  cache = { token: t.access_token!, until: Date.now() + (t.expires_in ?? 3000) * 1000 };
  return cache.token;
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const r = await fetch(`${API}${path}`, { ...init, headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) } });
  if (r.status === 204) return undefined as T;
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Google Calendar: ${(j as { error?: { message?: string } }).error?.message || r.status}`);
  return j as T;
}

// ---------- events ----------

export interface EventInput { ref: string; summary: string; description: string; start: Date; end: Date; attendees: { email: string; name?: string }[] }
interface GEvent { id: string; hangoutLink?: string; conferenceData?: { entryPoints?: { entryPointType: string; uri: string }[] } }

const meetOf = (e: GEvent) => e.hangoutLink || e.conferenceData?.entryPoints?.find((p) => p.entryPointType === 'video')?.uri || '';
const times = (start: Date, end: Date) => ({ start: { dateTime: start.toISOString(), timeZone: 'Asia/Kolkata' }, end: { dateTime: end.toISOString(), timeZone: 'Asia/Kolkata' } });

/** Whether bookings can create real (or, in development, stand-in) events right now. */
export async function canCreateEvents() { return (await googleReady()) || DEV; }

/** Creates the calendar event with its Meet link and invites the guests. */
export async function createEvent(e: EventInput): Promise<{ id: string; meetUrl: string; standIn: boolean }> {
  if (!(await googleReady())) {
    if (!DEV) throw new Error('Google Calendar is not connected.');
    console.info(`[google] not connected; stand-in event for ${e.ref}: ${e.summary}, ${e.start.toISOString()}`);
    return { id: `dev-${e.ref}`, meetUrl: 'https://meet.google.com/dev-placeholder', standIn: true };
  }
  const ev = await call<GEvent>('/events?conferenceDataVersion=1&sendUpdates=all', {
    method: 'POST',
    body: JSON.stringify({
      summary: e.summary, description: e.description, ...times(e.start, e.end),
      attendees: e.attendees.map((a) => ({ email: a.email, displayName: a.name })),
      conferenceData: { createRequest: { requestId: e.ref, conferenceSolutionKey: { type: 'hangoutsMeet' } } },
      extendedProperties: { private: { app: 'avvvs-clinic', ref: e.ref } },
      reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 10 }, { method: 'email', minutes: 60 }] },
      guestsCanInviteOthers: false, guestsCanModify: false,
    }),
  });
  return { id: ev.id, meetUrl: meetOf(ev), standIn: false };
}

const real = (id: string | null | undefined): id is string => !!id && !id.startsWith('dev-');

export async function moveEvent(id: string | null | undefined, start: Date, end: Date) {
  if (!real(id) || !(await googleReady())) return;
  await call(`/events/${encodeURIComponent(id)}?sendUpdates=all`, { method: 'PATCH', body: JSON.stringify(times(start, end)) });
}

export async function deleteEvent(id: string | null | undefined) {
  if (!real(id) || !(await googleReady())) return;
  await call(`/events/${encodeURIComponent(id)}?sendUpdates=all`, { method: 'DELETE' }).catch((e) => console.error('[google] could not delete the event', e));
}

/**
 * Other things on the clinic calendar between two instants (a holiday, a meeting), which block
 * every doctor's slots. The clinic's own consultation events are left out: they are in the
 * database, per doctor. A failure here never blocks booking; it only means nothing extra is blocked.
 */
let busyCache: { key: string; at: number; value: { start: number; end: number }[] } | null = null;
export async function otherBusy(from: Date, to: Date) {
  if (!(await googleReady())) return [];
  const k = `${from.toISOString().slice(0, 13)}|${to.toISOString().slice(0, 13)}`;
  if (busyCache && busyCache.key === k && Date.now() - busyCache.at < 60_000) return busyCache.value;
  try {
    const q = new URLSearchParams({ timeMin: from.toISOString(), timeMax: to.toISOString(), singleEvents: 'true', maxResults: '500', orderBy: 'startTime' });
    const r = await call<{ items?: { status?: string; transparency?: string; start?: { dateTime?: string; date?: string }; end?: { dateTime?: string; date?: string }; extendedProperties?: { private?: { app?: string } } }[] }>(`/events?${q}`);
    const value = (r.items ?? [])
      .filter((e) => e.status !== 'cancelled' && e.transparency !== 'transparent' && e.extendedProperties?.private?.app !== 'avvvs-clinic')
      .map((e) => ({
        // an all-day event (a date, not a time) blocks the whole India-time day
        start: e.start?.dateTime ? Date.parse(e.start.dateTime) : Date.parse(`${e.start?.date}T00:00:00+05:30`),
        end: e.end?.dateTime ? Date.parse(e.end.dateTime) : Date.parse(`${e.end?.date}T00:00:00+05:30`),
      }))
      .filter((b) => Number.isFinite(b.start) && Number.isFinite(b.end));
    busyCache = { key: k, at: Date.now(), value };
    return value;
  } catch (e) {
    console.error('[google] could not read the calendar', e);
    return [];
  }
}
