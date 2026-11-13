'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin, requireUser } from '@/lib/auth';
import { appointmentByRef, cancelAppointment, rescheduleAppointment } from '@/lib/appointments';
import { toMin } from '@/lib/consult';
import { ensureSchema, sql } from '@/lib/db';
import { createEvent, deleteEvent, disconnectGoogle } from '@/lib/google';
import { sendMail, clinicInbox } from '@/lib/mail';
import type { FormState } from './actions';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ---------- a doctor's online settings ----------

export interface OnlineInput {
  email: string; online: boolean; minutes: number; feeRupees: string;
  hours: { weekday: number; from: string; to: string }[];
  off: { from: string; to: string; note: string }[];
}

export async function saveDoctorOnline(id: number, input: OnlineInput): Promise<FormState> {
  await requireUser();
  await ensureSchema();
  const email = String(input.email ?? '').trim().toLowerCase().slice(0, 200);
  const minutes = Math.round(Number(input.minutes));
  const fee = String(input.feeRupees ?? '').trim();
  const feePaise = fee === '' ? null : Math.round(Number(fee) * 100);
  if (email && !EMAIL_RE.test(email)) return { error: 'Check the doctor’s email address.' };
  if (![10, 15, 20, 30, 45, 60].includes(minutes)) return { error: 'Choose a consultation length.' };
  if (feePaise !== null && (!Number.isFinite(feePaise) || feePaise < 0 || feePaise > 10_000_000)) return { error: 'Check the fee.' };

  const hours: { weekday: number; start: number; end: number }[] = [];
  for (const h of Array.isArray(input.hours) ? input.hours.slice(0, 40) : []) {
    const start = toMin(String(h.from)), end = toMin(String(h.to)), weekday = Number(h.weekday);
    if (!(weekday >= 0 && weekday <= 6) || Number.isNaN(start) || Number.isNaN(end)) return { error: 'Check the online hours: each row needs a start and an end time.' };
    if (end - start < minutes) return { error: 'Each row of online hours must be at least one consultation long, and end after it starts.' };
    if (hours.some((x) => x.weekday === weekday && x.start < end && start < x.end)) return { error: 'Two rows of online hours overlap on the same day.' };
    hours.push({ weekday, start, end });
  }
  const off: { from: string; to: string; note: string }[] = [];
  for (const o of Array.isArray(input.off) ? input.off.slice(0, 60) : []) {
    const from = String(o.from), to = String(o.to || o.from);
    if (!DATE_RE.test(from) || !DATE_RE.test(to) || to < from) return { error: 'Check the days off: each needs a first day, and the last day cannot be before it.' };
    off.push({ from, to, note: String(o.note ?? '').trim().slice(0, 120) });
  }
  if (input.online && !email) return { error: 'Add the doctor’s email before switching online consultations on. Their invitations are sent to it.' };
  if (input.online && !hours.length) return { error: 'Add at least one row of online hours before switching online consultations on.' };

  await sql()`UPDATE clinic_doctors SET email = ${email}, online = ${!!input.online}, online_minutes = ${minutes}, online_fee_paise = ${feePaise}, updated_at = now() WHERE id = ${id}`;
  await sql()`DELETE FROM clinic_availability WHERE doctor_id = ${id}`;
  for (const h of hours) await sql()`INSERT INTO clinic_availability (doctor_id, weekday, start_min, end_min) VALUES (${id}, ${h.weekday}, ${h.start}, ${h.end})`;
  await sql()`DELETE FROM clinic_time_off WHERE doctor_id = ${id}`;
  for (const o of off) await sql()`INSERT INTO clinic_time_off (doctor_id, from_date, to_date, note) VALUES (${id}, ${o.from}, ${o.to}, ${o.note})`;
  revalidatePath('/doctors/[slug]', 'page');
  revalidatePath('/admin/doctors');
  return { ok: input.online ? 'Saved. Patients can now book this doctor online.' : 'Saved. Online consultations are off for this doctor.' };
}

// ---------- appointments ----------

export async function adminCancel(ref: string): Promise<FormState> {
  await requireUser();
  const a = await appointmentByRef(ref);
  if (!a) return { error: 'That appointment no longer exists.' };
  const ok = await cancelAppointment(a, 'clinic');
  revalidatePath('/admin/consultations');
  return ok ? { ok: 'Cancelled. The patient and the doctor have been emailed.' } : { error: 'That appointment is not active.' };
}

export async function adminReschedule(ref: string, start: string): Promise<FormState> {
  await requireUser();
  const a = await appointmentByRef(ref);
  if (!a) return { error: 'That appointment no longer exists.' };
  const r = await rescheduleAppointment(a, start, 'clinic');
  revalidatePath('/admin/consultations');
  return r.ok ? { ok: 'Moved. The patient and the doctor have been emailed.' } : { error: r.error === 'taken' ? 'That time is not free.' : 'Could not move the appointment.' };
}

export async function setOutcome(ref: string, status: 'completed' | 'no_show' | 'confirmed'): Promise<FormState> {
  await requireUser();
  if (!['completed', 'no_show', 'confirmed'].includes(status)) return { error: 'Unknown status.' };
  await sql()`UPDATE clinic_appointments SET status = ${status} WHERE ref = ${ref} AND status IN ('confirmed', 'completed', 'no_show')`;
  revalidatePath('/admin/consultations');
  return { ok: 'Updated.' };
}

// ---------- settings ----------

export async function disconnectGoogleAction(): Promise<FormState> {
  await requireAdmin();
  await disconnectGoogle();
  revalidatePath('/admin/settings');
  return { ok: 'Disconnected. Online booking is closed until Google Calendar is connected again.' };
}

/** Creates a real event with a Meet link, then removes it: proof the connection works. */
export async function testGoogle(): Promise<FormState> {
  await requireAdmin();
  try {
    const start = new Date(Date.now() + 24 * 3600_000);
    const ev = await createEvent({ ref: `test-${Date.now()}`, summary: 'AVVVS Clinic: connection test', description: 'A test from the clinic admin. It is deleted straight away.', start, end: new Date(start.getTime() + 600_000), attendees: [] });
    if (ev.standIn) return { error: 'Google Calendar is not connected, so nothing was sent to Google.' };
    await deleteEvent(ev.id);
    return ev.meetUrl ? { ok: `It works: Google created an event with a Meet link (${ev.meetUrl}) and it was removed again.` } : { error: 'Google created the event but gave no Meet link. Check that Meet is enabled for this Google account.' };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function testMail(): Promise<FormState> {
  const me = await requireAdmin();
  const r = await sendMail({ to: me.email, subject: 'AVVVS Clinic: email test', title: 'Email is working.', rows: [['Sent to', me.email], ['Clinic inbox', clinicInbox()]], message: 'This is a test from the clinic admin.' });
  return r === 'sent' ? { ok: `Sent to ${me.email}.` } : r === 'logged' ? { ok: 'SMTP is not set up on this computer, so the email was printed in the terminal instead.' } : { error: r === 'unconfigured' ? 'SMTP is not set up: add the SMTP variables in Vercel.' : 'The email could not be sent. Check the SMTP settings.' };
}
