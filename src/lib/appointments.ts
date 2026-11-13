import 'server-only';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { ensureSchema, sql } from './db';
import { CANCEL_CUTOFF_MIN, fmtDate, fmtTime, fmtWhen, type ConsultInput } from './consult';
import { createEvent, deleteEvent, moveEvent } from './google';
import { clinicInbox, sendMail } from './mail';
import { HOLD_MINUTES, paymentProvider } from './payments';
import { slotIsFree, type DoctorOnlineRow } from './slots';
import { CLINIC, abs } from './site';

/*
 * Online consultation appointments. Double booking is prevented by the database (a unique index on
 * doctor + start time for live appointments), so the order here is: take the slot, then create the
 * Google event; if Google fails, the slot is given back.
 */

export interface Appointment {
  id: number; ref: string; doctor_id: number; starts_at: string; ends_at: string;
  status: 'pending_payment' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  name: string; phone: string; email: string; age: string; note: string;
  google_event_id: string | null; meet_url: string | null; manage_token_hash: string;
  reminder_sent_at: string | null; payment_status: string; amount_paise: number | null; created_at: string;
  doctor_name?: string; doctor_slug?: string; doctor_email?: string; doctor_minutes?: number;
}

const hash = (t: string) => createHash('sha256').update(t).digest('hex');
const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : new Date(String(v)).toISOString());
const norm = (a: Record<string, unknown>): Appointment => ({ ...(a as unknown as Appointment), starts_at: iso(a.starts_at), ends_at: iso(a.ends_at) });

export const manageUrl = (ref: string, token: string) => abs(`/consult/${ref}?t=${token}`);

export async function appointmentByRef(ref: string): Promise<Appointment | undefined> {
  await ensureSchema();
  const r = await sql()`
    SELECT a.*, d.name AS doctor_name, d.slug AS doctor_slug, d.email AS doctor_email, d.online_minutes AS doctor_minutes
    FROM clinic_appointments a JOIN clinic_doctors d ON d.id = a.doctor_id WHERE a.ref = ${ref} LIMIT 1`;
  return r[0] ? norm(r[0]) : undefined;
}

/** The appointment, if the link's token matches (the patient's proof that the booking is theirs). */
export async function appointmentForPatient(ref: string, token: string) {
  const a = await appointmentByRef(ref);
  if (!a || !token) return undefined;
  const want = Buffer.from(a.manage_token_hash, 'hex'), got = Buffer.from(hash(token), 'hex');
  return want.length === got.length && timingSafeEqual(want, got) ? a : undefined;
}

export const canPatientChange = (a: Pick<Appointment, 'status' | 'starts_at'>) =>
  a.status === 'confirmed' && new Date(a.starts_at).getTime() - Date.now() > CANCEL_CUTOFF_MIN * 60_000;

const isUniqueViolation = (e: unknown) => /unique|duplicate|23505/i.test(String((e as { code?: string; message?: string })?.code ?? '') + String((e as Error)?.message ?? ''));

// ---------- booking ----------

export type CreateResult = { ok: true; ref: string; token: string; status: Appointment['status'] } | { ok: false; error: 'taken' | 'unavailable' | 'failed' };

export async function createAppointment(doctor: DoctorOnlineRow, input: ConsultInput): Promise<CreateResult> {
  await ensureSchema();
  const start = new Date(input.start), end = new Date(start.getTime() + doctor.online_minutes * 60_000);
  if (!(await slotIsFree(doctor, input.start))) return { ok: false, error: 'taken' };

  const pay = paymentProvider();
  const needsPayment = pay.required && !!doctor.online_fee_paise;
  const ref = randomBytes(6).toString('hex'), token = randomBytes(24).toString('base64url');
  const status = needsPayment ? 'pending_payment' : 'confirmed';
  const hold = needsPayment ? new Date(Date.now() + HOLD_MINUTES * 60_000).toISOString() : null;

  try {
    await sql()`INSERT INTO clinic_appointments
      (ref, doctor_id, starts_at, ends_at, status, name, phone, email, age, note, consent_at, manage_token_hash, payment_status, payment_provider, amount_paise, hold_expires_at)
      VALUES (${ref}, ${doctor.id}, ${start.toISOString()}, ${end.toISOString()}, ${status}, ${input.name}, ${input.phone}, ${input.email}, ${input.age}, ${input.note},
        now(), ${hash(token)}, ${needsPayment ? 'pending' : 'not_required'}, ${needsPayment ? pay.id : null}, ${doctor.online_fee_paise}, ${hold})`;
  } catch (e) {
    if (isUniqueViolation(e)) return { ok: false, error: 'taken' };
    console.error('[consult] could not save the appointment', e);
    return { ok: false, error: 'failed' };
  }

  // with payment switched on, the event and the emails wait for confirmPaid()
  if (needsPayment) return { ok: true, ref, token, status };

  try {
    await finalise(ref, token);
  } catch (e) {
    console.error('[consult] could not create the calendar event; releasing the slot', e);
    await sql()`DELETE FROM clinic_appointments WHERE ref = ${ref}`;
    return { ok: false, error: 'unavailable' };
  }
  return { ok: true, ref, token, status };
}

