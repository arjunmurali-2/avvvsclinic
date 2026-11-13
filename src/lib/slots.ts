import 'server-only';
import { ensureSchema, sql } from './db';
import { otherBusy } from './google';
import { safeImage } from './content';
import { HORIZON_DAYS, MIN_NOTICE_MIN, addDays, istDate, istInstant, weekdayOf, type DaySlots, type OnlineDoctor } from './consult';

/*
 * Free slots. A doctor's slots on a day are their weekly online hours, cut into consultations of
 * their slot length, minus: days off, appointments already booked, anything else on the clinic
 * calendar, and anything sooner than the minimum notice.
 */

export interface DoctorOnlineRow {
  id: number; slug: string; name: string; quals: string[] | string; role: string; photo_url: string | null; email: string;
  online: boolean; online_minutes: number; online_fee_paise: number | null; visible: boolean;
}

const arr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : typeof v === 'string' ? v.replace(/^\{|\}$/g, '').split(',').filter(Boolean) : []);

export const toOnlineDoctor = (d: DoctorOnlineRow): OnlineDoctor => ({
  slug: d.slug, name: d.name, quals: arr(d.quals), role: d.role || undefined,
  photo: d.photo_url && safeImage(d.photo_url) ? d.photo_url : null, minutes: d.online_minutes, feePaise: d.online_fee_paise,
});

/** Doctors who take online consultations: shown on the site, switched on, with an email and some hours. */
export async function onlineDoctorRows(): Promise<DoctorOnlineRow[]> {
  await ensureSchema();
  return (await sql()`
    SELECT d.* FROM clinic_doctors d
    WHERE d.visible AND d.online AND d.email <> '' AND EXISTS (SELECT 1 FROM clinic_availability a WHERE a.doctor_id = d.id)
    ORDER BY d.sort, d.name`) as unknown as DoctorOnlineRow[];
}

export async function onlineDoctorBySlug(slug: string) {
  return (await onlineDoctorRows()).find((d) => d.slug === slug);
}

/** Every free slot for a doctor over the booking window, grouped by India-time day. */
export async function doctorSlots(doctor: Pick<DoctorOnlineRow, 'id' | 'online_minutes'>, opts: { ignoreAppointment?: number; notice?: number } = {}): Promise<DaySlots[]> {
  await ensureSchema();
  const now = new Date();
  const first = istDate(now);
  const last = addDays(first, HORIZON_DAYS);
  const from = istInstant(first, 0), to = istInstant(last, 24 * 60);
  const len = Math.max(5, Math.min(120, doctor.online_minutes || 20));

  const [hours, off, taken, busy] = await Promise.all([
    sql()`SELECT weekday, start_min, end_min FROM clinic_availability WHERE doctor_id = ${doctor.id} ORDER BY weekday, start_min`,
    sql()`SELECT from_date, to_date FROM clinic_time_off WHERE doctor_id = ${doctor.id} AND to_date >= ${first}`,
    sql()`SELECT id, starts_at, ends_at FROM clinic_appointments WHERE doctor_id = ${doctor.id} AND status IN ('pending_payment', 'confirmed')
      AND ends_at > ${from.toISOString()} AND starts_at < ${to.toISOString()}`,
    otherBusy(from, to),
  ]);

  const blocks = [
    ...taken.filter((t) => Number(t.id) !== opts.ignoreAppointment).map((t) => ({ start: new Date(t.starts_at as string).getTime(), end: new Date(t.ends_at as string).getTime() })),
    ...busy,
  ];
  const earliest = now.getTime() + (opts.notice ?? MIN_NOTICE_MIN) * 60_000;
  const days: DaySlots[] = [];

  for (let i = 0; i <= HORIZON_DAYS; i++) {
    const date = addDays(first, i);
    if (off.some((o) => String(o.from_date) <= date && date <= String(o.to_date))) continue;
    const slots: string[] = [];
    for (const h of hours.filter((x) => Number(x.weekday) === weekdayOf(date))) {
      for (let m = Number(h.start_min); m + len <= Number(h.end_min); m += len) {
        const s = istInstant(date, m).getTime(), e = s + len * 60_000;
        if (s < earliest) continue;
        if (blocks.some((b) => b.start < e && s < b.end)) continue;
        slots.push(new Date(s).toISOString());
      }
    }
    if (slots.length) days.push({ date, slots });
  }
  return days;
}

/** Whether one exact start time is free for a doctor (re-checked on the server when booking). */
export async function slotIsFree(doctor: Pick<DoctorOnlineRow, 'id' | 'online_minutes'>, startIso: string, opts: { ignoreAppointment?: number; notice?: number } = {}) {
  const want = new Date(startIso).toISOString();
  return (await doctorSlots(doctor, opts)).some((d) => d.slots.includes(want));
}
