import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Close, Crumbs, Faq, JsonLd } from '@/components/Parts';
import { clinicName, getPosts, getTherapies } from '@/lib/content';
import { breadcrumbLd, itemListLd, medicalPageLd, therapiesLd } from '@/lib/ld';
import { alternatesFor } from '@/lib/site';

export const revalidate = 300;

const DESCRIPTION = 'Authentic Kerala Panchakarma at AVVVS Ayur Speciality Clinic, Kozhikode: Pizhichil, Shirodhara, Abhyanga, Elakizhi, Njavarakizhi and Udwarthana, with treatments for rejuvenation and healthy ageing.';

export const metadata: Metadata = {
  title: 'Panchakarma and Kerala therapies in Kozhikode (Calicut)',
  description: DESCRIPTION,
  alternates: alternatesFor('/therapies'),
  openGraph: { url: '/therapies', title: 'Kerala Panchakarma therapies · AVVVS Ayur Speciality Clinic', description: DESCRIPTION },
};

const and = (items: React.ReactNode[]) => items.map((x, k) => <span key={k}>{k > 0 && (k === items.length - 1 ? ' and ' : ', ')}{x}</span>);

export default async function TherapiesPage() {
  const [therapies, posts] = await Promise.all([getTherapies(), getPosts()]);
  return (
    <main id="main">
      <section className="page-head">
        <div className="in-narrow">
          <Crumbs trail={[{ name: 'Therapies' }]} />
          <h1 className="t-1" data-reveal data-now>Given by hand.</h1>
          <p className="lede" data-reveal data-now data-delay="120" data-answer>{DESCRIPTION} The doctor chooses each therapy, its oil and the number of sittings after a consultation.</p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 'clamp(24px, 3vw, 48px)' }} aria-label="The therapies">
        <div className="th">
          {therapies.map((t) => {
            const clinics = t.clinics ?? [];
            const reading = posts.filter((p) => p.treatments?.includes(t.slug));
            return (
              <article key={t.slug} id={t.slug} className="th-item">
                <figure className="th-pic" data-reveal>
                  <Image src={t.img} alt="" width={1200} height={1500} sizes="(min-width: 860px) 50vw, 100vw" style={{ objectPosition: t.pos }} />
                </figure>
                <div className="th-copy" data-reveal data-delay="100">
                  <h2 className="t-2"><Link href={`/therapies/${t.slug}`} style={{ color: 'inherit' }}>{t.name}</Link></h2>
                  {t.ml && <span className="g-ml" lang="ml">{t.ml}</span>}
                  <p>{t.what}</p>
                  {t.how && <p className="muted">{t.how}</p>}
                  {clinics.length > 0 && <p className="small">Offered in {and(clinics.map((c) => <Link key={c} href={`/clinics/${c}`}>{clinicName(c)}</Link>))}.</p>}
                  {reading.length > 0 && <p className="small">Read: {and(reading.map((p) => <Link key={p.slug} href={`/journal/${p.slug}`}>{p.title}</Link>))}.</p>}
                  <p className="small"><Link href={`/therapies/${t.slug}`}>{t.name} at the clinic</Link></p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <Faq title="About the therapies." tone="mist" items={[
        { q: 'What is Panchakarma?', a: 'Panchakarma is the classical Ayurvedic system of five cleansing procedures. In Kerala the word is often used more widely, for the therapies that prepare for and accompany it, such as Pizhichil, Shirodhara, Elakizhi and Njavarakizhi.' },
        ...therapies.map((t) => ({ q: `What is ${t.name}?`, a: `${t.name}${t.ml ? ` (${t.ml})` : ''} is ${t.what.charAt(0).toLowerCase()}${t.what.slice(1)}` })),
        { q: 'Can I book a therapy without a consultation?', a: 'Therapies are chosen by the doctor after a consultation, so book a consultation first and choose “Panchakarma and rejuvenation”.' },
      ]} />
      <Close care="panchakarma" title="Begin with a consultation." />
      <JsonLd data={breadcrumbLd([{ name: 'Therapies', path: '/therapies' }])} />
      <JsonLd data={itemListLd('Kerala therapies at AVVVS Ayur Speciality Clinic', therapies.map((t) => ({ name: t.name, path: `/therapies/${t.slug}` })))} />
      <JsonLd data={therapiesLd(therapies)} />
      <JsonLd data={medicalPageLd({ path: '/therapies', name: 'Kerala Panchakarma therapies', description: DESCRIPTION, about: 'Panchakarma' })} />
    </main>
  );
}