/** Creates the Google event and sends the emails for a confirmed appointment. */
async function finalise(ref: string, token: string) {
  const a = (await appointmentByRef(ref))!;
  const ev = await createEvent({
    ref,
    summary: `Online consultation with ${a.doctor_name} · AVVVS Clinic`,
    description: `Online consultation at ${CLINIC.name}.\nPatient: ${a.name}\nTo change or cancel: ${manageUrl(ref, token)}\nNot for emergencies: call 112 or 108.`,
    start: new Date(a.starts_at), end: new Date(a.ends_at),
    attendees: [{ email: a.email, name: a.name }, ...(a.doctor_email ? [{ email: a.doctor_email, name: a.doctor_name }] : [])],
  });
  await sql()`UPDATE clinic_appointments SET google_event_id = ${ev.id}, meet_url = ${ev.meetUrl}, status = 'confirmed' WHERE ref = ${ref}`;
  const when = fmtWhen(a.starts_at);
  await Promise.all([
    sendMail({
      to: a.email, subject: `Your online consultation: ${fmtDate(a.starts_at)}, ${fmtTime(a.starts_at)} · AVVVS Clinic`,
      title: `You’re booked, ${a.name.split(/\s+/)[0]}.`,
      rows: [['Doctor', a.doctor_name ?? ''], ['When', when], ['Where', 'Google Meet (video call)']],
      message: 'Join from a quiet, well-lit place a few minutes early, with any recent reports and a list of your medicines to hand. An online consultation is not for emergencies: call 112 or 108.',
      button: { label: 'Join, change or cancel', url: manageUrl(ref, token) },
    }),
    sendMail({
      to: [clinicInbox(), ...(a.doctor_email ? [a.doctor_email] : [])], replyTo: a.email,
      subject: `Online consultation booked: ${a.name} with ${a.doctor_name}, ${fmtDate(a.starts_at)} ${fmtTime(a.starts_at)}`,
      title: 'New online consultation',
      rows: [['Doctor', a.doctor_name ?? ''], ['When', when], ['Patient', a.name], ['Phone', a.phone], ['Email', a.email], ['Age', a.age || '—'], ['Meet', ev.meetUrl || '—']],
      message: a.note || '(no note)', foot: 'Manage this appointment in the clinic admin, under Consultations.',
    }),
  ]);
}

/** For a payment webhook, once a gateway is added: marks the hold as paid and confirms it. */
export async function confirmPaid(ref: string, paymentRef: string, token: string) {
  const r = await sql()`UPDATE clinic_appointments SET payment_status = 'paid', payment_ref = ${paymentRef}, hold_expires_at = NULL
    WHERE ref = ${ref} AND status = 'pending_payment' RETURNING id`;
  if (r.length) await finalise(ref, token);
}

// ---------- changes ----------

