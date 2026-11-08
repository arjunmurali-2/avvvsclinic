'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { animate, stagger } from 'animejs';
import { CARE, SLOTS, careById, fmtDay, nextDays, validate, type Booking } from '@/lib/booking';
import { CLINIC, tel } from '@/lib/site';

type Step = 0 | 1 | 2;
const STEPS = ['Care', 'Day and time', 'Your details'];
const KEYS: ('care' | 'when' | 'you')[] = ['care', 'when', 'you'];
const EMPTY: Booking = { care: '', date: '', slot: '', name: '', phone: '', email: '', age: '', visit: '', message: '' };

/**
 * Booking a consultation, in three short steps with a running summary beside them. The clinic
 * confirms every request by phone, so the form asks for a preferred day and time of day, not a slot.
 */
export function BookingForm() {
  const params = useSearchParams();
  const [b, setB] = useState<Booking>(() => ({ ...EMPTY, care: careById(params.get('care') || '') ? params.get('care')! : '' }));
  const [step, setStep] = useState<Step>(() => (careById(params.get('care') || '') ? 1 : 0));
  const [err, setErr] = useState<Partial<Record<keyof Booking, string>>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'failed'>('idle');
  const [days, setDays] = useState<string[]>([]);
  const started = useRef(Date.now());
  const pane = useRef<HTMLDivElement>(null);

  // the next three weeks, worked out in the visitor's browser (the page itself is prerendered)
  useEffect(() => setDays(nextDays(21)), []);

  // the form mounts after the page's own choreography, so it brings itself in
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    animate('.bk-side > *', { opacity: [0, 1], y: [30, 0], duration: 1200, delay: stagger(90, { start: 150 }), ease: 'outExpo' });
    animate('.bk-card', { opacity: [0, 1], y: [50, 0], scale: [0.98, 1], duration: 1400, delay: 300, ease: 'outExpo' });
  }, []);

  // each step's choices arrive one after another
  useEffect(() => {
    const el = pane.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    animate(el.querySelectorAll('.bk-opt, .bk-day, .ef-field'), { opacity: [0, 1], y: [14, 0], duration: 700, delay: stagger(35), ease: 'outExpo' });
  }, [step, state, days.length]);

  const set = <K extends keyof Booking>(k: K, v: Booking[K]) => { setB((o) => ({ ...o, [k]: v })); setErr((e) => ({ ...e, [k]: undefined })); };
  const go = (to: Step) => {
    setStep(to);
    const top = (pane.current?.closest('.bk-card') as HTMLElement | null)?.getBoundingClientRect().top ?? 0;
    if (top < 80) window.__lenis ? window.__lenis.scrollTo(pane.current!.closest('.bk-card') as HTMLElement, { offset: -110 }) : window.scrollBy({ top: top - 110, behavior: 'smooth' });
  };
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
      if (r.ok && j.ok) {
        setState('done');
        if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.2 }); else window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      else { if (j.fields) setErr(j.fields); setState('failed'); }
    } catch { setState('failed'); }
  }

  const care = careById(b.care);
  const summary = useMemo(() => [
    { k: 'Care', v: care?.label },
    { k: 'Day', v: b.date ? fmtDay(b.date) : '' },
    { k: 'Time', v: SLOTS.find((s) => s.id === b.slot)?.label },
    { k: 'Name', v: b.name },
  ], [care, b.date, b.slot, b.name]);

  if (state === 'done') {
    return (
      <div className="bk">
        <div className="bk-side">
          <p className="kicker">Request received</p>
          <h1>Thank you, {b.name.split(/\s+/)[0]}.</h1>
        </div>
        <div className="bk-card">
          <div className="bk-done bk-pane-in" role="status">
            <svg className="ef-done-mark" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" /><path d="M20 33 l8 8 l16 -18" /></svg>
            <h2>We have your request.</h2>
            <p>The clinic will call you on <b>{b.phone}</b> to confirm a time for <b>{care?.label}</b>, on or near <b>{fmtDay(b.date)}</b> ({SLOTS.find((s) => s.id === b.slot)?.label.toLowerCase()}).</p>
            <p className="bk-consent">Need to change something? Call {CLINIC.phones[0]} or {CLINIC.phones[1]}.</p>
            <a className="btn-ghost" href="/">Back to the clinic <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bk">
      <div className="bk-side">
        <p className="kicker">Book a consultation</p>
        <h1>A time that suits you.</h1>
        <p>Tell us what you need and when you would like to come. The clinic calls back to confirm your appointment with the right doctor.</p>
        <ul className="bk-summary" aria-label="Your request so far">
          {summary.map((s) => <li key={s.k} className={s.v ? '' : 'is-empty'}><span>{s.k}</span><b>{s.v || '—'}</b></li>)}
        </ul>
        <div className="bk-direct">
          <span>Prefer to talk?</span>
          {CLINIC.phones.map((p) => <a key={p} href={tel(p)}>{p}</a>)}
        </div>
      </div>

      <div className="bk-card">
        <ol className="bk-steps" aria-label="Steps">
          {STEPS.map((s, i) => <li key={s} className={i < step ? 'is-done' : i === step ? 'is-on' : ''} aria-current={i === step ? 'step' : undefined}>{String(i + 1).padStart(2, '0')} · {s}</li>)}
        </ol>

        <form id="bk-form" noValidate onSubmit={(e) => { e.preventDefault(); next(); }}>
          <div className="ef-hp" aria-hidden="true"><label>Website <input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <div className="bk-pane bk-pane-in" key={step} ref={pane}>
            {step === 0 && (
              <fieldset className="bk-care">
                <legend className="bk-legend" style={{ gridColumn: '1 / -1' }}><h2 style={{ textTransform: 'none', letterSpacing: 0, color: 'var(--ink)' }}>What would you like help with?</h2></legend>
                {CARE.map((c) => (
                  <label key={c.id} className="bk-opt">
                    <input type="radio" name="care" value={c.id} checked={b.care === c.id} onChange={() => set('care', c.id)} />
                    <b>{c.label}</b><small>{c.note}</small>
                  </label>
                ))}
                {err.care && <p className="bk-err" style={{ gridColumn: '1 / -1' }} role="alert">{err.care}</p>}
              </fieldset>
            )}

            {step === 1 && (
              <>
                <h2>When would you like to come?</h2>
                <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
                  <legend className="bk-legend">A preferred day</legend>
                  <div className="bk-days">
                    {days.map((d) => (
                      <label key={d} className="bk-day">
                        <input type="radio" name="date" value={d} checked={b.date === d} onChange={() => set('date', d)} aria-label={fmtDay(d)} />
                        <span>{fmtDay(d, { weekday: 'short' })}</span><b>{fmtDay(d, { day: 'numeric' })}</b><span>{fmtDay(d, { month: 'short' })}</span>
                      </label>
                    ))}
                  </div>
                  {err.date && <p className="bk-err" role="alert">{err.date}</p>}
                </fieldset>
                <fieldset className="bk-slots">
                  <legend className="bk-legend">A time of day</legend>
                  {SLOTS.map((s) => (
                    <label key={s.id} className="bk-opt">
                      <input type="radio" name="slot" value={s.id} checked={b.slot === s.id} onChange={() => set('slot', s.id)} />
                      <b>{s.label}</b>
                    </label>
                  ))}
                </fieldset>
                {err.slot && <p className="bk-err" role="alert">{err.slot}</p>}
                <p className="bk-consent">This is a preference. The clinic confirms the exact time with you by phone.</p>
              </>
            )}

            {step === 2 && (
              <>
                <h2>How can the clinic reach you?</h2>
                <div className="bk-grid">
                  <Field id="name" label="Your name" value={b.name} err={err.name} onChange={(v) => set('name', v)} autoComplete="name" />
                  <Field id="phone" label="Phone (with WhatsApp, if you use it)" value={b.phone} err={err.phone} onChange={(v) => set('phone', v)} type="tel" autoComplete="tel" />
                  <Field id="email" label="Email" optional value={b.email} err={err.email} onChange={(v) => set('email', v)} type="email" autoComplete="email" />
                  <Field id="age" label="Age" optional value={b.age} err={err.age} onChange={(v) => set('age', v)} inputMode="numeric" />
                  <fieldset className="bk-visit bk-wide">
                    <legend className="bk-legend">Have you visited the clinic before?</legend>
                    {([['first', 'First visit'], ['returning', 'I have been before']] as const).map(([id, l]) => (
                      <label key={id} className="bk-opt"><input type="radio" name="visit" checked={b.visit === id} onChange={() => set('visit', id)} /><b>{l}</b></label>
                    ))}
                  </fieldset>
                  <Field id="message" label="Anything the doctor should know?" optional area value={b.message} err={err.message} onChange={(v) => set('message', v)} wide />
                </div>
                <p className="bk-consent">Your details are used only to arrange your appointment. Please do not send reports here; bring them to your consultation.</p>
                {state === 'failed' && (
                  <p className="bk-err" role="alert">The request could not be sent. Please call {CLINIC.phones[0]} or email {CLINIC.email}.</p>
                )}
              </>
            )}
          </div>

          <div className="bk-nav">
            {step > 0 ? <button type="button" className="bk-back" onClick={() => go((step - 1) as Step)}>← Back</button> : <span />}
            <button type="submit" className="cta ef-btn" disabled={state === 'sending'}>
              {state === 'sending' ? <><span className="ef-spin" aria-hidden="true" /> Sending</> : step < 2 ? <>Continue <span aria-hidden="true">→</span></> : <>Request appointment <span aria-hidden="true">→</span></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ id, label, value, onChange, err, optional, area, wide, ...rest }: {
  id: string; label: string; value: string; onChange: (v: string) => void; err?: string; optional?: boolean; area?: boolean; wide?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'id'>) {
  return (
    <div className={`ef-field${err ? ' has-error' : ''}${wide ? ' bk-wide' : ''}`}>
      {area
        ? <textarea id={id} name={id} placeholder=" " value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!err} aria-describedby={err ? `${id}-e` : undefined} />
        : <input id={id} name={id} placeholder=" " value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!err} aria-describedby={err ? `${id}-e` : undefined} required={!optional} {...rest} />}
      <label htmlFor={id}>{label}{optional && <span className="ef-opt"> (optional)</span>}</label>
      {err && <p className="ef-error" id={`${id}-e`}>{err}</p>}
    </div>
  );
}
