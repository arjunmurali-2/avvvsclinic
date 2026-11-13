import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BookingForm } from '@/components/BookingForm';
import { Faq, JsonLd } from '@/components/Parts';
import { breadcrumbLd } from '@/lib/ld';
import { CLINIC, alternatesFor } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Book a consultation',
  description: `Book an Ayurveda consultation at ${CLINIC.name}, opposite Kozhikode Railway Station. Choose the care you need and a preferred day; the clinic calls to confirm.`,
  alternates: alternatesFor('/book'),
  openGraph: { url: '/book', title: `Book a consultation · ${CLINIC.name}` },
};

export default function BookPage() {
  return (
    <main id="main" className="mist">
      <Suspense fallback={<div style={{ minHeight: '100svh' }} />}>
        <BookingForm />
      </Suspense>
      <Faq title="Before you book." items={[
        { q: 'Is my appointment confirmed when I send the form?', a: 'Not yet. The form sends your request and preferred time to the clinic, and the clinic calls you to confirm the exact time.' },
        { q: 'What should I bring for my first consultation?', a: 'A list of the medicines and supplements you take, and any recent test results, scans or discharge summaries.' },
        { q: 'Can I book by phone?', a: `Yes. Call ${CLINIC.phones.join(' or ')}, or email ${CLINIC.email}.` },
      ]} />
      <JsonLd data={breadcrumbLd([{ name: 'Book a consultation', path: '/book' }])} />
    </main>
  );
}
