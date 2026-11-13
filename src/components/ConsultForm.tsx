'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { fmtWhen, rupees, validateConsult, type ConsultInput, type OnlineDoctor } from '@/lib/consult';
import { CLINIC, tel } from '@/lib/site';
import { trackBooking } from '@/lib/track';
import { SlotPicker, useSlots } from './SlotPicker';

type Step = 0 | 1 | 2;
const STEPS = ['Doctor', 'Time', 'Your details'];

/** Booking an online consultation: choose a doctor, pick a real free time, give your details. */
export function ConsultForm({ doctors }: { doctors: OnlineDoctor[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const preset = doctors.find((d) => d.slug === params.get('doctor'))?.slug ?? (doctors.length === 1 ? doctors[0].slug : '');
  const [c, setC] = useState<ConsultInput>({ doctor: preset, start: '', name: '', phone: '', email: '', age: '', note: '', consent: false });
  const [step, setStep] = useState<Step>(preset ? 1 : 0);
  const [err, setErr] = useState<Partial<Record<keyof ConsultInput, string>>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'failed' | 'taken'>('idle');
  const started = useRef(Date.now());
  const top = useRef<HTMLDivElement>(null);
  const { days, failed, reload } = useSlots(c.doctor);
  const doctor = doctors.find((d) => d.slug === c.doctor);

  const set = <K extends keyof ConsultInput>(k: K, v: ConsultInput[K]) => { setC((o) => ({ ...o, [k]: v })); setErr((e) => ({ ...e, [k]: undefined })); };
  const go = (to: Step) => {
    setStep(to);
    const el = top.current;
    if (el && el.getBoundingClientRect().top < 0) { if (window.__lenis) window.__lenis.scrollTo(el, { offset: -80 }); else el.scrollIntoView({ behavior: 'smooth' }); }
  };

  const next = () => {
    if (step === 0) { if (!c.doctor) return setErr({ doctor: 'Choose a doctor.' }); return go(1); }
    if (step === 1) { if (!c.start) return setErr({ start: 'Choose a time.' }); return go(2); }
    const e = validateConsult(c);
    setErr(e);
    if (!Object.keys(e).length) void submit();
  };

  async function submit() {
    setState('sending');
    try {
      const fd = new FormData(document.getElementById('consult-form') as HTMLFormElement);
      const r = await fetch('/api/consult', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...c, website: fd.get('website') || '', startedAt: started.current }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) { trackBooking('online'); router.push(`/consult/${j.ref}?t=${j.token}&new=1`); return; }
      if (j.error === 'taken') { setState('taken'); set('start', ''); reload(); go(1); return; }
      if (j.fields) setErr(j.fields);
      setState('failed');
    } catch { setState('failed'); }
  }

  return (
    <div className="bk" ref={top}>
      <div className="bk-top">
        <p className="choice"><Link href="/book">Visit the clinic</Link><Link href="/consult" aria-current="page">Online by video</Link></p>
        <h1 className="t-1">Online consultation.</h1>
        <p className="lede">See one of the clinic’s doctors by video, from wherever you are. Pick a time and the Google Meet link arrives by email.</p>
      </div>

      <ol className="bk-steps" aria-label="Steps">
        {STEPS.map((s, i) => <li key={s} className={i < step ? 'is-done' : i === step ? 'is-on' : ''} aria-current={i === step ? 'step' : undefined}>{s}</li>)}
      </ol>

      <div className="bk-card">
        <form id="consult-form" noValidate onSubmit={(e) => { e.preventDefault(); next(); }}>
          <div className="hp" aria-hidden="true"><label>Website <input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <div className="bk-pane" key={step}>
            {step === 0 && (
              <>
                <h2>Who would you like to see?</h2>
                <fieldset className="bk-care">
                  <legend className="hp">Doctor</legend>
                  {doctors.map((d) => (
                    <label key={d.slug} className="opt opt-doc">
                      <input type="radio" name="doctor" checked={c.doctor === d.slug} onChange={() => { set('doctor', d.slug); set('start', ''); }} />
                      <span className="opt-pic">{d.photo && <Image src={d.photo} alt="" width={112} height={134} />}</span>
                      <span><b>{d.name}</b><small>{d.quals.join(' · ')}</small><small>{d.minutes} minutes{d.feePaise ? ` · ${rupees(d.feePaise)}` : ''}</small></span>
                    </label>
                  ))}
                </fieldset>
                {err.doctor && <p className="err" role="alert">{err.doctor}</p>}
              </>
            )}

            {step === 1 && doctor && (
              <>
                <h2>When suits you?</h2>
                <p className="small" style={{ textAlign: 'center', marginTop: -12 }}>{doctor.name} · {doctor.minutes} minutes by Google Meet</p>
                {state === 'taken' && <p className="err" role="alert">Someone has just taken that time. Please choose another.</p>}
                <SlotPicker days={days} failed={failed} value={c.start} onChange={(s) => { set('start', s); if (state === 'taken') setState('idle'); }} />
                {err.start && <p className="err" role="alert">{err.start}</p>}
              </>
            )}

            {step === 2 && doctor && (
              <>
                <h2>Your details</h2>
                <p className="small" style={{ textAlign: 'center', marginTop: -12 }}>{doctor.name} · {fmtWhen(c.start)}</p>
                <div className="grid2">
                  <Field id="name" label="Name" value={c.name} err={err.name} onChange={(v) => set('name', v)} autoComplete="name" />
                  <Field id="email" label="Email" hint="The video link is sent here." value={c.email} err={err.email} onChange={(v) => set('email', v)} type="email" autoComplete="email" />
                  <Field id="phone" label="Phone" value={c.phone} err={err.phone} onChange={(v) => set('phone', v)} type="tel" autoComplete="tel" />
                  <Field id="age" label="Age" optional value={c.age} err={err.age} onChange={(v) => set('age', v)} inputMode="numeric" />
                  <Field id="note" label="What would you like to talk about?" optional area value={c.note} err={err.note} onChange={(v) => set('note', v)} wide />
                </div>
                <label className={`consent${err.consent ? ' has-error' : ''}`}>
                  <input type="checkbox" checked={c.consent} onChange={(e) => set('consent', e.target.checked)} />
                  <span>I agree to consult the doctor online by video. I understand the doctor cannot examine me in person and may ask me to visit the clinic, and that this is not for emergencies. <Link href="/terms#online" target="_blank">Terms</Link> · <Link href="/privacy" target="_blank">Privacy</Link></span>
                </label>
                {err.consent && <p className="err" role="alert">{err.consent}</p>}
                {state === 'failed' && <p className="err" role="alert">The booking could not be made. Please try again, or call {CLINIC.phones[0]}.</p>}
              </>
            )}
          </div>

          <div className="bk-nav">
            {step > 0 ? <button type="button" className="bk-back" onClick={() => go((step - 1) as Step)}>Back</button> : <span />}
            <button type="submit" className="btn" disabled={state === 'sending'}>
              {state === 'sending' ? <><span className="spin" aria-hidden="true" /> Booking</> : step < 2 ? 'Continue' : 'Book the consultation'}
            </button>
          </div>
        </form>
      </div>
      <p className="small" style={{ textAlign: 'center', marginTop: 18 }}>Rather come in? <Link href="/book">Book a visit to the clinic</Link>, or call <a href={tel(CLINIC.phones[0])}>{CLINIC.phones[0]}</a>.</p>
    </div>
  );
}

function Field({ id, label, hint, value, onChange, err, optional, area, wide, ...rest }: {
  id: string; label: string; hint?: string; value: string; onChange: (v: string) => void; err?: string; optional?: boolean; area?: boolean; wide?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'id'>) {
  return (
    <div className={`field${err ? ' has-error' : ''}${wide ? ' wide' : ''}`}>
      <label htmlFor={id}>{label}{optional && <span> (optional)</span>}</label>
      {area
        ? <textarea id={id} name={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!err} />
        : <input id={id} name={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!err} required={!optional} {...rest} />}
      {err ? <p className="err">{err}</p> : hint ? <p className="small">{hint}</p> : null}
    </div>
  );
}
