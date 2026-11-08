import type { Metadata } from 'next';
import { Answer, BookInvite, Crumbs, Faq, JsonLd } from '@/components/Parts';
import { VisitSection } from '@/components/Sections';
import { breadcrumbLd } from '@/lib/ld';
import { CLINIC, alternatesFor } from '@/lib/site';

const DESCRIPTION = `${CLINIC.name}: 3rd floor, Kaloor Central, Annie Hall Road, opposite Kozhikode Railway Station, Kozhikode 673002. Phone ${CLINIC.phones.join(', ')}. Email ${CLINIC.email}.`;

export const metadata: Metadata = {
  title: 'Visit and contact',
  description: DESCRIPTION,
  alternates: alternatesFor('/visit'),
  openGraph: { url: '/visit', title: `Visit · ${CLINIC.name}`, description: DESCRIPTION },
};

export default function VisitPage() {
  return (
    <main id="main">
      <section className="ph ph-plain">
        <div className="ph-copy">
          <Crumbs trail={[{ name: 'Visit' }]} />
          <h1 data-split data-now>Visit the clinic</h1>
          <p className="ph-lede" data-reveal data-now>In the heart of Kozhikode, across the road from the railway station: a welcoming space to heal, relax and rejuvenate.</p>
          <Answer>{DESCRIPTION}</Answer>
        </div>
      </section>
      <VisitSection heading="Three floors up, across from the trains." />
      <Faq id="visit-faq" title="Getting here" items={[
        { q: 'What is the clinic’s address?', a: `${CLINIC.name}, ${CLINIC.address.lines.join(', ')}.` },
        { q: 'Is the clinic near Kozhikode Railway Station?', a: 'Yes, directly opposite it, on Annie Hall Road. The clinic is on the 3rd floor of Kaloor Central.' },
        { q: 'How do I contact the clinic?', a: `Call ${CLINIC.phones.join(' or ')}, or email ${CLINIC.email}.` },
      ]} />
      <BookInvite />
      <JsonLd data={breadcrumbLd([{ name: 'Visit', path: '/visit' }])} />
    </main>
  );
}
