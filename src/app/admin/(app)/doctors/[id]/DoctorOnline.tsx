'use client';

import { useState, useTransition } from 'react';
import { WEEKDAYS } from '@/lib/consult';
import { saveDoctorOnline, type OnlineInput } from '../../../consult-actions';

const ORDER = [1, 2, 3, 4, 5, 6, 0];   // Monday first

/** A doctor's online consultation settings: email, on/off, length, fee, weekly hours, days off. */
export function DoctorOnline({ id, initial }: { id: number; initial: OnlineInput }) {
  const [d, setD] = useState<OnlineInput>(initial);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ error?: string; ok?: string }>({});
  const [pending, start] = useTransition();
  const up = (patch: Partial<OnlineInput>) => { setD((x) => ({ ...x, ...patch })); setDirty(true); setMsg({}); };
  // built from the latest state, so quick successive clicks never lose a row
  const mut = (fn: (x: OnlineInput) => Partial<OnlineInput>) => { setD((x) => ({ ...x, ...fn(x) })); setDirty(true); setMsg({}); };

  const save = (patch: Partial<OnlineInput> = {}) => start(async () => {
    const next = { ...d, ...patch };
    const r = await saveDoctorOnline(id, next);
    setMsg(r);
    if (!r.error) { setD(next); setDirty(false); }
  });

  const setHour = (i: number, patch: Partial<OnlineInput['hours'][number]>) => up({ hours: d.hours.map((h, k) => (k === i ? { ...h, ...patch } : h)) });
  const setOff = (i: number, patch: Partial<OnlineInput['off'][number]>) => up({ off: d.off.map((o, k) => (k === i ? { ...o, ...patch } : o)) });

  return (
    <section className="ad-card ad-online" aria-labelledby="online-h">
      <div className="ad-card-top">
        <h2 id="online-h">Online consultations</h2>
        <span className={`ad-pill ad-pill-${d.online ? 'published' : 'draft'}`}>{d.online ? 'On' : 'Off'}</span>
      </div>
      <p className="ad-muted">Patients book this doctor by video on the website, in the hours below. Times are India time.</p>

      <div className="ad-row3">
        <label className="ad-field"><span>Doctor’s email</span>
          <input type="email" value={d.email} onChange={(e) => up({ email: e.target.value })} placeholder="doctor@example.com" />
          <small className="ad-muted">Calendar invitations and booking emails go here.</small>
        </label>
        <label className="ad-field"><span>Length of a consultation</span>
          <select value={d.minutes} onChange={(e) => up({ minutes: Number(e.target.value) })}>
            {[10, 15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m} minutes</option>)}
          </select>
        </label>
        <label className="ad-field"><span>Fee in rupees <em>(optional)</em></span>
          <input inputMode="numeric" value={d.feeRupees} onChange={(e) => up({ feeRupees: e.target.value })} placeholder="e.g. 500" />
          <small className="ad-muted">Shown to patients. Nothing is charged on the website.</small>
        </label>
      </div>

      <fieldset className="ad-fieldset">
        <legend>Weekly online hours</legend>
        {ORDER.map((wd) => {
          const rows = d.hours.map((h, i) => ({ h, i })).filter((x) => x.h.weekday === wd);
          return (
            <div key={wd} className="ad-day">
              <span className="ad-day-name">{WEEKDAYS[wd]}</span>
              <div className="ad-day-rows">
                {rows.length === 0 && <span className="ad-muted">Not available</span>}
                {rows.map(({ h, i }) => (
                  <span key={i} className="ad-range">
                    <input type="time" step={300} value={h.from} onChange={(e) => setHour(i, { from: e.target.value })} aria-label={`${WEEKDAYS[wd]} from`} />
                    <span>to</span>
                    <input type="time" step={300} value={h.to} onChange={(e) => setHour(i, { to: e.target.value })} aria-label={`${WEEKDAYS[wd]} to`} />
                    <button type="button" className="ad-x" onClick={() => mut((x) => ({ hours: x.hours.filter((_, k) => k !== i) }))}>Remove</button>
                  </span>
                ))}
              </div>
              <button type="button" className="ad-link" onClick={() => mut((x) => { const has = x.hours.some((h) => h.weekday === wd); return { hours: [...x.hours, { weekday: wd, from: has ? '16:00' : '10:00', to: has ? '18:00' : '13:00' }] }; })}>Add hours</button>
            </div>
          );
        })}
      </fieldset>

      <fieldset className="ad-fieldset">
        <legend>Days off</legend>
        {d.off.length === 0 && <p className="ad-muted">No days off set.</p>}
        {d.off.map((o, i) => (
          <span key={i} className="ad-range">
            <input type="date" value={o.from} onChange={(e) => setOff(i, { from: e.target.value, to: o.to && o.to >= e.target.value ? o.to : e.target.value })} aria-label="First day off" />
            <span>to</span>
            <input type="date" value={o.to} min={o.from} onChange={(e) => setOff(i, { to: e.target.value })} aria-label="Last day off" />
            <input value={o.note} onChange={(e) => setOff(i, { note: e.target.value })} placeholder="Note (optional)" aria-label="Note" />
            <button type="button" className="ad-x" onClick={() => up({ off: d.off.filter((_, k) => k !== i) })}>Remove</button>
          </span>
        ))}
        <button type="button" className="ad-link" style={{ justifySelf: 'start' }} onClick={() => mut((x) => ({ off: [...x.off, { from: '', to: '', note: '' }] }))}>Add days off</button>
      </fieldset>

      {(msg.error || msg.ok) && <p className={`ad-note ${msg.error ? 'ad-note-error' : 'ad-note-ok'}`} role="status">{msg.error || msg.ok}</p>}
      <div className="ad-card-actions">
        <button type="button" className="ad-btn ad-btn-quiet" disabled={pending || !dirty} onClick={() => save()}>{pending ? 'Saving…' : dirty ? 'Save online settings' : 'Saved'}</button>
        {d.online
          ? <button type="button" className="ad-link" disabled={pending} onClick={() => save({ online: false })}>Switch online consultations off</button>
          : <button type="button" className="ad-btn" disabled={pending} onClick={() => save({ online: true })}>Switch online consultations on</button>}
      </div>
    </section>
  );
}
