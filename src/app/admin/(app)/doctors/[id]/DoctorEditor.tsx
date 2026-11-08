'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { saveDoctor, deleteDoctor, type DoctorInput } from '../../../actions';
import { ImagePicker } from '../../../ImagePicker';

export function DoctorEditor({ id, slug, initial }: { id: number; slug: string | null; initial: DoctorInput }) {
  const [d, setD] = useState<DoctorInput>(initial);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ error?: string; ok?: string }>({});
  const [pending, start] = useTransition();
  const up = (patch: Partial<DoctorInput>) => { setD((x) => ({ ...x, ...patch })); setDirty(true); setMsg({}); };

  const save = (patch: Partial<DoctorInput> = {}) => start(async () => {
    const next = { ...d, ...patch };
    const r = await saveDoctor(id, next);
    setMsg(r);
    if (!r.error) { setD(next); setDirty(false); }
  });

  const quals = d.quals.split(/[,·\n]+/).map((q) => q.trim()).filter(Boolean);

  return (
    <div className="ad-page ad-editor">
      <div className="ad-toolbar">
        <div className="ad-state">
          <Link href="/admin/doctors" className="ad-link">Doctors</Link>
          <span className={`ad-pill ad-pill-${d.visible ? 'published' : 'draft'}`}>{d.visible ? 'Shown on the site' : 'Hidden'}</span>
          <span className="ad-muted">{dirty ? 'Unsaved changes' : 'All changes saved'}</span>
        </div>
        <div className="ad-actions">
          <button type="button" className="ad-btn ad-btn-quiet" disabled={pending} onClick={() => save()}>Save</button>
          {d.visible
            ? <button type="button" className="ad-btn ad-btn-quiet" disabled={pending} onClick={() => save({ visible: false })}>Hide from the site</button>
            : <button type="button" className="ad-btn" disabled={pending} onClick={() => save({ visible: true })}>Show on the site</button>}
        </div>
      </div>
      {(msg.error || msg.ok) && <p className={`ad-note ${msg.error ? 'ad-note-error' : 'ad-note-ok'}`} role="status">{msg.error || msg.ok}{d.visible && msg.ok && slug && <> <a href={`/doctors#${slug}`} target="_blank" rel="noopener">View</a></>}</p>}

      <div className="ad-two">
        <div className="ad-stack">
          <label className="ad-field"><span>Name</span><input className="ad-input-big" value={d.name} onChange={(e) => up({ name: e.target.value })} placeholder="Dr. Firstname Lastname" /></label>
          <label className="ad-field"><span>Qualifications</span>
            <input value={d.quals} onChange={(e) => up({ quals: e.target.value })} placeholder="BAMS, MD (Ayu)" />
            <small className="ad-muted">Separate them with commas. They are shown in this order.</small>
          </label>
          <label className="ad-field"><span>Role <em>(optional)</em></span>
            <input value={d.role} onChange={(e) => up({ role: e.target.value })} placeholder="e.g. Pain Management Clinic" />
            <small className="ad-muted">A single line under the qualifications. Leave it empty if the clinic has not stated one.</small>
          </label>
          <label className="ad-field ad-narrow-field"><span>Order</span>
            <input type="number" min={0} max={9999} value={d.sort} onChange={(e) => up({ sort: Number(e.target.value) })} />
            <small className="ad-muted">Lower numbers come first. You can also move doctors on the list.</small>
          </label>
        </div>

        <aside className="ad-stack">
          <div className="ad-card">
            <h2>Portrait</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {d.photo ? <img className="ad-thumb ad-thumb-portrait" src={d.photo} alt="" /> : <p className="ad-muted">A head-and-shoulders portrait on a plain light background, like the others, looks best.</p>}
            <ImagePicker label={d.photo ? 'Replace portrait' : 'Upload a portrait'} onPicked={(url) => up({ photo: url })} />
          </div>
          <div className="ad-card">
            <h2>Preview</h2>
            <div className="doc" style={{ maxWidth: 280, justifySelf: 'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <span className="doc-pic">{d.photo && <img src={d.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 18%' }} />}</span>
              <h3>{d.name || 'Name'}</h3>
              <p>{quals.join(' · ') || 'Qualifications'}</p>
              {d.role && <p className="doc-role">{d.role}</p>}
            </div>
          </div>
          <button type="button" className="ad-link ad-danger" disabled={pending}
            onClick={() => { if (confirm(`Delete ${d.name || 'this doctor'} for good? To take them off the site but keep them here, use “Hide from the site” instead.`)) start(async () => { await deleteDoctor(id); }); }}>
            Delete this doctor
          </button>
        </aside>
      </div>
    </div>
  );
}
