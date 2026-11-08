import type { Metadata } from 'next';
import { Close, Crumbs, Faq, JsonLd } from '@/components/Parts';
import { ClinicTiles, Visit } from '@/components/Sections';
import { CLINICS, REVIVE } from '@/lib/clinics';
import { breadcrumbLd, medicalPageLd } from '@/lib/ld';
import { alternatesFor } from '@/lib/site';

const DESCRIPTION = 'Six speciality clinics at AVVVS Ayur Speciality Clinic, Kozhikode: headache, pain management, obesity and lifestyle management, male and female infertility, pregnancy and postnatal care, and Gloveda Revive for skin and hair.';

export const metadata: Metadata = {
  title: 'Speciality clinics',
  description: DESCRIPTION,
  alternates: alternatesFor('/clinics'),
  openGraph: { url: '/clinics', title: 'Speciality clinics · AVVVS Ayur Speciality Clinic', description: DESCRIPTION },
};

export default function ClinicsPage() {
  return (
    <main id="main">
      <section className="page-head">
        <div className="in-narrow">
          <Crumbs trail={[{ name: 'Clinics' }]} />
          <h1 className="t-1" data-reveal data-now>Six clinics. One roof.</h1>
          <p className="lede" data-reveal data-now data-delay="120" data-answer>{DESCRIPTION}</p>
        </div>
      </section>
      <section className="sec" style={{ paddingTop: 0 }} aria-label="All speciality clinics">
        <ClinicTiles />
      </section>
      <Faq title="Choosing a clinic." tone="mist" items={[
        { q: 'Which clinic should I book if I am not sure?', a: 'Choose “Not sure yet” when you book. A doctor will see you for a general Ayurveda consultation and guide you to the right speciality clinic.' },
        ...CLINICS.map((c) => ({ q: `What is the ${c.name}?`, a: c.short })),
        { q: 'What is Gloveda Revive?', a: REVIVE.short },
      ]} />
      <Visit />
      <Close />
      <JsonLd data={breadcrumbLd([{ name: 'Speciality clinics', path: '/clinics' }])} />
      <JsonLd data={medicalPageLd({ path: '/clinics', name: 'Speciality clinics', description: DESCRIPTION })} />
    </main>
  );
}
