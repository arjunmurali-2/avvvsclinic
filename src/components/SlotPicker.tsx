'use client';

import { useEffect, useState } from 'react';
import { fmtTime, type DaySlots } from '@/lib/consult';

/** Free slots for a doctor: a row of days, then that day's times. Shared by booking and rescheduling. */
export function useSlots(doctor: string) {
  const [days, setDays] = useState<DaySlots[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!doctor) return;
    let live = true;
    setDays(null); setFailed(false);
    fetch(`/api/consult/slots?doctor=${encodeURIComponent(doctor)}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => { if (live) { if (j.ok) setDays(j.days); else setFailed(true); } })
      .catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, [doctor, n]);
  return { days, failed, reload: () => setN((x) => x + 1) };
}

const part = (date: string, o: Intl.DateTimeFormatOptions) => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-IN', { ...o, timeZone: 'UTC' });
};

export function SlotPicker({ days, failed, value, onChange }: { days: DaySlots[] | null; failed: boolean; value: string; onChange: (iso: string) => void }) {
  const [day, setDay] = useState('');
  // times are the clinic's (India); visitors elsewhere also see their own
  const [abroad, setAbroad] = useState<string | null>(null);
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && new Date().getTimezoneOffset() !== -330) setAbroad(tz);
  }, []);
  useEffect(() => {
    if (!days?.length) return;
    const holding = days.find((d) => d.slots.includes(value));
    setDay((cur) => holding?.date ?? (days.some((d) => d.date === cur) ? cur : days[0].date));
  }, [days, value]);

  if (failed) return <p className="err" role="alert">The free times could not be loaded. Please try again in a moment.</p>;
  if (!days) return <p className="small" aria-live="polite">Finding free times…</p>;
  if (!days.length) return <p className="note">No free times in the next three weeks. Please call the clinic and we will find one for you.</p>;
  const slots = days.find((d) => d.date === day)?.slots ?? [];

  return (
    <>
      <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
        <legend className="bk-label">Day</legend>
        <div className="days">
          {days.map((d) => (
            <label key={d.date} className="day">
              <input type="radio" name="day" checked={day === d.date} onChange={() => { setDay(d.date); onChange(''); }} aria-label={part(d.date, { weekday: 'long', day: 'numeric', month: 'long' })} />
              <span>{part(d.date, { weekday: 'short' })}</span><b>{part(d.date, { day: 'numeric' })}</b><span>{part(d.date, { month: 'short' })}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
        <legend className="bk-label">Time <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(India time)</span></legend>
        <div className="times">
          {slots.map((s) => (
            <label key={s} className="opt time">
              <input type="radio" name="slot" checked={value === s} onChange={() => onChange(s)} />
              <b>{fmtTime(s)}</b>
              {abroad && <small>{fmtTime(s, abroad)} your time</small>}
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );
}
