'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import type { Block } from '@/lib/journal';
import { checkClaims, slugify } from '@/lib/claims';
import { savePost, deletePost, type PostInput } from '../../../actions';
import { ImagePicker } from '../../../ImagePicker';

type T = Block['t'];
const LABELS: Partial<Record<T, string>> = { p: 'Paragraph', h2: 'Heading', ul: 'List', note: 'Note', quote: 'Pull quote', img: 'Image' };
const ADD: T[] = ['p', 'h2', 'ul', 'note', 'quote', 'img'];

function empty(t: T): Block {
  switch (t) {
    case 'ul': return { t, items: [''] };
    case 'note': return { t, h: '', text: '' };
    case 'img': return { t, url: '', alt: '', caption: '' };
    case 'h2': case 'quote': return { t, text: '' };
    default: return { t: 'p', text: '' };
  }
}

const textOf = (b: Block) => ('text' in b ? b.text : '') + ('items' in b && Array.isArray(b.items) ? (b.items as unknown[]).map((x) => (typeof x === 'string' ? ` ${x}` : '')).join('') : '') + ('h' in b ? ` ${b.h}` : '');

function Grow({ value, onChange, placeholder, className = '' }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { const t = ref.current; if (t) { t.style.height = 'auto'; t.style.height = `${t.scrollHeight}px`; } }, [value]);
  return <textarea ref={ref} rows={2} className={`ad-grow ${className}`} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
}

function BlockFields({ b, set }: { b: Block; set: (b: Block) => void }) {
  switch (b.t) {
    case 'p': return <Grow value={b.text} onChange={(text) => set({ ...b, text })} placeholder="Write a paragraph." />;
    case 'h2': return <input className="ad-input-h" value={b.text} onChange={(e) => set({ ...b, text: e.target.value })} placeholder="Section heading" />;
    case 'quote': return <Grow className="ad-grow-big" value={b.text} onChange={(text) => set({ ...b, text })} placeholder="A sentence worth setting large" />;
    case 'note': return (
      <>
        <input value={b.h} onChange={(e) => set({ ...b, h: e.target.value })} placeholder="Note heading, e.g. When to see a doctor first" />
        <Grow value={b.text} onChange={(text) => set({ ...b, text })} placeholder="The note" />
      </>
    );
    case 'ul': return (
      <>
        {b.items.map((it, k) => (
          <div className="ad-item" key={k}>
            <input value={it} placeholder={`Item ${k + 1}`} onChange={(e) => set({ ...b, items: b.items.map((x, j) => (j === k ? e.target.value : x)) })} />
            <button type="button" className="ad-x" aria-label="Remove item" onClick={() => set({ ...b, items: b.items.filter((_, j) => j !== k) })}>Remove</button>
          </div>
        ))}
        <button type="button" className="ad-link" onClick={() => set({ ...b, items: [...b.items, ''] })}>Add item</button>
      </>
    );
    case 'img': return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {b.url && <img className="ad-thumb" src={b.url} alt="" />}
        <ImagePicker label={b.url ? 'Replace image' : 'Upload an image'} onPicked={(url) => set({ ...b, url })} />
        <input value={b.alt} onChange={(e) => set({ ...b, alt: e.target.value })} placeholder="Describe the image for people who cannot see it (required)" />
        <input value={b.caption ?? ''} onChange={(e) => set({ ...b, caption: e.target.value })} placeholder="Caption (optional)" />
      </>
    );
    default: return null;
  }
}

function Preview({ d }: { d: PostInput & { body: Block[] } }) {
  return (
    <div className="ad-preview">
      <p className="ad-muted">{d.kind}</p>
      <h1>{d.title || 'Title'}</h1>
      <p className="ad-preview-dek">{d.dek || 'The summary appears here.'}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {d.cover && <img className="ad-preview-cover" src={d.cover.url} alt={d.cover.alt} />}
      <div className="prose">
        {d.answer && <p className="first">{d.answer}</p>}
        {d.body.map((b, i) => {
          switch (b.t) {
            case 'p': return b.text.trim() ? <p key={i}>{b.text}</p> : null;
            case 'h2': return b.text.trim() ? <h2 key={i}>{b.text}</h2> : null;
            case 'quote': return b.text.trim() ? <p key={i} style={{ fontFamily: 'var(--f-head)', fontSize: '1.4em', color: 'var(--ink)' }}>{b.text}</p> : null;
            case 'ul': return <ul key={i}>{b.items.filter(Boolean).map((x, k) => <li key={k}>{x}</li>)}</ul>;
            case 'note': return <aside key={i} className="note"><b>{b.h}</b><p>{b.text}</p></aside>;
            // eslint-disable-next-line @next/next/no-img-element
            case 'img': return b.url ? <figure key={i} style={{ margin: 0 }}><img src={b.url} alt={b.alt} style={{ width: '100%', borderRadius: 14 }} />{b.caption && <figcaption className="small">{b.caption}</figcaption>}</figure> : null;
            default: return null;
          }
        })}
      </div>
    </div>
  );
}

