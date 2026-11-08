import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Close, Crumbs, JsonLd, More } from '@/components/Parts';
import { getDoctor, getDoctors } from '@/lib/content';
import { breadcrumbLd, physicianLd } from '@/lib/ld';
import { CLINIC, DOCTORS, alternatesFor, tel } from '@/lib/site';

// A profile per doctor, so a search for a doctor's name finds a page about them (and their
// credentials sit in Physician structured data for answer engines).
export const revalidate = 300;
export function generateStaticParams() { return DOCTORS.map((d) => ({ slug: d.slug })); }

// a role the clinic has stated that names one of its clinics links there
const ROLE_LINKS: Record<string, string> = { 'Pain Management Clinic': '/clinics/pain-management-clinic' };

const summary = (d: { name: string; quals: string[]; role?: string }) =>
  `${d.name} (${d.quals.join(', ')}) is a doctor at ${CLINIC.name}, Kozhikode (Calicut)${d.role ? `: ${d.role}` : ''}.`;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const d = await getDoctor((await params).slug);
  if (!d) return {};
  return {
    title: `${d.name}, ${d.quals.join(', ')} · Kozhikode`, description: summary(d), alternates: alternatesFor(`/doctors/${d.slug}`),
    openGraph: { type: 'profile', url: `/doctors/${d.slug}`, title: `${d.name} · AVVVS Ayur Speciality Clinic`, description: summary(d), ...(d.photo ? { images: [{ url: d.photo, alt: d.name }] } : {}) },
  };
}

export default async function DoctorPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const [d, all] = await Promise.all([getDoctor(slug), getDoctors()]);
  if (!d) notFound();
  const roleLink = d.role ? ROLE_LINKS[d.role] : undefined;
  const others = all.filter((x) => x.slug !== d.slug);

  return (
    <main id="main">
      <div className="page-head" style={{ paddingBottom: 0 }}><Crumbs trail={[{ name: 'Doctors', href: '/doctors' }, { name: d.name }]} /></div>
      <section className="sec" style={{ paddingTop: 'clamp(28px, 4vw, 56px)' }} aria-labelledby="doc-name">
        <div className="split">
          <figure className="split-pic" style={{ aspectRatio: '5 / 6', background: '#E9E9EC' }} data-reveal data-now>
            {d.photo && <Image src={d.photo} alt={`Portrait of ${d.name}`} fill priority sizes="(min-width: 860px) 50vw, 100vw" style={{ objectFit: 'cover', objectPosition: '50% 18%' }} />}
          </figure>
          <div className="split-copy" data-reveal data-now data-delay="120">
            <h1 id="doc-name" className="t-1">{d.name}</h1>
            <p className="lede">{d.quals.join(' · ')}</p>
            {d.role && <p className="doctor"><b style={{ fontSize: '1.3rem' }}>{roleLink ? <Link href={roleLink}>{d.role}</Link> : d.role}</b></p>}
            <p className="muted" data-answer>{summary(d)}</p>
            <div className="actions" style={{ justifyContent: 'flex-start' }}>
              <Link className="btn" href="/book">Book a consultation</Link>
              <a className="more" href={tel(CLINIC.phones[0])}>Call {CLINIC.phones[0]}</a>
            </div>
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="sec mist" aria-labelledby="other-docs">
          <div className="in center head">
            <h2 id="other-docs" className="t-2" data-reveal>The clinic’s doctors.</h2>
            <p data-reveal><More href="/doctors">Meet them all</More></p>
          </div>
          <ul className="docs" data-stagger>
            {others.slice(0, 3).map((o) => (
              <li key={o.slug} className="doc">
                <Link href={`/doctors/${o.slug}`} className="doc-pic" aria-hidden="true" tabIndex={-1}>
                  {o.photo && <Image src={o.photo} alt="" width={600} height={720} sizes="(min-width: 1100px) 360px, 45vw" />}
                </Link>
                <h3><Link href={`/doctors/${o.slug}`} style={{ color: 'inherit' }}>{o.name}</Link></h3>
                <p>{o.quals.join(' · ')}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Close />
      <JsonLd data={physicianLd(d, `/doctors/${d.slug}`)} />
      <JsonLd data={breadcrumbLd([{ name: 'Doctors', path: '/doctors' }, { name: d.name, path: `/doctors/${d.slug}` }])} />
    </main>
  );
}
