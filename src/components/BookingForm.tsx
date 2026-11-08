'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { animate, stagger } from 'animejs';
import { CARE, SLOTS, careById, fmtDay, nextDays, validate, type Booking } from '@/lib/booking';
import { CLINIC, tel } from '@/lib/site';

type Step = 0 | 1 | 2;
const STEPS = ['Care', 'Day and time', 'Your details'];
const KEYS: ('care' | 'when' | 'you')[] = ['care', 'when', 'you'];
const EMPTY: Booking = { care: '', date: '', slot: '', name: '', phone: '', email: '', age: '', visit: '', message: '' };

/**
 * Booking a consultation in three short steps. The clinic confirms every request by phone, so the
 * form asks for a preferred day and a time of day, not a fixed slot.
 */
export function BookingForm() {
  const params = useSearchParams();
  const preset = careById(params.get('care') || '') ? params.get('care')! : '';
  const [b, setB] = useState<Booking>({ ...EMPTY, care: preset });
  const [step, setStep] = useState<Step>(preset ? 1 : 0);
  const [err, setErr] = useState<Partial<Record<keyof Booking, string>>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'failed'>('idle');
  const [days, setDays] = useState<string[]>([]);
  const started = useRef(Date.now());
  const pane = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLDivElement>(null);

  useEffect(() => setDays(nextDays(21)), []);

  // the form mounts after the page's choreography, so it brings itself in
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    animate('.bk-top > *, .bk-steps, .bk-card', { opacity: [0, 1], y: [24, 0], duration: 1200, delay: stagger(80, { start: 100 }), ease: 'outExpo' });
  }, []);
  useEffect(() => {
    const el = pane.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    animate(el.querySelectorAll('.opt, .day, .field'), { opacity: [0, 1], y: [10, 0], duration: 600, delay: stagger(25), ease: 'outExpo' });
  }, [step, days.length]);

  const set = <K extends keyof Booking>(k: K, v: Booking[K]) => { setB((o) => ({ ...o, [k]: v })); setErr((e) => ({ ...e, [k]: undefined })); };
  const toTop = () => {
    const el = top.current;
    if (!el || el.getBoundingClientRect().top > 0) return;
    if (window.__lenis) window.__lenis.scrollTo(el, { offset: -80 }); else el.scrollIntoView({ behavior: 'smooth' });
  };
  const go = (to: Step) => { setStep(to); toTop(); };
  const next = () => {
    const e = validate(b, KEYS[step]);
    setErr(e);
    if (Object.keys(e).length) return;
    if (step < 2) go((step + 1) as Step); else void submit();
  };

  async function submit() {
    setState('sending');
    try {
      const fd = new FormData(document.getElementById('bk-form') as HTMLFormElement);
      const r = await fetch('/api/book', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...b, website: fd.get('website') || '', startedAt: started.current }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) { setState('done'); toTop(); }
      else { if (j.fields) setErr(j.fields); setState('failed'); }
    } catch { setState('failed'); }
  }

  const care = careById(b.care);
  const slot = SLOTS.find((s) => s.id === b.slot)?.label;

  if (state === 'done') {
    return (
      <div className="bk" ref={top}>
        <div className="bk-card">
          <div className="bk-done" role="status">
            <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" /><path d="M20 33 l8 8 l16 -18" /></svg>
            <h1 className="t-2">Thank you, {b.name.split(/\s+/)[0]}.</h1>
            <p className="lede">The clinic will call you on {b.phone} to confirm a time for {care?.label}, on or near {fmtDay(b.date)}, {slot?.toLowerCase()}.</p>
            <p className="small">Need to change something? Call {CLINIC.phones[0]} or {CLINIC.phones[1]}.</p>
            <Link className="btn btn-light" href="/">Back to the clinic</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bk" ref={top}>
      <div className="bk-top">
        <h1 className="t-1">Book a consultation.</h1>
        <p className="lede">Tell us what you need and when you would like to come. The clinic calls back to confirm your appointment.</p>
      </div>

      <ol className="bk-steps" aria-label="Steps">
        {STEPS.map((s, i) => <li key={s} className={i < step ? 'is-done' : i === step ? 'is-on' : ''} aria-current={i === step ? 'step' : undefined}>{s}</li>)}
      </ol>

      <div className="bk-card">
        <form id="bk-form" noValidate onSubmit={(e) => { e.preventDefault(); next(); }}>
          <div className="hp" aria-hidden="true"><label>Website <input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <div className="bk-pane" key={step} ref={pane}>
            {step === 0 && (
              <>
                <h2>What would you like help with?</h2>
                <fieldset className="bk-care">
                  <legend className="hp">Care</legend>
                  {CARE.map((c) => (
                    <label key={c.id} className="opt">
                      <input type="radio" name="care" value={c.id} checked={b.care === c.id} onChange={() => set('care', c.id)} />
                      <b>{c.label}</b><small>{c.note}</small>
                    </label>
                  ))}
                </fieldset>
                {err.care && <p className="err" role="alert">{err.care}</p>}
              </>
            )}

            {step === 1 && (
              <>
                <h2>When would you like to come?</h2>
                <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
                  <legend className="bk-label">A preferred day</legend>
                  <div className="days">
                    {days.map((d) => (
                      <label key={d} className="day">
                        <input type="radio" name="date" value={d} checked={b.date === d} onChange={() => set('date', d)} aria-label={fmtDay(d)} />
                        <span>{fmtDay(d, { weekday: 'short' })}</span><b>{fmtDay(d, { day: 'numeric' })}</b><span>{fmtDay(d, { month: 'short' })}</span>
                      </label>
                    ))}
                  </div>
                  {err.date && <p className="err" role="alert">{err.date}</p>}
                </fieldset>
                <fieldset className="slots">
                  <legend className="bk-label">A time of day</legend>
                  {SLOTS.map((s) => (
                    <label key={s.id} className="opt"><input type="radio" name="slot" value={s.id} checked={b.slot === s.id} onChange={() => set('slot', s.id)} /><b>{s.label}</b></label>
                  ))}
                </fieldset>
                {err.slot && <p className="err" role="alert">{err.slot}</p>}
                <p className="small" style={{ textAlign: 'center' }}>A preference only. The clinic confirms the exact time with you by phone.</p>
              </>
            )}

            {step === 2 && (
              <>
                <h2>How can the clinic reach you?</h2>
                <div className="grid2">
                  <Field id="name" label="Name" value={b.name} err={err.name} onChange={(v) => set('name', v)} autoComplete="name" />
                  <Field id="phone" label="Phone" value={b.phone} err={err.phone} onChange={(v) => set('phone', v)} type="tel" autoComplete="tel" />
                  <Field id="email" label="Email" optional value={b.email} err={err.email} onChange={(v) => set('email', v)} type="email" autoComplete="email" />
                  <Field id="age" label="Age" optional value={b.age} err={err.age} onChange={(v) => set('age', v)} inputMode="numeric" />
                  <fieldset className="seg wide">
                    <legend className="bk-label">Have you visited before?</legend>
                    {([['first', 'First visit'], ['returning', 'I have been before']] as const).map(([id, l]) => (
                      <label key={id} className="opt"><input type="radio" name="visit" checked={b.visit === id} onChange={() => set('visit', id)} /><b>{l}</b></label>
                    ))}
                  </fieldset>
                  <Field id="message" label="Anything the doctor should know?" optional area value={b.message} err={err.message} onChange={(v) => set('message', v)} wide />
                </div>
                <p className="small">Your details are used only to arrange your appointment. Please bring medical reports to the consultation rather than sending them here.</p>
                {state === 'failed' && <p className="err" role="alert">The request could not be sent. Please call {CLINIC.phones[0]} or email {CLINIC.email}.</p>}
              </>
            )}
          </div>

          <div className="bk-nav">
            {step > 0 ? <button type="button" className="bk-back" onClick={() => go((step - 1) as Step)}>Back</button> : <span />}
            <button type="submit" className="btn" disabled={state === 'sending'}>
              {state === 'sending' ? <><span className="spin" aria-hidden="true" /> Sending</> : step < 2 ? 'Continue' : 'Request appointment'}
            </button>
          </div>
        </form>
      </div>

      {(care || b.date) && (
        <p className="bk-summary" aria-label="Your request so far">
          {care && <span><b>{care.label}</b></span>}
          {b.date && <span>{fmtDay(b.date)}{slot ? `, ${slot.toLowerCase()}` : ''}</span>}
        </p>
      )}
      <p className="small" style={{ textAlign: 'center', marginTop: 18 }}>Prefer to talk? Call <a href={tel(CLINIC.phones[0])}>{CLINIC.phones[0]}</a> or <a href={tel(CLINIC.phones[1])}>{CLINIC.phones[1]}</a>.</p>
    </div>
  );
}

function Field({ id, label, value, onChange, err, optional, area, wide, ...rest }: {
  id: string; label: string; value: string; onChange: (v: string) => void; err?: string; optional?: boolean; area?: boolean; wide?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'id'>) {
  return (
    <div className={`field${err ? ' has-error' : ''}${wide ? ' wide' : ''}`}>
      <label htmlFor={id}>{label}{optional && <span> (optional)</span>}</label>
      {area
        ? <textarea id={id} name={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!err} aria-describedby={err ? `${id}-e` : undefined} />
        : <input id={id} name={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!err} aria-describedby={err ? `${id}-e` : undefined} required={!optional} {...rest} />}
      {err && <p className="err" id={`${id}-e`}>{err}</p>}
    </div>
  );
}
