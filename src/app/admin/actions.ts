'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { randomBytes } from 'node:crypto';
import { sql, ensureSchema } from '@/lib/db';
import {
  createSession, endSession, hashPassword, verifyPassword, passwordProblem, requireUser, requireAdmin, tooManyAttempts, userCount,
} from '@/lib/auth';
import { CLINIC_SLUGS, POST_KINDS, builtInClinics, builtInPostSlugs, builtInTherapySlugs, cleanBlocks, safeImage } from '@/lib/content';
import { slugify } from '@/lib/claims';

export interface FormState { error?: string; ok?: string }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const str = (f: FormData, k: string, max = 300) => String(f.get(k) ?? '').trim().slice(0, max);
const clientIp = async () => (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';

/** Every public page that lists treatments or articles. */
function refreshSite(extra: string[] = []) {
  for (const p of ['/', '/therapies', '/clinics', '/journal', '/sitemap.xml', '/llms.txt', '/journal/rss.xml', ...extra]) revalidatePath(p);
  revalidatePath('/clinics/[slug]', 'page');
  revalidatePath('/journal/[slug]', 'page');
}

// ---------- signing in ----------

export async function login(_: FormState, f: FormData): Promise<FormState> {
  const email = str(f, 'email').toLowerCase();
  const password = String(f.get('password') ?? '');
  if (tooManyAttempts(`ip:${await clientIp()}`) || tooManyAttempts(`email:${email}`)) return { error: 'Too many attempts. Wait a minute and try again.' };
  await ensureSchema();
  const u = (await sql()`SELECT id, password_hash, disabled FROM clinic_users WHERE email = ${email} LIMIT 1`)[0] as { id: number; password_hash: string; disabled: boolean } | undefined;
  // the same message either way, so the form does not reveal which emails have accounts
  if (!u || u.disabled || !(await verifyPassword(password, u.password_hash))) return { error: 'That email and password do not match an active account.' };
  await createSession(u.id);
  redirect('/admin');
}

export async function logout() {
  await endSession();
  redirect('/admin/login');
}

/**
 * The first account. Only works while there are no accounts. In production it needs the
 * ADMIN_SETUP_KEY set in Vercel; on a developer's machine with the local database it does not.
 */
export async function setup(_: FormState, f: FormData): Promise<FormState> {
  const key = process.env.ADMIN_SETUP_KEY;
  const local = process.env.NODE_ENV !== 'production' && !process.env.DATABASE_URL;
  if (!local && (!key || key.length < 16)) return { error: 'Set ADMIN_SETUP_KEY (16+ characters) in the Vercel project first.' };
  if (tooManyAttempts(`setup:${await clientIp()}`)) return { error: 'Too many attempts. Wait a minute.' };
  if ((await userCount()) > 0) return { error: 'An admin already exists. Sign in instead.' };
  if (!local && str(f, 'key', 500) !== key) return { error: 'The setup key is not right.' };
  const name = str(f, 'name', 100), email = str(f, 'email').toLowerCase(), password = String(f.get('password') ?? '');
  if (!name) return { error: 'Add your name.' };
  if (!EMAIL_RE.test(email)) return { error: 'Add a valid email.' };
  const bad = passwordProblem(password);
  if (bad) return { error: bad };
  const r = await sql()`INSERT INTO clinic_users (email, name, password_hash, role) VALUES (${email}, ${name}, ${await hashPassword(password)}, 'admin') RETURNING id`;
  await createSession((r[0] as { id: number }).id);
  redirect('/admin');
}

// ---------- accounts ----------

export async function changePassword(_: FormState, f: FormData): Promise<FormState> {
  const me = await requireUser();
  const current = String(f.get('current') ?? ''), next = String(f.get('next') ?? '');
  const row = (await sql()`SELECT password_hash FROM clinic_users WHERE id = ${me.id}`)[0] as { password_hash: string };
  if (!(await verifyPassword(current, row.password_hash))) return { error: 'Your current password is not right.' };
  const bad = passwordProblem(next);
  if (bad) return { error: bad };
  await sql()`UPDATE clinic_users SET password_hash = ${await hashPassword(next)} WHERE id = ${me.id}`;
  return { ok: 'Password changed.' };
}

export async function addUser(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const name = str(f, 'name', 100), email = str(f, 'email').toLowerCase();
  const role = f.get('role') === 'admin' ? 'admin' : 'editor';
  if (!name) return { error: 'Add a name.' };
  if (!EMAIL_RE.test(email)) return { error: 'Add a valid email.' };
  const temp = randomBytes(9).toString('base64url');
  try {
    await sql()`INSERT INTO clinic_users (email, name, password_hash, role) VALUES (${email}, ${name}, ${await hashPassword(temp)}, ${role})`;
  } catch {
    return { error: 'That email already has an account.' };
  }
  revalidatePath('/admin/users');
  return { ok: `Account created for ${name}. Their temporary password is ${temp}. Share it privately; they can change it under Account.` };
}

export async function resetPassword(id: number): Promise<FormState> {
  await requireAdmin();
  const temp = randomBytes(9).toString('base64url');
  await sql()`UPDATE clinic_users SET password_hash = ${await hashPassword(temp)} WHERE id = ${id}`;
  await sql()`DELETE FROM clinic_sessions WHERE user_id = ${id}`;
  return { ok: `New temporary password: ${temp}` };
}

export async function setDisabled(id: number, disabled: boolean): Promise<FormState> {
  const me = await requireAdmin();
  if (id === me.id) return { error: 'You cannot disable your own account.' };
  await sql()`UPDATE clinic_users SET disabled = ${disabled} WHERE id = ${id}`;
  if (disabled) await sql()`DELETE FROM clinic_sessions WHERE user_id = ${id}`;
  revalidatePath('/admin/users');
  return { ok: disabled ? 'Account disabled.' : 'Account enabled.' };
}

// ---------- treatments ----------

export async function newTreatment() {
  await requireUser();
  await ensureSchema();
  const slug = `draft-${randomBytes(4).toString('hex')}`;
  const r = await sql()`INSERT INTO clinic_treatments (slug, name) VALUES (${slug}, 'Untitled treatment') RETURNING id`;
  redirect(`/admin/treatments/${(r[0] as { id: number }).id}`);
}

export interface TreatmentInput {
  name: string; slug: string; ml: string; what: string; how: string;
  image: { url: string; alt: string } | null; clinics: string[]; sort: number;
}

export async function saveTreatment(id: number, input: TreatmentInput, mode: 'keep' | 'publish' | 'unpublish'): Promise<FormState & { slug?: string; status?: string }> {
  await requireUser();
  const old = (await sql()`SELECT slug FROM clinic_treatments WHERE id = ${id}`)[0] as { slug: string } | undefined;
  if (!old) return { error: 'That treatment no longer exists.' };

  const name = String(input.name ?? '').trim().slice(0, 120);
  const slug = slugify(String(input.slug || name));
  const what = String(input.what ?? '').trim().slice(0, 600);
  const how = String(input.how ?? '').trim().slice(0, 600);
  const ml = String(input.ml ?? '').trim().slice(0, 80);
  const imageUrl = input.image?.url && safeImage(input.image.url) ? input.image.url : null;
  const imageAlt = String(input.image?.alt ?? '').trim().slice(0, 300);
  const clinics = (Array.isArray(input.clinics) ? input.clinics : []).filter((c) => CLINIC_SLUGS.includes(c));
  const sort = Math.max(0, Math.min(999, Math.round(Number(input.sort) || 100)));

  if (!name) return { error: 'Give the treatment a name.' };
  if (!slug) return { error: 'The web address needs at least one letter or number.' };
  if (builtInTherapySlugs().has(slug)) return { error: `“${name}” is already one of the site’s built-in therapies. Choose another name or web address.` };
  if ((await sql()`SELECT 1 FROM clinic_treatments WHERE slug = ${slug} AND id <> ${id} LIMIT 1`).length) return { error: 'Another treatment already uses that web address.' };
  if (mode === 'publish') {
    if (!what) return { error: 'Add a short description before publishing.' };
    if (!clinics.length) return { error: 'Link the treatment to at least one clinic before publishing.' };
    if (imageUrl && !imageAlt) return { error: 'Describe the image (alt text) before publishing.' };
  }

  const status = mode === 'publish' ? 'published' : mode === 'unpublish' ? 'draft' : null;
  const r = await sql()`
    UPDATE clinic_treatments SET name = ${name}, slug = ${slug}, ml = ${ml}, what = ${what}, how = ${how},
      image_url = ${imageUrl}, image_alt = ${imageAlt}, clinics = ${clinics}, sort = ${sort},
      status = COALESCE(${status}::text, status), updated_at = now()
    WHERE id = ${id} RETURNING status`;
  // articles that pointed at the old address follow the rename
  if (old.slug !== slug) await sql()`UPDATE clinic_posts SET treatments = array_replace(treatments, ${old.slug}, ${slug})`;
  refreshSite(clinics.map((c) => `/clinics/${c}`));
  revalidatePath('/admin/treatments');
  const saved = (r[0] as { status: string }).status;
  return { ok: saved === 'published' ? (mode === 'publish' ? 'Published. It now appears on the therapies page and its clinics.' : 'Saved. The live treatment is updated.') : mode === 'unpublish' ? 'Unpublished. It is a draft again.' : 'Draft saved.', slug, status: saved };
}

export async function deleteTreatment(id: number) {
  await requireUser();
  const row = (await sql()`SELECT slug FROM clinic_treatments WHERE id = ${id}`)[0] as { slug: string } | undefined;
  if (row) {
    await sql()`DELETE FROM clinic_treatments WHERE id = ${id}`;
    await sql()`UPDATE clinic_posts SET treatments = array_remove(treatments, ${row.slug})`;
  }
  refreshSite();
  redirect('/admin/treatments');
}

// ---------- clinics: which therapies each one recommends ----------

/**
 * Sets the full list of therapies shown under one clinic. Built-in therapies keep their links in
 * clinic_builtin_links; treatments added in the admin keep theirs on the treatment itself.
 */
export async function setClinicTherapies(clinic: string, selected: string[]): Promise<FormState> {
  await requireUser();
  if (!CLINIC_SLUGS.includes(clinic)) return { error: 'Unknown clinic.' };
  await ensureSchema();
  const want = new Set((Array.isArray(selected) ? selected : []).map(String));

  const links = await builtInClinics();
  for (const [slug, clinics] of Object.entries(links)) {
    const has = clinics.includes(clinic);
    if (has === want.has(slug)) continue;
    const next = has ? clinics.filter((c) => c !== clinic) : [...clinics, clinic];
    await sql()`INSERT INTO clinic_builtin_links (slug, clinics, updated_at) VALUES (${slug}, ${next}, now())
      ON CONFLICT (slug) DO UPDATE SET clinics = EXCLUDED.clinics, updated_at = now()`;
  }

  const added = (await sql()`SELECT slug, clinics FROM clinic_treatments`) as { slug: string; clinics: string[] }[];
  for (const t of added) {
    const has = (t.clinics ?? []).includes(clinic);
    if (has === want.has(t.slug)) continue;
    if (has) await sql()`UPDATE clinic_treatments SET clinics = array_remove(clinics, ${clinic}), updated_at = now() WHERE slug = ${t.slug}`;
    else await sql()`UPDATE clinic_treatments SET clinics = array_append(clinics, ${clinic}), updated_at = now() WHERE slug = ${t.slug}`;
  }

  refreshSite([`/clinics/${clinic}`]);
  revalidatePath('/admin/clinics');
  revalidatePath('/admin/treatments');
  return { ok: 'Saved. The clinic page shows these therapies within a few minutes.' };
}

export async function resetBuiltInLinks(): Promise<FormState> {
  await requireAdmin();
  await sql()`DELETE FROM clinic_builtin_links`;
  refreshSite();
  revalidatePath('/admin/clinics');
  return { ok: 'The built-in therapies are back on their original clinics.' };
}

// ---------- doctors ----------

export async function newDoctor() {
  await requireUser();
  await ensureSchema();
  const slug = `draft-${randomBytes(4).toString('hex')}`;
  const r = await sql()`INSERT INTO clinic_doctors (slug, name, visible, sort) VALUES (${slug}, 'New doctor', FALSE,
    (SELECT COALESCE(MAX(sort), 0) + 10 FROM clinic_doctors)) RETURNING id`;
  redirect(`/admin/doctors/${(r[0] as { id: number }).id}`);
}

export interface DoctorInput { name: string; quals: string; role: string; photo: string | null; sort: number; visible: boolean }

export async function saveDoctor(id: number, input: DoctorInput): Promise<FormState> {
  await requireUser();
  const old = (await sql()`SELECT slug FROM clinic_doctors WHERE id = ${id}`)[0] as { slug: string } | undefined;
  if (!old) return { error: 'That doctor is no longer on the list.' };
  const name = String(input.name ?? '').trim().slice(0, 120);
  const quals = String(input.quals ?? '').split(/[,·\n]+/).map((q) => q.trim()).filter(Boolean).slice(0, 12).map((q) => q.slice(0, 40));
  const role = String(input.role ?? '').trim().slice(0, 120);
  const photo = input.photo && safeImage(input.photo) ? input.photo : null;
  const sort = Math.max(0, Math.min(9999, Math.round(Number(input.sort) || 100)));
  const visible = !!input.visible;
  if (!name || name === 'New doctor') return { error: 'Add the doctor’s name.' };
  if (visible && !quals.length) return { error: 'Add at least one qualification before showing the doctor on the site.' };
  if (visible && !photo) return { error: 'Add a photograph before showing the doctor on the site.' };
  // a new doctor's address comes from their name; an existing one keeps theirs, so links keep working
  let slug = old.slug;
  if (slug.startsWith('draft-')) {
    slug = slugify(name.replace(/^dr\.?\s+/i, '')) || slug;
    if ((await sql()`SELECT 1 FROM clinic_doctors WHERE slug = ${slug} AND id <> ${id}`).length) slug = `${slug}-${randomBytes(2).toString('hex')}`;
  }
  await sql()`UPDATE clinic_doctors SET slug = ${slug}, name = ${name}, quals = ${quals}, role = ${role}, photo_url = ${photo},
    sort = ${sort}, visible = ${visible}, updated_at = now() WHERE id = ${id}`;
  refreshDoctors();
  return { ok: visible ? 'Saved. The doctor is shown on the site within a few minutes.' : 'Saved. The doctor is hidden from the site.' };
}

export async function deleteDoctor(id: number) {
  await requireUser();
  await sql()`DELETE FROM clinic_doctors WHERE id = ${id}`;
  refreshDoctors();
  redirect('/admin/doctors');
}

/** Moves a doctor one place up or down the list. */
export async function moveDoctor(id: number, by: -1 | 1) {
  await requireUser();
  const list = (await sql()`SELECT id FROM clinic_doctors ORDER BY sort, name`) as { id: number }[];
  const i = list.findIndex((d) => d.id === id), j = i + by;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  for (const [k, d] of list.entries()) await sql()`UPDATE clinic_doctors SET sort = ${(k + 1) * 10} WHERE id = ${d.id}`;
  refreshDoctors();
}

function refreshDoctors() {
  // every public page carries the doctors in its structured data
  revalidatePath('/', 'layout');
  revalidatePath('/admin/doctors');
}

// ---------- journal ----------

export async function newPost() {
  const me = await requireUser();
  await ensureSchema();
  const slug = `draft-${randomBytes(4).toString('hex')}`;
  const r = await sql()`INSERT INTO clinic_posts (slug, title, author_id) VALUES (${slug}, 'Untitled article', ${me.id}) RETURNING id`;
  redirect(`/admin/journal/${(r[0] as { id: number }).id}`);
}

export interface PostInput {
  title: string; slug: string; dek: string; answer: string; kind: string;
  cover: { url: string; alt: string } | null; body: unknown; clinic: string; treatments: string[];
}

export async function savePost(id: number, input: PostInput, mode: 'keep' | 'publish' | 'unpublish'): Promise<FormState & { slug?: string; status?: string }> {
  await requireUser();
  const old = (await sql()`SELECT slug FROM clinic_posts WHERE id = ${id}`)[0] as { slug: string } | undefined;
  if (!old) return { error: 'That article no longer exists.' };

  const title = String(input.title ?? '').trim().slice(0, 160);
  const slug = slugify(String(input.slug || title));
  const dek = String(input.dek ?? '').trim().slice(0, 400);
  const answer = String(input.answer ?? '').trim().slice(0, 700);
  const kind = (POST_KINDS as readonly string[]).includes(input.kind) ? input.kind : POST_KINDS[0];
  const body = cleanBlocks(input.body);
  const coverUrl = input.cover?.url && safeImage(input.cover.url) ? input.cover.url : null;
  const coverAlt = String(input.cover?.alt ?? '').trim().slice(0, 300);
  const clinic = CLINIC_SLUGS.includes(input.clinic) ? input.clinic : null;
  const treatments = (Array.isArray(input.treatments) ? input.treatments : []).map((t) => slugify(String(t))).filter(Boolean).slice(0, 20);

  if (!title) return { error: 'Give the article a title.' };
  if (!slug) return { error: 'The web address needs at least one letter or number.' };
  if (builtInPostSlugs().has(slug)) return { error: 'That web address belongs to one of the built-in articles. Choose another.' };
  if ((await sql()`SELECT 1 FROM clinic_posts WHERE slug = ${slug} AND id <> ${id} LIMIT 1`).length) return { error: 'Another article already uses that web address.' };
  if (mode === 'publish') {
    if (!dek) return { error: 'Add a short summary before publishing.' };
    if (!answer) return { error: 'Add the short answer before publishing. It is what search and AI answers quote.' };
    if (!body.some((b) => b.t === 'p' && b.text.trim())) return { error: 'Add at least one paragraph before publishing.' };
    if (coverUrl && !coverAlt) return { error: 'Describe the cover image (alt text) before publishing.' };
    if (body.some((b) => b.t === 'img' && !b.alt.trim())) return { error: 'Describe every image in the article (alt text) before publishing.' };
  }

  const status = mode === 'publish' ? 'published' : mode === 'unpublish' ? 'draft' : null;
  const r = await sql()`
    UPDATE clinic_posts SET title = ${title}, slug = ${slug}, dek = ${dek}, answer = ${answer}, kind = ${kind},
      cover_url = ${coverUrl}, cover_alt = ${coverAlt}, body = ${JSON.stringify(body)}::jsonb, clinic = ${clinic}, treatments = ${treatments},
      status = COALESCE(${status}::text, status),
      published_at = CASE WHEN ${status}::text = 'published' AND published_at IS NULL THEN now() ELSE published_at END,
      updated_at = now()
    WHERE id = ${id} RETURNING status`;
  refreshSite([`/journal/${slug}`, `/journal/${old.slug}`, ...(clinic ? [`/clinics/${clinic}`] : [])]);
  revalidatePath('/admin/journal');
  const saved = (r[0] as { status: string }).status;
  return { ok: saved === 'published' ? (mode === 'publish' ? 'Published.' : 'Saved. The live article is updated.') : mode === 'unpublish' ? 'Unpublished. It is a draft again.' : 'Draft saved.', slug, status: saved };
}

export async function deletePost(id: number) {
  await requireUser();
  const row = (await sql()`SELECT slug FROM clinic_posts WHERE id = ${id}`)[0] as { slug: string } | undefined;
  if (row) await sql()`DELETE FROM clinic_posts WHERE id = ${id}`;
  refreshSite(row ? [`/journal/${row.slug}`] : []);
  redirect('/admin/journal');
}