export async function cancelAppointment(a: Appointment, by: 'patient' | 'clinic') {
  if (a.status !== 'confirmed' && a.status !== 'pending_payment') return false;
  await sql()`UPDATE clinic_appointments SET status = 'cancelled', cancelled_at = now() WHERE id = ${a.id}`;
  await deleteEvent(a.google_event_id);
  const when = fmtWhen(a.starts_at);
  await Promise.all([
    sendMail({
      to: a.email, subject: 'Your online consultation is cancelled · AVVVS Clinic', title: 'Your consultation is cancelled.',
      rows: [['Doctor', a.doctor_name ?? ''], ['Was', when]],
      message: by === 'clinic' ? `The clinic had to cancel this consultation. We are sorry. Please book another time, or call ${CLINIC.phones[0]}.` : 'You can book another time whenever suits you.',
      button: { label: 'Book another time', url: abs('/consult') },
    }),
    sendMail({
      to: [clinicInbox(), ...(a.doctor_email ? [a.doctor_email] : [])],
      subject: `Online consultation cancelled by the ${by}: ${a.name}, ${fmtDate(a.starts_at)} ${fmtTime(a.starts_at)}`,
      title: 'Online consultation cancelled', rows: [['Doctor', a.doctor_name ?? ''], ['Was', when], ['Patient', a.name], ['Phone', a.phone]], message: `Cancelled by the ${by}.`,
    }),
  ]);
  return true;
}

export type MoveResult = { ok: true } | { ok: false; error: 'taken' | 'failed' };

export async function rescheduleAppointment(a: Appointment, startIso: string, by: 'patient' | 'clinic'): Promise<MoveResult> {
  if (a.status !== 'confirmed') return { ok: false, error: 'failed' };
  const minutes = Math.round((new Date(a.ends_at).getTime() - new Date(a.starts_at).getTime()) / 60_000);
  const start = new Date(startIso), end = new Date(start.getTime() + minutes * 60_000);
  // the clinic may move an appointment at shorter notice than a patient can book
  const free = await slotIsFree({ id: a.doctor_id, online_minutes: a.doctor_minutes ?? minutes }, startIso, { ignoreAppointment: a.id, notice: by === 'clinic' ? 0 : undefined });
  if (!free) return { ok: false, error: 'taken' };
  try {
    await sql()`UPDATE clinic_appointments SET starts_at = ${start.toISOString()}, ends_at = ${end.toISOString()}, reminder_sent_at = NULL WHERE id = ${a.id}`;
  } catch (e) {
    if (isUniqueViolation(e)) return { ok: false, error: 'taken' };
    throw e;
  }
  try { await moveEvent(a.google_event_id, start, end); } catch (e) { console.error('[consult] could not move the calendar event', e); }
  const when = fmtWhen(start);
  await Promise.all([
    sendMail({
      to: a.email, subject: `Your online consultation has moved: ${fmtDate(start)}, ${fmtTime(start)} · AVVVS Clinic`, title: 'Your consultation has a new time.',
      rows: [['Doctor', a.doctor_name ?? ''], ['New time', when], ['Was', fmtWhen(a.starts_at)]],
      message: by === 'clinic' ? `The clinic moved this consultation. If the new time does not suit you, call ${CLINIC.phones[0]}.` : 'The video link is the same as before.',
    }),
    sendMail({
      to: [clinicInbox(), ...(a.doctor_email ? [a.doctor_email] : [])],
      subject: `Online consultation moved by the ${by}: ${a.name}, now ${fmtDate(start)} ${fmtTime(start)}`,
      title: 'Online consultation moved', rows: [['Doctor', a.doctor_name ?? ''], ['New time', when], ['Was', fmtWhen(a.starts_at)], ['Patient', a.name], ['Phone', a.phone]], message: `Moved by the ${by}.`,
    }),
  ]);
  return { ok: true };
}

/** Slots held for a payment that never came are released (only matters once a gateway is added). */
export async function releaseExpiredHolds() {
  await sql()`UPDATE clinic_appointments SET status = 'cancelled', cancelled_at = now() WHERE status = 'pending_payment' AND hold_expires_at < now()`;
}

/** A calendar file for the patient's own calendar. */
export function icsFor(a: Appointment) {
  const t = (d: string) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AVVVS Clinic//Online consultation//EN', 'BEGIN:VEVENT',
    `UID:${a.ref}@clinic.avvvs.com`, `DTSTAMP:${t(new Date().toISOString())}`, `DTSTART:${t(a.starts_at)}`, `DTEND:${t(a.ends_at)}`,
    `SUMMARY:Online consultation with ${a.doctor_name} (AVVVS Clinic)`, `LOCATION:${a.meet_url ?? 'Google Meet'}`,
    `DESCRIPTION:Join: ${a.meet_url ?? ''}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
}
