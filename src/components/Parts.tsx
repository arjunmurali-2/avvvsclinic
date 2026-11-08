import Link from 'next/link';
import type { QA } from '@/lib/clinics';
import { faqLd } from '@/lib/ld';
import { CLINIC, tel } from '@/lib/site';
import { THERAPIES } from '@/lib/therapies';

/** Schema.org structured data. `<` is escaped so the payload can never close the script tag. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}

/** The visible breadcrumb (BreadcrumbList JSON-LD mirrors it on each page). */
export function Crumbs({ trail }: { trail: { name: string; href?: string }[] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol>
        <li><Link href="/">Home</Link></li>
        {trail.map((c, i) => (
          <li key={c.name}>{c.href && i < trail.length - 1 ? <Link href={c.href}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}</li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * "In short": the page's answer in two or three sentences, first on the page and marked speakable,
 * so search and answer engines can quote it as it stands.
 */
export function Answer({ children, label = 'In short' }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="answer" data-reveal>
      <p className="answer-h">{label}</p>
      <p data-answer>{children}</p>
    </div>
  );
}

/** Questions and answers, readable on the page and mirrored as FAQPage data. */
export function Faq({ id, title, items, kicker = 'Questions' }: { id: string; title: string; items: QA[]; kicker?: string }) {
  return (
    <section className="faq" aria-labelledby={`${id}-title`}>
      <div className="faq-side">
        <p className="kicker">{kicker}</p>
        <h2 id={`${id}-title`} className="faq-title" data-split>{title}</h2>
      </div>
      <div className="faq-list" data-stagger>
        {items.map((it, i) => (
          <details key={it.q} className="faq-item" open={i === 0}>
            <summary><span>{it.q}</span><i aria-hidden="true" /></summary>
            <p>{it.a}</p>
          </details>
        ))}
      </div>
      <JsonLd data={faqLd(items)} />
    </section>
  );
}

/** The closing invitation on every page. */
export function BookInvite({ care, title = 'Begin with a conversation.' }: { care?: string; title?: string }) {
  return (
    <section className="invite" aria-labelledby="invite-title">
      <span className="invite-thread" aria-hidden="true" />
      <div className="invite-main">
        <p className="kicker">Book a consultation</p>
        <h2 id="invite-title" data-split>{title}</h2>
        <p data-reveal>Tell us what you need and when suits you. The clinic calls back to confirm a time with the right doctor.</p>
        <div className="invite-actions" data-reveal>
          <Link className="cta cta-lg" href={care ? `/book?care=${care}` : '/book'}>Book a consultation <span aria-hidden="true">→</span></Link>
          <a className="invite-call" href={tel(CLINIC.phones[0])}>or call {CLINIC.phones[0]}</a>
        </div>
      </div>
      <ol className="invite-steps" data-stagger>
        <li><b>01</b><span>Choose the care you are looking for, and a day and time that suit you.</span></li>
        <li><b>02</b><span>The clinic calls you back to confirm your appointment.</span></li>
        <li><b>03</b><span>Come to Kaloor Central, opposite Kozhikode Railway Station, 3rd floor.</span></li>
      </ol>
    </section>
  );
}

/** An endless band of the therapies, in English and Malayalam; its speed follows the scroll. */
export function TherapyBand() {
  const items = [...THERAPIES, ...THERAPIES];
  return (
    <div className="band" data-marquee="0.45" aria-hidden="true">
      <div className="band-track">
        {items.map((t, i) => (
          <span key={i} className="band-item"><span className="band-en">{t.name}</span><span className="band-ml" lang="ml">{t.ml}</span><i /></span>
        ))}
      </div>
    </div>
  );
}

/** A thin gold thread that draws itself along the scroll, between sections. */
export function Thread({ flip = false }: { flip?: boolean }) {
  return (
    <svg className={`thread${flip ? ' is-flip' : ''}`} viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true" data-draw="scrub">
      <path d="M-10 90 C 240 10, 420 120, 720 60 S 1180 0, 1450 70" />
    </svg>
  );
}
