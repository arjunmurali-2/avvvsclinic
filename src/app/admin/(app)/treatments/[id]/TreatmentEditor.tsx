'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { checkClaims, slugify } from '@/lib/claims';
import { saveTreatment, deleteTreatment, type TreatmentInput } from '../../../actions';
import { ImagePicker } from '../../../ImagePicker';

export function TreatmentEditor({ id, initial, status: startStatus, clinics, linked }: {
  id: number; initial: TreatmentInput; status: string;
  clinics: { slug: string; name: string }[]; linked: { id: number; title: string; status: string }[];
}) {
  const [d, setD] = useState<TreatmentInput>(initial);
  const [slugTouched, setSlugTouched] = useState(!!initial.slug);
  const [status, setStatus] = useState(startStatus);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ error?: string; ok?: string }>({});
  const [pending, start] = useTransition();

  const up = (patch: Partial<TreatmentInput>) => { setD((x) => ({ ...x, ...patch })); setDirty(true); };
  const slug = slugTouched ? d.slug : slugify(d.name);
  const claims = useMemo(() => checkClaims([{ where: 'the name', text: d.name }, { where: 'the description', text: d.what }, { where: 'how it is given', text: d.how }]), [d.name, d.what, d.how]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const save = (mode: 'keep' | 'publish' | 'unpublish') => start(async () => {
    setMsg({});
    const r = await saveTreatment(id, { ...d, slug }, mode);
    if (r.error) { setMsg({ error: r.error }); return; }
    setMsg({ ok: r.ok });
    if (r.status) setStatus(r.status);
    if (r.slug) { setD((x) => ({ ...x, slug: r.slug! })); setSlugTouched(true); }
    setDirty(false);
  });

  const toggleClinic = (s: string) => up({ clinics: d.clinics.includes(s) ? d.clinics.filter((c) => c !== s) : [...d.clinics, s] });

  return (
    <div className="ad-page ad-editor">
      <div className="ad-toolbar">
        <div className="ad-state">
          <Link href="/admin/treatments" className="ad-link">Treatments</Link>
          <span className={`ad-pill ad-pill-${status}`}>{status === 'published' ? 'Published' : 'Draft'}</span>
          <span className="ad-muted">{dirty ? 'Unsaved changes' : 'All changes saved'}</span>
        </div>
        <div className="ad-actions">
          <button type="button" className="ad-btn ad-btn-quiet" disabled={pending} onClick={() => save('keep')}>{status === 'published' ? 'Save changes' : 'Save draft'}</button>
          {status === 'published'
            ? <button type="button" className="ad-btn ad-btn-quiet" disabled={pending} onClick={() => { if (confirm('Take this treatment off the site? It becomes a draft again.')) save('unpublish'); }}>Unpublish</button>
            : <button type="button" className="ad-btn" disabled={pending} onClick={() => save('publish')}>Publish</button>}
        </div>
      </div>
      {(msg.error || msg.ok) && <p className={`ad-note ${msg.error ? 'ad-note-error' : 'ad-note-ok'}`} role="status">{msg.error || msg.ok}{status === 'published' && msg.ok && <> <a href={`/therapies#${slug}`} target="_blank" rel="noopener">View it</a></>}</p>}

      <div className="ad-two">
        <div className="ad-stack">
          <label className="ad-field"><span>Name</span><input className="ad-input-big" value={d.name} onChange={(e) => up({ name: e.target.value })} placeholder="e.g. Kati Vasti" /></label>
          <div className="ad-row2">
            <label className="ad-field"><span>Name in Malayalam <em>(optional)</em></span><input lang="ml" value={d.ml} onChange={(e) => up({ ml: e.target.value })} placeholder="e.g. കടിവസ്തി" /></label>
            <label className="ad-field"><span>Web address</span>
              <span className="ad-slug">/therapies#<input value={slug} onChange={(e) => { setSlugTouched(true); up({ slug: slugify(e.target.value) || e.target.value.toLowerCase() }); }} placeholder="from-the-name" /></span>
            </label>
          </div>
          <label className="ad-field"><span>What it is</span>
            <textarea rows={3} value={d.what} onChange={(e) => up({ what: e.target.value })} placeholder="One or two sentences that say what the treatment is. Describe it; do not promise results." />
          </label>
          <label className="ad-field"><span>How it is given <em>(optional)</em></span>
            <textarea rows={3} value={d.how} onChange={(e) => up({ how: e.target.value })} placeholder="What happens during a sitting." />
          </label>

          <fieldset className="ad-fieldset">
            <legend>Offered in</legend>
            <p className="ad-muted">The treatment appears on each clinic you tick, and on the therapies page.</p>
            <div className="ad-checks">
              {clinics.map((c) => (
                <label key={c.slug} className={`ad-check${d.clinics.includes(c.slug) ? ' is-on' : ''}`}>
                  <input type="checkbox" checked={d.clinics.includes(c.slug)} onChange={() => toggleClinic(c.slug)} /> {c.name}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="ad-field ad-narrow-field"><span>Order on the therapies page</span>
            <input type="number" min={0} max={999} value={d.sort} onChange={(e) => up({ sort: Number(e.target.value) })} />
            <small className="ad-muted">Lower numbers come first, after the built-in therapies.</small>
          </label>
        </div>

        <aside className="ad-stack">
          <div className="ad-card">
            <h2>Photograph</h2>
            {d.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="ad-thumb" src={d.image.url} alt="" />
            ) : <p className="ad-muted">Portrait photographs (4:5) look best. Without one, the site uses its herbs photograph.</p>}
            <ImagePicker label={d.image ? 'Replace photograph' : 'Upload a photograph'} onPicked={(url) => up({ image: { url, alt: d.image?.alt ?? '' } })} />
            {d.image && (
              <>
                <label className="ad-field"><span>Describe it for people who cannot see it</span><input value={d.image.alt} onChange={(e) => up({ image: { ...d.image!, alt: e.target.value } })} /></label>
                <button type="button" className="ad-link" onClick={() => up({ image: null })}>Remove photograph</button>
              </>
            )}
          </div>

          <div className="ad-card">
            <h2>Journal articles</h2>
            {linked.length ? (
              <ul className="ad-list">{linked.map((p) => <li key={p.id}><Link href={`/admin/journal/${p.id}`}>{p.title}</Link> <span className="ad-muted">· {p.status === 'published' ? 'Published' : 'Draft'}</span></li>)}</ul>
            ) : <p className="ad-muted">No articles linked yet. Link one from the article&rsquo;s editor, under &ldquo;Treatments it is about&rdquo;.</p>}
          </div>

          <div className="ad-card">
            <h2>Before you publish</h2>
            {claims.length === 0
              ? <p className="ad-muted">No claim wording found. Read it once more for anything that promises a health result.</p>
              : <ul className="ad-list">{claims.map((c, k) => <li key={k}><b>&ldquo;{c.word}&rdquo;</b> in {c.where}: {c.why}. The clinic makes no outcome claims; consider rewording.</li>)}</ul>}
          </div>

          <button type="button" className="ad-link ad-danger" disabled={pending} onClick={() => { if (confirm('Delete this treatment for good? Articles linked to it keep their text.')) start(async () => { await deleteTreatment(id); }); }}>Delete this treatment</button>
        </aside>
      </div>
    </div>
  );
}
