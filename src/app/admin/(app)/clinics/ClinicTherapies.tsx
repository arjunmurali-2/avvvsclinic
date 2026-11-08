'use client';

import { useState, useTransition } from 'react';
import { resetBuiltInLinks, setClinicTherapies, type FormState } from '../../actions';
import { Note } from '../../AdminForms';

/** One clinic: every therapy as a checkbox, saved together. */
export function ClinicTherapies({ clinic, name, therapies, initial }: {
  clinic: string; name: string; therapies: { slug: string; name: string; note: string }[]; initial: string[];
}) {
  const [picked, setPicked] = useState<string[]>(initial);
  const [saved, setSaved] = useState<string[]>(initial);
  const [msg, setMsg] = useState<FormState>({});
  const [pending, start] = useTransition();
  const dirty = picked.length !== saved.length || picked.some((s) => !saved.includes(s));

  const toggle = (s: string) => { setMsg({}); setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s])); };
  const save = () => start(async () => {
    const r = await setClinicTherapies(clinic, picked);
    setMsg(r);
    if (!r.error) setSaved(picked);
  });

  return (
    <section className="ad-card">
      <div className="ad-card-top">
        <h2>{name}</h2>
        <a className="ad-link" href={`/clinics/${clinic}`} target="_blank" rel="noopener">View</a>
      </div>
      <p className="ad-muted">{picked.length ? `${picked.length} therapies shown` : 'No therapies shown: the section is hidden on this clinic’s page.'}</p>
      <div className="ad-checks ad-checks-tight">
        {therapies.map((t) => (
          <label key={t.slug} className={`ad-check${picked.includes(t.slug) ? ' is-on' : ''}`}>
            <input type="checkbox" checked={picked.includes(t.slug)} onChange={() => toggle(t.slug)} /> {t.name}
            {t.note && <span className="ad-muted"> ({t.note})</span>}
          </label>
        ))}
      </div>
      <div className="ad-card-actions">
        <button type="button" className="ad-btn" disabled={pending || !dirty} onClick={save}>{pending ? 'Saving…' : dirty ? 'Save' : 'Saved'}</button>
        {dirty && <button type="button" className="ad-link" onClick={() => setPicked(saved)}>Undo changes</button>}
      </div>
      <Note s={msg} />
    </section>
  );
}

export function ResetLinks() {
  const [msg, setMsg] = useState<FormState>({});
  const [pending, start] = useTransition();
  return (
    <div className="ad-stack" style={{ justifyItems: 'end' }}>
      <button type="button" className="ad-btn ad-btn-quiet" disabled={pending}
        onClick={() => { if (confirm('Put the six built-in therapies back on their original clinics? Treatments added here are not changed.')) start(async () => { setMsg(await resetBuiltInLinks()); location.reload(); }); }}>
        Restore the original links
      </button>
      <Note s={msg} />
    </div>
  );
}
