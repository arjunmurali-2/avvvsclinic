import { currentUser } from '@/lib/auth';
import { fmtDate, fmtTime } from '@/lib/consult';
import { ensureSchema, sql } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/*
 * Consultations as a CSV spreadsheet, for entering into the clinic's practice software
 * (Pappyjoe has no public API to send them to directly) or for the clinic's own records.
 */
const cell = (v: unknown) => {
  let s = String(v ?? '');
  if (/^[=+\-@]/.test(s)) s = `'${s}`;   // stop a spreadsheet treating patient text as a formula
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  if (!(await currentUser())) return new Response('Sign in first.', { status: 401 });
  await ensureSchema();
  const past = new URL(req.url).searchParams.get('show') === 'past';
  const now = new Date().toISOString();
  const rows = await (past
    ? sql()`SELECT a.*, d.name AS doctor_name FROM clinic_appointments a JOIN clinic_doctors d ON d.id = a.doctor_id WHERE a.starts_at < ${now} OR a.status = 'cancelled' ORDER BY a.starts_at DESC LIMIT 5000`
    : sql()`SELECT a.*, d.name AS doctor_name FROM clinic_appointments a JOIN clinic_doctors d ON d.id = a.doctor_id WHERE a.starts_at >= ${now} AND a.status <> 'cancelled' ORDER BY a.starts_at LIMIT 5000`);
  const head = ['Date', 'Time (IST)', 'Doctor', 'Patient', 'Age', 'Phone', 'Email', 'Status', 'Note', 'Meet link', 'Reference', 'Booked on'];
  const lines = rows.map((r) => [fmtDate(r.starts_at as string), fmtTime(r.starts_at as string), r.doctor_name, r.name, r.age, r.phone, r.email, r.status, r.note, r.meet_url, r.ref, fmtDate(r.created_at as string)].map(cell).join(','));
  const csv = `﻿${head.map(cell).join(',')}\r\n${lines.join('\r\n')}\r\n`;
  return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="avvvs-online-consultations-${past ? 'past' : 'upcoming'}.csv"`, 'Cache-Control': 'no-store' } });
}
