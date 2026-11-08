import Link from 'next/link';
import type { QA } from '@/lib/clinics';
import { faqLd } from '@/lib/ld';
import { CLINIC, tel } from '@/lib/site';

/** Schema.org structured data. `<` is escaped so the payload can never close the script tag. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}

export function Chevron() {
  return <svg viewBox="0 0 8 14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 1.5 6.5 7l-5 5.5" /></svg>;
}

/** A text link with Apple's travelling chevron. */
export function More({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link className="more" href={href}>{children}<Chevron /></Link>;
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

/** Questions and answers, readable on the page and mirrored as FAQPage data. */
export function Faq({ title = 'Questions', items, tone = '' }: { title?: string; items: QA[]; tone?: string }) {
  return (
    <section className={`sec ${tone}`} aria-labelledby="faq-title">
      <div className="in-narrow center head"><h2 id="faq-title" className="t-2" data-reveal>{title}</h2></div>
      <div className="qa" data-stagger>
        {items.map((it, i) => (
          <details key={it.q} open={i === 0}>
            <summary><span>{it.q}</span><svg viewBox="0 0 14 14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M7 1v12M1 7h12" /></svg></summary>
            <p>{it.a}</p>
          </details>
        ))}
      </div>
      <JsonLd data={faqLd(items)} />
    </section>
  );
}

/** The closing invitation, one line and one action. */
export function Close({ care, title = 'Begin with a conversation.' }: { care?: string; title?: string }) {
  return (
    <section className="sec" aria-labelledby="close-title">
      <div className="in-narrow close">
        <h2 id="close-title" className="t-1" data-reveal>{title}</h2>
        <p className="lede" data-reveal data-delay="80">Choose the care you need and a time that suits you. The clinic calls back to confirm.</p>
        <div className="actions" data-reveal data-delay="160">
          <Link className="btn" href={care ? `/book?care=${care}` : '/book'}>Book a consultation</Link>
          <a className="more" href={tel(CLINIC.phones[0])}>Call {CLINIC.phones[0]}<Chevron /></a>
        </div>
      </div>
    </section>
  );
}
