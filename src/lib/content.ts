import 'server-only';
import { ensureSchema, hasDatabase, sql } from './db';
import { CLINICS, REVIVE } from './clinics';
import { POSTS as BUILT_IN_POSTS, type Block, type Post } from './journal';
import { THERAPIES as BUILT_IN_THERAPIES, type Therapy } from './therapies';
import { DOCTORS as BUILT_IN_DOCTORS } from './site';

/*
 * What the public pages read. Each list is the built-in content (in code, reviewed with the site)
 * merged with what has been published in the admin. If the database cannot be reached, the pages
 * fall back to the built-in content rather than failing.
 */

export const CLINIC_SLUGS = [...CLINICS.map((c) => c.slug), REVIVE.slug];
export const clinicName = (slug: string) => (slug === REVIVE.slug ? REVIVE.name : CLINICS.find((c) => c.slug === slug)?.name ?? slug);

export const POST_KINDS = ['Visiting the clinic', 'Therapies', 'Clinic notes', 'Wellness'] as const;

const FALLBACK_IMAGE = '/photos/herbs.jpg';

// ---------- rows ----------

export interface TreatmentRow {
  id: number; slug: string; name: string; ml: string; what: string; how: string;
  image_url: string | null; image_alt: string; clinics: string[]; status: 'draft' | 'published'; sort: number;
  created_at: string; updated_at: string;
}

export interface PostRow {
  id: number; slug: string; title: string; dek: string; answer: string; kind: string;
  cover_url: string | null; cover_alt: string; body: unknown; clinic: string | null; treatments: string[];
  status: 'draft' | 'published'; author_id: number | null; author_name?: string | null; reviewer?: string | null;
  published_at: string | null; created_at: string; updated_at: string;
}

const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : String(v ?? ''));
const arr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : typeof v === 'string' ? v.replace(/^\{|\}$/g, '').split(',').filter(Boolean) : []);

// ---------- blocks written in the admin ----------

/** Keeps only well-formed blocks with the expected fields (input from the editor is untrusted). */
export function cleanBlocks(input: unknown): Block[] {
  if (!Array.isArray(input)) return [];
  const s = (v: unknown, max = 5000) => (typeof v === 'string' ? v.slice(0, max) : '');
  const out: Block[] = [];
  for (const b of input.slice(0, 300)) {
    if (!b || typeof b !== 'object') continue;
    const o = b as Record<string, unknown>;
    switch (o.t) {
      case 'p': case 'h2': case 'quote': out.push({ t: o.t, text: s(o.text) }); break;
      case 'ul': out.push({ t: 'ul', items: (Array.isArray(o.items) ? o.items : []).slice(0, 60).map((x) => s(x, 1000)) }); break;
      case 'note': out.push({ t: 'note', h: s(o.h, 200), text: s(o.text, 2000) }); break;
      case 'img': {
        const url = s(o.url, 1000);
        if (safeImage(url)) out.push({ t: 'img', url, alt: s(o.alt, 300), caption: s(o.caption, 300) });
        break;
      }
    }
  }
  return out;
}

/** Images the site will show: Vercel Blob uploads, local development uploads, and the site's own photos. */
export const safeImage = (url: string) =>
  /^https:\/\/[a-z0-9.-]+\.public\.blob\.vercel-storage\.com\//i.test(url) || /^\/(uploads|photos|doctors)\/[\w./-]+$/.test(url);

const wordCount = (blocks: Block[], extra: string) =>
  `${extra} ${blocks.map((b) => ('text' in b ? b.text : 'items' in b ? (b.items as unknown[]).map((x) => (typeof x === 'string' ? x : '')).join(' ') : '')).join(' ')}`
    .split(/\s+/).filter(Boolean).length;

// ---------- mapping ----------

export function toTherapy(r: TreatmentRow): Therapy {
  return {
    slug: r.slug, name: r.name, ml: r.ml, what: r.what, how: r.how,
    img: r.image_url && safeImage(r.image_url) ? r.image_url : FALLBACK_IMAGE,
    clinics: arr(r.clinics).filter((c) => CLINIC_SLUGS.includes(c)), fromAdmin: true,
  };
}

export function toPost(r: PostRow): Post {
  const blocks = cleanBlocks(r.body);
  return {
    slug: r.slug, title: r.title, dek: r.dek, kind: r.kind, answer: r.answer || r.dek,
    published: iso(r.published_at ?? r.created_at).slice(0, 10), revised: iso(r.updated_at).slice(0, 10),
    minutes: Math.max(1, Math.round(wordCount(blocks, `${r.dek} ${r.answer}`) / 200)),
    cover: { src: r.cover_url && safeImage(r.cover_url) ? r.cover_url : FALLBACK_IMAGE, alt: r.cover_alt || '', position: '50% 50%' },
    blocks, clinic: r.clinic && CLINIC_SLUGS.includes(r.clinic) ? r.clinic : undefined,
    treatments: arr(r.treatments), fromAdmin: true, reviewer: r.reviewer || undefined,
  };
}

