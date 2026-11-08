import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Answer, BookInvite, Crumbs, Faq, JsonLd, Thread } from '@/components/Parts';
import { JournalStrip } from '@/components/Sections';
import { CLINICS, REVIVE, clinicBySlug, type Clinic } from '@/lib/clinics';
import { breadcrumbLd, medicalPageLd } from '@/lib/ld';
import { DOCTOR, alternatesFor } from '@/lib/site';
import { therapyBySlug } from '@/lib/therapies';

// Gloveda Revive shares the clinic page's shape.
const REVIVE_PAGE: Clinic = {
  slug: REVIVE.slug, no: '07', name: REVIVE.name, label: 'Skin and hair', kicker: REVIVE.kicker,
  title: 'Healthy skin, beautiful hair, rooted in Ayurveda', short: REVIVE.short, lede: REVIVE.lede, body: REVIVE.body,
  focus: [
    { h: 'Ayurvedic formulations', p: 'Traditional formulations from a pharmacy that has made Ayurveda medicines in Kozhikode since 1921.' },
    { h: 'Modern technologies', p: 'Modern skin and hair care technologies, alongside the formulations.' },
    { h: 'Skin and hair concerns', p: 'Specialised solutions for a wide range of skin and hair concerns, after a consultation.' },
    { h: 'Wellness and longevity', p: 'Care that looks past the surface, to well-being and healthy ageing.' },
  ],
  therapies: ['abhyanga', 'shirodhara'],
  image: { src: '/media/k10.jpg', alt: 'Medicated oil filtered through cloth into an amber bottle', position: '50% 40%' },
  faq: [
    { q: 'What is Gloveda Revive?', a: REVIVE.short },
    { q: 'What does Gloveda Revive treat?', a: 'Gloveda Revive offers specialised solutions for a wide range of skin and hair concerns, combining traditional Ayurvedic formulations with modern skin and hair care technologies. Care is chosen after a consultation.' },
    { q: 'Where is Gloveda Revive?', a: 'At AVVVS Ayur Speciality Clinic, 3rd floor, Kaloor Central, Annie Hall Road, opposite Kozhikode Railway Station, Kozhikode 673002.' },
  ],
};

const find = (slug: string) => (slug === REVIVE.slug ? REVIVE_PAGE : clinicBySlug(slug));

export const dynamicParams = false;
export function generateStaticParams() { return [...CLINICS.map((c) => ({ slug: c.slug })), { slug: REVIVE.slug }]; }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = find((await params).slug);
  if (!c) return {};
  const title = c.slug === REVIVE.slug ? 'Gloveda Revive: Ayur-Medi Cosmetic Clinic for skin and hair' : `${c.name} in Kozhikode`;
  return {
    title, description: c.short, alternates: alternatesFor(`/clinics/${c.slug}`),
    openGraph: { url: `/clinics/${c.slug}`, title: `${title} · AVVVS`, description: c.short },
  };
}

export default async function ClinicPage({ params }: { params: Promise<{ slug: string }> }) {
  const c = find((await params).slug);
  if (!c) notFound();
  const all = [...CLINICS, REVIVE_PAGE];
  const idx = all.findIndex((x) => x.slug === c.slug);
  const others = [1, 2, 3].map((k) => all[(idx + k) % all.length]);

  return (
    <main id="main">
      <section className="ph">
        <div className="ph-copy">
          <Crumbs trail={[{ name: 'Speciality clinics', href: '/clinics' }, { name: c.name }]} />
          <p className="kicker" data-reveal data-now>{c.no} · {c.kicker}</p>
          <h1 data-split data-now>{c.name}</h1>
          <p className="ph-sub" data-reveal data-now data-delay="150">{c.title}</p>
          <div data-reveal data-now data-delay="300" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px 28px', alignItems: 'center' }}>
            <Link className="cta cta-lg" href={`/book?care=${c.slug}`}>Book a consultation <span aria-hidden="true">→</span></Link>
            {c.lead && <span style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>{c.lead}</span>}
          </div>
        </div>
        <figure className="ph-media">
          <div className="arch" data-unveil data-now>
            <Image src={c.image.src} alt={c.image.alt} fill priority sizes="(min-width: 860px) 36vw, 90vw" style={{ objectPosition: c.image.position }} />
          </div>
        </figure>
      </section>

      <section className="sec" style={{ paddingTop: 'clamp(24px, 3vw, 48px)' }}>
        <Answer>{c.short}</Answer>
      </section>

      <section className="sec cl-body" style={{ paddingTop: 0 }} aria-label={`About the ${c.name}`}>
        <div className="cl-text" data-reveal>
          <p>{c.lede}</p>
          {c.body.map((b) => <p key={b}>{b}</p>)}
        </div>
        <aside className="cl-aside" data-reveal>
          <p className="kicker">Therapies you may be offered</p>
          <ul className="chips">
            {c.therapies.map((s) => therapyBySlug(s)).filter(Boolean).map((t) => (
              <li key={t!.slug}><Link href={`/therapies#${t!.slug}`}>{t!.name} <small lang="ml">{t!.ml}</small></Link></li>
            ))}
          </ul>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem' }}>The doctor decides which therapies suit you, after a consultation.</p>
          {c.slug === 'pain-management-clinic' && (
            <div className="doc">
              <span className="doc-mono" aria-hidden="true">RK</span>
              <span className="doc-name">{DOCTOR.name}</span>
              <span className="doc-q">{DOCTOR.qualifications.map((q) => <span key={q}>{q}</span>)}</span>
            </div>
          )}
        </aside>
      </section>

      <Thread />

      <section className="sec" aria-labelledby="focus-title" style={{ paddingTop: 'clamp(32px, 4vw, 64px)' }}>
        <div className="sec-head">
          <p className="kicker">How the clinic helps</p>
          <h2 id="focus-title" data-split>{c.slug === 'headache-clinic' ? 'The headaches we see' : 'What care looks like'}</h2>
        </div>
        <ol className="focus" data-stagger>
          {c.focus.map((f, i) => (
            <li key={f.h}><b>{String(i + 1).padStart(2, '0')}</b><h3>{f.h}</h3><p>{f.p}</p></li>
          ))}
        </ol>
      </section>

      <Faq id="clinic-faq" title={`Questions about the ${c.name}`} items={c.faq} />

      <section className="wn" aria-labelledby="wn-title">
        <h2 id="wn-title" className="wn-h" data-split>Other speciality clinics</h2>
        <ol className="wn-list" data-stagger>
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={`/clinics/${o.slug}`}>
                <span className="wn-no" aria-hidden="true">{o.no}</span>
                <span className="wn-kicker">{o.kicker}</span>
                <span className="wn-title">{o.name}</span>
                <span className="wn-note">{o.lede}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {c.slug === 'headache-clinic' && <JournalStrip />}

      <BookInvite care={c.slug} title={`Book the ${c.name}.`} />
      <JsonLd data={breadcrumbLd([{ name: 'Speciality clinics', path: '/clinics' }, { name: c.name, path: `/clinics/${c.slug}` }])} />
      <JsonLd data={medicalPageLd({ path: `/clinics/${c.slug}`, name: c.name, description: c.short, about: c.name })} />
    </main>
  );
}