export function PostEditor({ id, initial, status: startStatus, author, kinds, clinics, treatments }: {
  id: number; initial: PostInput & { body: Block[] }; status: string; author: string; kinds: string[];
  clinics: { slug: string; name: string }[]; treatments: { slug: string; name: string; note: string }[];
}) {
  const [d, setD] = useState(initial.body.length ? initial : { ...initial, body: [empty('p')] });
  const [slugTouched, setSlugTouched] = useState(!!initial.slug);
  const [status, setStatus] = useState(startStatus);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ error?: string; ok?: string }>({});
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [pending, start] = useTransition();

  const up = (patch: Partial<typeof d>) => { setD((x) => ({ ...x, ...patch })); setDirty(true); };
  const slug = slugTouched ? d.slug : slugify(d.title);
  const claims = useMemo(() => checkClaims([
    { where: 'the title', text: d.title }, { where: 'the summary', text: d.dek }, { where: 'the short answer', text: d.answer },
    ...d.body.map((b, i) => ({ where: `block ${i + 1}`, text: textOf(b) })),
  ]), [d.title, d.dek, d.answer, d.body]);
  const words = `${d.dek} ${d.answer} ${d.body.map(textOf).join(' ')}`.split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const setBlock = (i: number, b: Block) => up({ body: d.body.map((x, j) => (j === i ? b : x)) });
  const move = (i: number, by: number) => {
    const j = i + by;
    if (j < 0 || j >= d.body.length) return;
    const body = [...d.body];
    [body[i], body[j]] = [body[j], body[i]];
    up({ body });
  };
  const insert = (i: number, t: T) => up({ body: [...d.body.slice(0, i), empty(t), ...d.body.slice(i)] });
  const toggleT = (s: string) => up({ treatments: d.treatments.includes(s) ? d.treatments.filter((x) => x !== s) : [...d.treatments, s] });

  const save = (mode: 'keep' | 'publish' | 'unpublish') => start(async () => {
    setMsg({});
    const r = await savePost(id, { ...d, slug }, mode);
    if (r.error) { setMsg({ error: r.error }); return; }
    setMsg({ ok: r.ok });
    if (r.status) setStatus(r.status);
    if (r.slug) { setD((x) => ({ ...x, slug: r.slug! })); setSlugTouched(true); }
    setDirty(false);
  });

  return (
    <div className="ad-page ad-editor">
      <div className="ad-toolbar">
        <div className="ad-state">
          <Link href="/admin/journal" className="ad-link">Journal</Link>
          <span className={`ad-pill ad-pill-${status}`}>{status === 'published' ? 'Published' : 'Draft'}</span>
          <span className="ad-muted">{dirty ? 'Unsaved changes' : 'All changes saved'}</span>
        </div>
        <div className="ad-seg" role="tablist" aria-label="View">
          <button role="tab" aria-selected={tab === 'write'} onClick={() => setTab('write')}>Write</button>
          <button role="tab" aria-selected={tab === 'preview'} onClick={() => setTab('preview')}>Preview</button>
        </div>
        <div className="ad-actions">
          <button type="button" className="ad-btn ad-btn-quiet" disabled={pending} onClick={() => save('keep')}>{status === 'published' ? 'Save changes' : 'Save draft'}</button>
          {status === 'published'
            ? <button type="button" className="ad-btn ad-btn-quiet" disabled={pending} onClick={() => { if (confirm('Take this article off the Journal? It becomes a draft again.')) save('unpublish'); }}>Unpublish</button>
            : <button type="button" className="ad-btn" disabled={pending} onClick={() => save('publish')}>Publish</button>}
        </div>
      </div>
      {(msg.error || msg.ok) && <p className={`ad-note ${msg.error ? 'ad-note-error' : 'ad-note-ok'}`} role="status">{msg.error || msg.ok}{status === 'published' && msg.ok && <> <a href={`/journal/${slug}`} target="_blank" rel="noopener">View it</a></>}</p>}

      {tab === 'preview' ? <Preview d={{ ...d, slug }} /> : (
        <div className="ad-two">
          <div className="ad-stack">
            <Grow className="ad-grow-title" value={d.title} onChange={(title) => up({ title })} placeholder="Title" />
            <label className="ad-field"><span>Summary</span><Grow value={d.dek} onChange={(dek) => up({ dek })} placeholder="One or two sentences shown under the title and in search results." /></label>
            <label className="ad-field"><span>The short answer</span><Grow value={d.answer} onChange={(answer) => up({ answer })} placeholder="Answer the title's question in two or three sentences, so search and AI answers can quote it as it stands." /></label>

            <ol className="ad-blocks">
              {d.body.map((b, i) => (
                <li key={i} className="ad-block">
                  <div className="ad-block-head">
                    <span>{LABELS[b.t]}</span>
                    <span className="ad-block-tools">
                      <button type="button" onClick={() => move(i, -1)} disabled={i === 0}>Up</button>
                      <button type="button" onClick={() => move(i, 1)} disabled={i === d.body.length - 1}>Down</button>
                      <button type="button" onClick={() => up({ body: d.body.filter((_, j) => j !== i) })}>Delete</button>
                    </span>
                  </div>
                  <BlockFields b={b} set={(nb) => setBlock(i, nb)} />
                  <div className="ad-insert" aria-label="Add a block below">
                    {ADD.map((t) => <button type="button" key={t} onClick={() => insert(i + 1, t)}>+ {LABELS[t]}</button>)}
                  </div>
                </li>
              ))}
            </ol>
            {d.body.length === 0 && <div className="ad-insert is-open">{ADD.map((t) => <button type="button" key={t} onClick={() => insert(0, t)}>+ {LABELS[t]}</button>)}</div>}
          </div>

          <aside className="ad-stack">
            <div className="ad-card">
              <h2>Links</h2>
              <label className="ad-field"><span>Clinic</span>
                <select value={d.clinic} onChange={(e) => up({ clinic: e.target.value })}>
                  <option value="">Not linked to a clinic</option>
                  {clinics.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </label>
              <fieldset className="ad-fieldset">
                <legend>Treatments it is about</legend>
                <div className="ad-checks ad-checks-tight">
                  {treatments.map((t) => (
                    <label key={t.slug} className={`ad-check${d.treatments.includes(t.slug) ? ' is-on' : ''}`}>
                      <input type="checkbox" checked={d.treatments.includes(t.slug)} onChange={() => toggleT(t.slug)} /> {t.name}{t.note && <span className="ad-muted"> ({t.note})</span>}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
            <div className="ad-card">
              <h2>Details</h2>
              <label className="ad-field"><span>Section</span>
                <select value={d.kind} onChange={(e) => up({ kind: e.target.value })}>{kinds.map((k) => <option key={k}>{k}</option>)}</select>
              </label>
              <label className="ad-field"><span>Web address</span>
                <span className="ad-slug">/journal/<input value={slug} onChange={(e) => { setSlugTouched(true); up({ slug: slugify(e.target.value) || e.target.value.toLowerCase() }); }} placeholder="from-the-title" /></span>
              </label>
              <span className="ad-field"><span>Cover image</span></span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {d.cover && <img className="ad-thumb" src={d.cover.url} alt="" />}
              <ImagePicker label={d.cover ? 'Replace cover' : 'Upload a cover (wide works best)'} onPicked={(url) => up({ cover: { url, alt: d.cover?.alt ?? '' } })} />
              {d.cover && (
                <>
                  <label className="ad-field"><span>Describe the cover</span><input value={d.cover.alt} onChange={(e) => up({ cover: { ...d.cover!, alt: e.target.value } })} /></label>
                  <button type="button" className="ad-link" onClick={() => up({ cover: null })}>Remove cover</button>
                </>
              )}
            </div>
            <div className="ad-card">
              <h2>Before you publish</h2>
              {claims.length === 0
                ? <p className="ad-muted">No claim wording found. Read it once more for anything that promises a health result.</p>
                : <ul className="ad-list">{claims.map((c, k) => <li key={k}><b>&ldquo;{c.word}&rdquo;</b> in {c.where}: {c.why}.</li>)}</ul>}
              <p className="ad-muted">About {Math.max(1, Math.round(words / 200))} min read · by {author}</p>
            </div>
            <button type="button" className="ad-link ad-danger" disabled={pending} onClick={() => { if (confirm('Delete this article for good? This cannot be undone.')) start(async () => { await deletePost(id); }); }}>Delete this article</button>
          </aside>
        </div>
      )}
    </div>
  );
}
