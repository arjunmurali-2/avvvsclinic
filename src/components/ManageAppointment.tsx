'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CLINIC } from '@/lib/site';
import { SlotPicker, useSlots } from './SlotPicker';

/** Add to calendar, move or cancel: the patient's controls on their own appointment page. */
export function ManageAppointment({ refId, token, doctor, current, canChange }: { refId: string; token: string; doctor: string; current: string; canChange: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<'idle' | 'move'>('idle');
  const [start, setStart] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const { days, failed, reload } = useSlots(mode === 'move' ? doctor : '');

  async function act(action: 'cancel' | 'reschedule') {
    setBusy(true); setMsg('');
    try {
      const r = await fetch(`/api/consult/${refId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, action, start }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) { setMode('idle'); setStart(''); router.replace(`/consult/${refId}?t=${token}`); router.refresh(); return; }
      if (j.error === 'taken') { setMsg('That time has just been taken. Please choose another.'); setStart(''); reload(); }
      else if (j.error === 'too-late') setMsg(`It is too close to the consultation to change it here. Please call ${CLINIC.phones[0]}.`);
      else setMsg(`That did not work. Please try again, or call ${CLINIC.phones[0]}.`);
    } catch { setMsg(`That did not work. Please try again, or call ${CLINIC.phones[0]}.`); }
    finally { setBusy(false); }
  }

  return (
    <div className="manage">
      <div className="actions">
        <a className="more" href={`/api/consult/${refId}/ics?t=${encodeURIComponent(token)}`}>Add to my calendar</a>
        {canChange && mode === 'idle' && <button type="button" className="cc-link" onClick={() => setMode('move')}>Change the time</button>}
        {canChange && mode === 'idle' && (
          <button type="button" className="cc-link" disabled={busy} onClick={() => { if (confirm('Cancel this online consultation?')) void act('cancel'); }}>Cancel</button>
        )}
      </div>
      {!canChange && <p className="small">To change or cancel now, please call {CLINIC.phones[0]}.</p>}
      {mode === 'move' && (
        <div className="manage-move">
          <SlotPicker days={days ? days.map((d) => ({ ...d, slots: d.slots.filter((s) => s !== current) })).filter((d) => d.slots.length) : days} failed={failed} value={start} onChange={setStart} />
          <div className="actions">
            <button type="button" className="btn" disabled={!start || busy} onClick={() => void act('reschedule')}>{busy ? 'Moving…' : 'Move to this time'}</button>
            <button type="button" className="cc-link" onClick={() => { setMode('idle'); setStart(''); setMsg(''); }}>Keep my time</button>
          </div>
        </div>
      )}
      {msg && <p className="err" role="alert">{msg}</p>}
    </div>
  );
}
