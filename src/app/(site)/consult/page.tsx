import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { ConsultForm } from '@/components/ConsultForm';
import { Faq, JsonLd } from '@/components/Parts';
import { hasDatabase } from '@/lib/db';
import { canCreateEvents } from '@/lib/google';
import { breadcrumbLd, medicalPageLd } from '@/lib/ld';
import { onlineDoctorRows, toOnlineDoctor } from '@/lib/slots';
import { CLINIC, alternatesFor, tel } from '@/lib/site';

// the doctors and whether booking is open come from the database, so this page is always fresh
export const dynamic = 'force-dynamic';

const DESCRIPTION = `Book an online Ayurveda consultation by video with a doctor at ${CLINIC.name}, Kozhikode. Choose a doctor and a time; the Google Meet link arrives by email.`;

export const metadata: Metadata = {
  title: 'Online Ayurveda consultation by video',
  description: DESCRIPTION,
  alternates: alternatesFor('/consult'),
  openGraph: { url: '/consult', title: `Online Ayurveda consultation · ${CLINIC.name}`, description: DESCRIPTION },
};

const FAQ = [
  { q: 'How does an online consultation work?', a: 'Choose a doctor and a free time, and give your name, email and phone. You get an email with a Google Meet link at once. At your time, open the link on a phone or computer to talk to the doctor by video.' },
  { q: 'What do I need for the video call?', a: 'A phone, tablet or computer with a camera and microphone, and a steady internet connection. Google Meet opens in a web browser; on a phone, the free Google Meet app works best.' },
  { q: 'Can I change or cancel my online consultation?', a: 'Yes, up to two hours before it starts, from the link in your confirmation email. After that, please call the clinic.' },
  { q: 'Can every problem be handled online?', a: 'No. The doctor cannot examine you in person on a video call, and may ask you to visit the clinic for an examination or for therapies. Online consultations are not for emergencies: call 112 or 108.' },
  { q: 'Can I consult from outside Kerala or outside India?', a: 'Yes. Times are shown in India time, and in your own local time if you are elsewhere.' },
];

export default async function ConsultPage() {
  const doctors = hasDatabase() ? (await onlineDoctorRows().catch(() => [])).map(toOnlineDoctor) : [];
  const open = doctors.length > 0 && (await canCreateEvents());
  return (
    <main id="main" className="mist">
      {open ? (
        <Suspense fallback={<div style={{ minHeight: '100svh' }} />}><ConsultForm doctors={doctors} /></Suspense>
      ) : (
        <div className="bk">
          <div className="bk-top">
            <h1 className="t-1">Online consultation.</h1>
            <p className="lede" data-answer>Online booking is not open at the moment. To arrange a video consultation with one of the clinic’s doctors, call <a href={tel(CLINIC.phones[0])}>{CLINIC.phones[0]}</a>.</p>
            <Link className="btn" href="/book">Book a visit to the clinic</Link>
          </div>
        </div>
      )}
      <Faq title="How it works." items={FAQ} />
      <JsonLd data={breadcrumbLd([{ name: 'Online consultation', path: '/consult' }])} />
      <JsonLd data={medicalPageLd({ path: '/consult', name: 'Online Ayurveda consultation', description: DESCRIPTION })} />
    </main>
  );
}
