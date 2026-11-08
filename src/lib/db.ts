import 'server-only';
import { neon } from '@neondatabase/serverless';
import { DOCTORS } from './site';

/*
 * The admin's database.
 *
 * Production: Neon Postgres, added to the Vercel project from the Marketplace (it sets DATABASE_URL).
 * Every table is prefixed `clinic_`, so the clinic can share the avvvs.com Neon database safely.
 *
 * Development without DATABASE_URL: the same SQL runs on PGlite, a Postgres compiled to WebAssembly
 * that lives in `.data/pglite` inside this project, so the admin can be tried locally with no setup.
 *
 * Without either (a production build with no database), the site still runs on its built-in
 * treatments and articles, and the admin explains what to connect.
 */

type Row = Record<string, unknown>;
type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Row[]>;

const LOCAL = !process.env.DATABASE_URL && process.env.NODE_ENV !== 'production';

export const hasDatabase = () => !!process.env.DATABASE_URL || LOCAL;
export const isLocalDatabase = () => LOCAL;

let client: Sql | null = null;

async function local(): Promise<Sql> {
  const g = globalThis as unknown as { __clinicPg?: Promise<Sql> };
  g.__clinicPg ??= (async () => {
    const { PGlite } = await import('@electric-sql/pglite');
    const { mkdir } = await import('node:fs/promises');
    await mkdir(`${process.cwd()}/.data`, { recursive: true });
    const db = new PGlite(`${process.cwd()}/.data/pglite`);
    await db.waitReady;
    return async (strings: TemplateStringsArray, ...values: unknown[]) => {
      const text = strings.reduce((acc, s, i) => acc + s + (i < values.length ? `$${i + 1}` : ''), '');
      const params = values.map((v) => (Array.isArray(v) ? v : v));
      const r = await db.query(text, params);
      return r.rows as Row[];
    };
  })().catch((e) => { g.__clinicPg = undefined; throw e; });
  return g.__clinicPg;
}

/** The tagged-template query function: sql()`SELECT … WHERE id = ${id}`. */
export function sql(): Sql {
  if (client) return client;
  if (process.env.DATABASE_URL) {
    const n = neon(process.env.DATABASE_URL);
    client = (strings, ...values) => n(strings, ...values) as Promise<Row[]>;
    return client;
  }
  if (LOCAL) {
    client = async (strings, ...values) => (await local())(strings, ...values);
    return client;
  }
  throw new Error('DATABASE_URL is not set. Add Neon Postgres to the Vercel project.');
}

let ready: Promise<void> | null = null;

/** Creates the tables on first use, so a new database needs no separate migration step. */
export function ensureSchema() {
  ready ??= (async () => {
    const q = sql();
    await q`CREATE TABLE IF NOT EXISTS clinic_users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
      disabled BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    await q`CREATE TABLE IF NOT EXISTS clinic_sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES clinic_users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL
    )`;
    await q`CREATE TABLE IF NOT EXISTS clinic_treatments (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      ml TEXT NOT NULL DEFAULT '',
      what TEXT NOT NULL DEFAULT '',
      how TEXT NOT NULL DEFAULT '',
      image_url TEXT,
      image_alt TEXT NOT NULL DEFAULT '',
      clinics TEXT[] NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
      sort INTEGER NOT NULL DEFAULT 100,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    // which clinics offer each built-in therapy, once changed in the admin (the code's list is the default)
    await q`CREATE TABLE IF NOT EXISTS clinic_builtin_links (
      slug TEXT PRIMARY KEY,
      clinics TEXT[] NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    await q`CREATE TABLE IF NOT EXISTS clinic_posts (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      dek TEXT NOT NULL DEFAULT '',
      answer TEXT NOT NULL DEFAULT '',
      kind TEXT NOT NULL DEFAULT 'Visiting the clinic',
      cover_url TEXT,
      cover_alt TEXT NOT NULL DEFAULT '',
      body JSONB NOT NULL DEFAULT '[]'::jsonb,
      clinic TEXT,
      treatments TEXT[] NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
      author_id INTEGER REFERENCES clinic_users(id) ON DELETE SET NULL,
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    await q`CREATE TABLE IF NOT EXISTS clinic_doctors (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      quals TEXT[] NOT NULL DEFAULT '{}',
      role TEXT NOT NULL DEFAULT '',
      photo_url TEXT,
      sort INTEGER NOT NULL DEFAULT 100,
      visible BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    // the doctor who reviewed an article (their slug); added after launch, so added in place
    await q`ALTER TABLE clinic_posts ADD COLUMN IF NOT EXISTS reviewer TEXT`;
    await q`CREATE TABLE IF NOT EXISTS clinic_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT '')`;
    // the first time, copy in the doctors the site launched with, so the admin starts from them;
    // after that the table is the only list, so deleting a doctor keeps them deleted
    const seeded = await q`SELECT 1 FROM clinic_meta WHERE key = 'doctors_seeded'`;
    if (!seeded.length) {
      let sort = 10;
      for (const d of DOCTORS) {
        await q`INSERT INTO clinic_doctors (slug, name, quals, role, photo_url, sort)
          VALUES (${d.slug}, ${d.name}, ${d.quals}, ${d.role ?? ''}, ${`/doctors/${d.slug}.jpg`}, ${sort}) ON CONFLICT (slug) DO NOTHING`;
        sort += 10;
      }
      await q`INSERT INTO clinic_meta (key, value) VALUES ('doctors_seeded', now()::text) ON CONFLICT (key) DO NOTHING`;
    }
  })().catch((e) => { ready = null; throw e; });
  return ready;
}
