import { CLINICS, REVIVE } from './clinics';

// Shared by the booking form (client) and the /api/book route (server).

export const CARE = [
  ...CLINICS.map((c) => ({ id: c.slug, label: c.name, note: c.lede })),
  { id: REVIVE.slug, label: 'Gloveda Revive: skin and hair', note: 'Ayur-Medi cosmetic care for skin and hair concerns.' },
  { id: 'panchakarma', label: 'Panchakarma and rejuvenation', note: 'Pizhichil, Shirodhara, Abhyanga, Elakizhi, Njavarakizhi and healthy-ageing therapies.' },
  { id: 'general', label: 'Not sure yet', note: 'A general Ayurveda consultation; the doctor will guide you.' },
] as const;

export const careById = (id: string) => CARE.find((c) => c.id === id);

export const SLOTS = [
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' },
] as const;

export interface Booking {
  care: string;
  date: string;   // YYYY-MM-DD, a preferred day
  slot: string;
  name: string;
  phone: string;
  email: string;
  age: string;
  visit: 'first' | 'returning' | '';
  message: string;
}

export const LIMITS = { name: 120, phone: 40, email: 200, age: 3, message: 2000 } as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\-\s\d]{7,20}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** The next `n` days from tomorrow, as YYYY-MM-DD in local time. */
export function nextDays(n = 21, from = new Date()) {
  const out: string[] = [];
  for (let i = 1; i <= n; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return out;
}

export function validate(b: Partial<Booking>, step: 'care' | 'when' | 'you' | 'all' = 'all') {
  const err: Partial<Record<keyof Booking, string>> = {};
  const all = step === 'all';
  if (all || step === 'care') {
    if (!b.care || !careById(b.care)) err.care = 'Choose the care you are looking for.';
  }
  if (all || step === 'when') {
    if (!b.date || !DATE_RE.test(b.date)) err.date = 'Choose a day that suits you.';
    if (!b.slot || !SLOTS.some((s) => s.id === b.slot)) err.slot = 'Choose a time of day.';
  }
  if (all || step === 'you') {
    if (!b.name?.trim()) err.name = 'Add your name.';
    if (!b.phone?.trim()) err.phone = 'Add a phone number so the clinic can confirm.';
    else if (!PHONE_RE.test(b.phone.trim())) err.phone = 'Check the phone number.';
    if (b.email?.trim() && !EMAIL_RE.test(b.email.trim())) err.email = 'Check the email address.';
    if (b.age?.trim() && !/^\d{1,3}$/.test(b.age.trim())) err.age = 'Age in years, as a number.';
    for (const k of Object.keys(LIMITS) as (keyof typeof LIMITS)[]) {
      if ((b[k]?.length ?? 0) > LIMITS[k]) err[k] = 'That is longer than we can take here.';
    }
  }
  return err;
}

export const fmtDay = (iso: string, opts: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', opts);
};
