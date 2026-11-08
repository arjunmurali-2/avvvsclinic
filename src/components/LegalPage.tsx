import type { ReactNode } from 'react';
import { Crumbs } from './Parts';

export interface LegalSection { id: string; title: string; body: ReactNode }

/** A long-form legal page: the title, a contents list, then the sections. */
export function LegalPage({ title, updated, intro, sections }: { title: string; updated: string; intro: ReactNode; sections: LegalSection[] }) {
  return (
    <main id="main">
      <section className="page-head">
        <div className="in-narrow">
          <Crumbs trail={[{ name: title }]} />
          <h1 className="t-1">{title}</h1>
          <p className="small">Last updated {updated}</p>
          <div className="lede">{intro}</div>
        </div>
      </section>
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="legal-wrap">
          <nav className="legal-toc" aria-label="On this page">
            <p className="small">On this page</p>
            <ol>{sections.map((s) => <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>)}</ol>
          </nav>
          <div className="prose legal-prose">
            {sections.map((s) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`}>
                <h2 id={`${s.id}-h`}>{s.title}</h2>
                {s.body}
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
