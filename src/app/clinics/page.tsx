import type { Metadata } from 'next';
import { ClinicIndex } from '@/components/ClinicIndex';
import { Answer, BookInvite, Crumbs, Faq, JsonLd } from '@/components/Parts';
import { VisitSection } from '@/components/Sections';
import { CLINICS, REVIVE } from '@/lib/clinics';
import { breadcrumbLd, medicalPageLd } from '@/lib/ld';
import { alternatesFor } from '@/lib/site';

const DESCRIPTION = 'Seven speciality clinics at AVVVS Ayur Speciality Clinic, Kozhikode: headache, pain management, obesity management, lifestyle diseases, male and female infertility, pregnancy and postnatal care, and Gloveda Revive for skin and hair.';

export const metadata: Metadata = {
  title: 'Speciality clinics',
  description: DESCRIPTION,
  alternates: alternatesFor('/clinics'),
  openGraph: { url: '/clinics', title: 'Speciality clinics · AVVVS Ayur Speciality Clinic', description: DESCRIPTION },
};

export default function ClinicsPage() {
  return (
    <main id="main">
      <section className="ph ph-plain">
        <div className="ph-copy">
          <Crumbs trail={[{ name: 'Speciality clinics' }]} />
          <h1 data-split data-now>Speciality clinics</h1>
          <p className="ph-lede" data-reveal data-now>Specialised care for a wide range of health concerns, blending traditional Kerala Ayurveda with personalised medical care, under one roof in Kozhikode.</p>
          <Answer>{DESCRIPTION} Each begins with a consultation and a personalised plan.</Answer>
        </div>
      </section>
      <section className="sec" style={{ paddingTop: 0 }} aria-label="All speciality clinics">
        <ClinicIndex />
      </section>
      <Faq id="clinics-faq" title="Choosing a clinic" items={[
        { q: 'Which clinic should I book if I am not sure?', a: 'Choose “Not sure yet” when you book. A doctor will see you for a general Ayurveda consultation and guide you to the right speciality clinic.' },
        ...CLINICS.map((c) => ({ q: `What is the ${c.name}?`, a: c.short })),
        { q: 'What is Gloveda Revive?', a: REVIVE.short },
      ]} />
      <VisitSection />
      <BookInvite />
      <JsonLd data={breadcrumbLd([{ name: 'Speciality clinics', path: '/clinics' }])} />
      <JsonLd data={medicalPageLd({ path: '/clinics', name: 'Speciality clinics', description: DESCRIPTION })} />
    </main>
  );
}