async function rows<T>(fn: () => Promise<unknown[]>): Promise<T[]> {
  if (!hasDatabase()) return [];
  try { await ensureSchema(); return (await fn()) as T[]; }
  catch (e) { console.error('[content] could not read the database', e); return []; }
}

// ---------- therapies ----------

/** The clinics each built-in therapy belongs to, as written in the code. */
export const defaultBuiltInClinics = (slug: string) =>
  [...CLINICS.filter((c) => c.therapies.includes(slug)).map((c) => c.slug), ...(REVIVE.therapies.includes(slug) ? [REVIVE.slug] : [])];

/** The same, with any change made in the admin's Clinics page applied. */
export async function builtInClinics(): Promise<Record<string, string[]>> {
  const over = await rows<{ slug: string; clinics: unknown }>(() => sql()`SELECT slug, clinics FROM clinic_builtin_links`);
  const map = Object.fromEntries(BUILT_IN_THERAPIES.map((t) => [t.slug, defaultBuiltInClinics(t.slug)]));
  for (const o of over) if (o.slug in map) map[o.slug] = arr(o.clinics).filter((c) => CLINIC_SLUGS.includes(c));
  return map;
}

/** Every published therapy, built-in first (in the clinic's own order), then those added in the admin. */
export async function getTherapies(): Promise<Therapy[]> {
  const links = await builtInClinics();
  const builtIn = BUILT_IN_THERAPIES.map((t) => ({ ...t, clinics: links[t.slug] }));
  const db = (await rows<TreatmentRow>(() => sql()`SELECT * FROM clinic_treatments WHERE status = 'published' ORDER BY sort, name`)).map(toTherapy);
  const taken = new Set(builtIn.map((t) => t.slug));
  return [...builtIn, ...db.filter((t) => !taken.has(t.slug))];
}

export async function getTherapy(slug: string): Promise<Therapy | undefined> {
  return (await getTherapies()).find((t) => t.slug === slug);
}

/** The therapies a clinic offers: its own list, plus any treatment the admin linked to it. */
export async function therapiesForClinic(slug: string): Promise<Therapy[]> {
  return (await getTherapies()).filter((t) => t.clinics?.includes(slug));
}

// ---------- journal ----------

/** Every published article: the newest written in the admin first, then the built-in ones. */
export async function getPosts(): Promise<Post[]> {
  const db = (await rows<PostRow>(() => sql()`SELECT * FROM clinic_posts WHERE status = 'published' ORDER BY published_at DESC NULLS LAST, id DESC`)).map(toPost);
  const taken = new Set(db.map((p) => p.slug));
  return [...db, ...BUILT_IN_POSTS.filter((p) => !taken.has(p.slug))];
}

export async function getPost(slug: string): Promise<Post | undefined> {
  const db = await rows<PostRow>(() => sql()`SELECT * FROM clinic_posts WHERE slug = ${slug} AND status = 'published' LIMIT 1`);
  return db[0] ? toPost(db[0]) : BUILT_IN_POSTS.find((p) => p.slug === slug);
}

export async function postsForClinic(slug: string) {
  return (await getPosts()).filter((p) => p.clinic === slug);
}

export async function postsForTherapy(slug: string) {
  return (await getPosts()).filter((p) => p.treatments?.includes(slug));
}

// ---------- doctors ----------

export interface Doctor { slug: string; name: string; quals: string[]; role?: string; photo: string | null }

export interface DoctorRow {
  id: number; slug: string; name: string; quals: string[]; role: string; photo_url: string | null;
  sort: number; visible: boolean; created_at: string; updated_at: string;
}

/** The doctors shown on the site, in the admin's order; the launch list when there is no database. */
export async function getDoctors(): Promise<Doctor[]> {
  if (!hasDatabase()) return BUILT_IN_DOCTORS.map((d) => ({ ...d, photo: `/doctors/${d.slug}.jpg` }));
  const db = await rows<DoctorRow>(() => sql()`SELECT * FROM clinic_doctors WHERE visible ORDER BY sort, name`);
  return db.map((d) => ({
    slug: d.slug, name: d.name, quals: arr(d.quals), role: d.role || undefined,
    photo: d.photo_url && safeImage(d.photo_url) ? d.photo_url : null,
  }));
}

export async function getDoctor(slug: string): Promise<Doctor | undefined> {
  return (await getDoctors()).find((d) => d.slug === slug);
}

export const builtInPostSlugs = () => new Set(BUILT_IN_POSTS.map((p) => p.slug));
export const builtInTherapySlugs = () => new Set(BUILT_IN_THERAPIES.map((t) => t.slug));
