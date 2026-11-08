import type { Metadata } from 'next';
import { Close, Crumbs, JsonLd } from '@/components/Parts';
import { Doctors } from '@/components/Sections';
import { breadcrumbLd } from '@/lib/ld';
import { CLINIC, DOCTORS, alternatesFor } from '@/lib/site';

const DESCRIPTION = `The doctors of ${CLINIC.name}, Kozhikode: ${DOCTORS.map((d) => `${d.name} (${d.quals.join(', ')})`).join('; ')}.`;

export const metadata: Metadata = {
  title: 'Doctors',
  description: DESCRIPTION,
  alternates: alternatesFor('/doctors'),
  openGraph: { url: '/doctors', title: `Doctors · ${CLINIC.name}`, description: DESCRIPTION },
};

export default function DoctorsPage() {
  return (
    <main id="main">
      <div className="page-head" style={{ paddingBottom: 0 }}><Crumbs trail={[{ name: 'Doctors' }]} /></div>
      <Doctors page />
      <Close />
      <JsonLd data={breadcrumbLd([{ name: 'Doctors', path: '/doctors' }])} />
    </main>
  );
}
