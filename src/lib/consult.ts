// Online consultations: what the browser and the server share. Times are India Standard Time
// (UTC+5:30, no daylight saving), so a clinic day is the same day for everyone at the clinic.

export const IST_OFFSET_MIN = 330;
export const MIN_NOTICE_MIN = 180;      // the soonest a slot can be booked: three hours ahead
export const HORIZON_DAYS = 21;         // how far ahead patients can book
export const CANCEL_CUTOFF_MIN = 120;   // patients can cancel or move until two hours before

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

const pad = (n: number) => String(n).padStart(2, '0');

/** The India-time calendar date (YYYY-MM-DD) of an instant. */
export function istDate(d: Date) {
  const t = new Date(d.getTime() + IST_OFFSET_MIN * 60_000);
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/** The instant of `minutes` after midnight, India time, on a YYYY-MM-DD date. */
export function istInstant(date: string, minutes: number) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, minutes) - IST_OFFSET_MIN * 60_000);
}

export const weekdayOf = (date: string) => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};

export function addDays(date: string, n: number) {
  const [y, m, d] = date.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

export const hhmm = (min: number) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
export const toMin = (s: string) => { const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim()); return m ? Number(m[1]) * 60 + Number(m[2]) : NaN; };

const IST = 'Asia/Kolkata';
/** "10:30 am", in India time. */
export const fmtTime = (iso: string | Date, tz: string = IST) =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz });
/** "Saturday, 14 November", in India time. */
export const fmtDate = (iso: string | Date, tz: string = IST) =>
  new Date(iso).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: tz });
export const fmtWhen = (iso: string | Date) => `${fmtDate(iso)} at ${fmtTime(iso)} (India time)`;
export const rupees = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export interface OnlineDoctor { slug: string; name: string; quals: string[]; role?: string; photo: string | null; minutes: number; feePaise: number | null }
export interface DaySlots { date: string; slots: string[] }   // slot starts, as ISO instants

export interface ConsultInput { doctor: string; start: string; name: string; phone: string; email: string; age: string; note: string; consent: boolean }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\-\s\d]{7,20}$/;

export function validateConsult(c: Partial<ConsultInput>) {
  const err: Partial<Record<keyof ConsultInput, string>> = {};
  if (!c.doctor) err.doctor = 'Choose a doctor.';
  if (!c.start || Number.isNaN(Date.parse(c.start))) err.start = 'Choose a time.';
  if (!c.name?.trim()) err.name = 'Add your name.';
  else if (c.name.length > 120) err.name = 'That is longer than we can take here.';
  if (!c.phone?.trim()) err.phone = 'Add a phone number, in case the call drops.';
  else if (!PHONE_RE.test(c.phone.trim())) err.phone = 'Check the phone number.';
  if (!c.email?.trim()) err.email = 'Add your email: the video link is sent to it.';
  else if (!EMAIL_RE.test(c.email.trim())) err.email = 'Check the email address.';
  if (c.age?.trim() && !/^\d{1,3}$/.test(c.age.trim())) err.age = 'Age in years, as a number.';
  if ((c.note?.length ?? 0) > 2000) err.note = 'That is longer than we can take here.';
  if (!c.consent) err.consent = 'Please tick the box to agree to an online consultation.';
  return err;
}
