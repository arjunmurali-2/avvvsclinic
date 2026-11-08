import type { Metadata } from 'next';
import { Close, Crumbs, JsonLd } from '@/components/Parts';
import { Doctors } from '@/components/Sections';
import { breadcrumbLd } from '@/lib/ld';
import { CLINIC, alternatesFor } from '@/lib/site';
import { getDoctors } from '@/lib/content';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const doctors = await getDoctors();
  const description = `The doctors of ${CLINIC.name}, Kozhikode: ${doctors.map((d) => `${d.name} (${d.quals.join(', ')})`).join('; ')}.`;
  return { title: 'Doctors', description, alternates: alternatesFor('/doctors'), openGraph: { url: '/doctors', title: `Doctors · ${CLINIC.name}`, description } };
}

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
