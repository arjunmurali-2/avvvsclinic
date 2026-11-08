import type { Metadata } from 'next';
import Link from 'next/link';
import { Answer, BookInvite, Crumbs, Faq, JsonLd, TherapyBand } from '@/components/Parts';
import { CLINICS } from '@/lib/clinics';
import { breadcrumbLd, medicalPageLd } from '@/lib/ld';
import { alternatesFor } from '@/lib/site';
import { THERAPIES } from '@/lib/therapies';

const DESCRIPTION = 'Authentic Kerala Panchakarma at AVVVS Ayur Speciality Clinic, Kozhikode: Pizhichil, Shirodhara, Abhyanga, Elakizhi, Njavarakizhi and Udwarthana, with treatments for rejuvenation and healthy ageing.';

export const metadata: Metadata = {
  title: 'Kerala Panchakarma therapies in Kozhikode',
  description: DESCRIPTION,
  alternates: alternatesFor('/therapies'),
  openGraph: { url: '/therapies', title: 'Kerala Panchakarma therapies · AVVVS Ayur Speciality Clinic', description: DESCRIPTION },
};

export default function TherapiesPage() {
  return (
    <main id="main">
      <section className="ph ph-plain">
        <div className="ph-copy">
          <Crumbs trail={[{ name: 'Therapies' }]} />
          <p className="kicker" data-reveal data-now>Kerala Panchakarma</p>
          <h1 data-split data-now>The classical therapies</h1>
          <p className="ph-lede" data-reveal data-now>Warm medicated oils, medicinal leaves and rice, and the trained hands of therapists working in rhythm: Kerala’s gift to Ayurveda, given at the clinic with preparations from AVVVS.</p>
          <Answer>{DESCRIPTION} The doctor chooses each therapy, its oil or preparation, and the number of sittings after a consultation.</Answer>
        </div>
      </section>

      <TherapyBand />

      <section className="sec tp" aria-label="The therapies">
        {THERAPIES.map((t, i) => {
          const used = CLINICS.filter((c) => c.therapies.includes(t.slug));
          return (
            <article key={t.slug} id={t.slug} className="tp-item">
              <span className="tp-no" data-reveal>{String(i + 1).padStart(2, '0')}</span>
              <div className="tp-name">
                <h2 data-split>{t.name}</h2>
                <span lang="ml" data-reveal>{t.ml}</span>
              </div>
              <div className="tp-text" data-reveal>
                <p>{t.what}</p>
                <p>{t.how}</p>
                {used.length > 0 && (
                  <p className="tp-for">Offered in: {used.map((c, k) => <span key={c.slug}>{k > 0 && ', '}<Link href={`/clinics/${c.slug}`}>{c.name}</Link></span>)}</p>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <Faq id="therapy-faq" title="About the therapies" items={[
        { q: 'What is Panchakarma?', a: 'Panchakarma is the classical Ayurvedic system of five cleansing procedures. In Kerala the word is often used more widely, for the therapies that prepare for and accompany it, such as Pizhichil, Shirodhara, Elakizhi and Njavarakizhi.' },
        ...THERAPIES.map((t) => ({ q: `What is ${t.name}?`, a: `${t.name} (${t.ml}) is ${t.what.charAt(0).toLowerCase()}${t.what.slice(1)}` })),
        { q: 'Can I book a therapy without a consultation?', a: 'Therapies are chosen by the doctor after a consultation, so book a consultation first and choose “Panchakarma and rejuvenation”.' },
      ]} />
      <BookInvite care="panchakarma" title="Begin with a consultation." />
      <JsonLd data={breadcrumbLd([{ name: 'Therapies', path: '/therapies' }])} />
      <JsonLd data={medicalPageLd({ path: '/therapies', name: 'Kerala Panchakarma therapies', description: DESCRIPTION, about: 'Panchakarma' })} />
    </main>
  );
}
