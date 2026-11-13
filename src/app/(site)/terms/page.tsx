import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/LegalPage';
import { CLINIC, PARENT_URL, alternatesFor, tel } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms of use',
  description: `The terms for using clinic.avvvs.com, the website of ${CLINIC.name}, Kozhikode.`,
  alternates: alternatesFor('/terms'),
};

// A draft for legal review.
export default function Terms() {
  return (
    <LegalPage
      title="Terms of use"
      updated="8 November 2026"
      intro={<p>These terms apply when you use clinic.avvvs.com, the website of {CLINIC.name}, run by {CLINIC.legal} (AVVVS), Kozhikode. By using the site you accept them. They are a draft awaiting legal review.</p>}
      sections={[
        { id: 'advice', title: 'Not medical advice', body: <>
          <p>The information on this website, including the Journal, is general and for information only. It is not a diagnosis, a treatment plan or a substitute for a consultation with a qualified doctor. Do not start, stop or change any treatment because of something you read here.</p>
          <p>Photographs on this website are illustrative unless they say otherwise.</p>
        </> },
        { id: 'emergency', title: 'In an emergency', body: <>
          <p>This website and its booking form are not for emergencies. If you need urgent help, call <a href="tel:112">112</a> or an ambulance on <a href="tel:108">108</a>, or go to the nearest emergency department.</p>
        </> },
        { id: 'booking', title: 'Booking a consultation', body: <>
          <p>The booking form sends a request with your preferred day and time. An appointment is confirmed only when the clinic contacts you. The clinic may suggest another time or doctor. To change or cancel a request, call <a href={tel(CLINIC.phones[0])}>{CLINIC.phones[0]}</a> or {CLINIC.phones[1]}.</p>
          <p>Please give accurate contact details and book only for yourself, or for someone you are authorised to book for.</p>
        </> },
        { id: 'online', title: 'Online consultations', body: <>
          <p>An online consultation is a video call with one of the clinic’s doctors on Google Meet, booked for a time you choose. It is confirmed when you receive the confirmation email. You can change or cancel it up to two hours before it starts from the link in that email; after that, please call the clinic.</p>
          <p>On a video call the doctor cannot examine you in person. The doctor decides whether your concern can be handled online, and may ask you to visit the clinic or another doctor instead. Please be truthful about who you are and about your health, join from a private place, and do not record the call without the doctor’s agreement.</p>
          <p>Online consultations are not for emergencies. If a fee applies, it is shown before you book, and the clinic will tell you how to pay it.</p>
        </> },
        { id: 'care', title: 'Treatment', body: <>
          <p>Any therapy or treatment is recommended by a doctor after a consultation, and depends on your health and history. Results vary from person to person, and the clinic does not promise any particular outcome. Fees and treatment details are explained at the clinic.</p>
        </> },
        { id: 'content', title: 'Our content', body: <>
          <p>The text, design, photographs and logos on this website belong to AVVVS or are used with permission. You may share links to our pages and quote short extracts with credit, but you may not copy or republish the site’s content for commercial use without our written permission.</p>
        </> },
        { id: 'links', title: 'Links to other websites', body: <>
          <p>We link to other websites, including <a href={PARENT_URL}>avvvs.com</a>, the AVVVS Pharmacy and maps. We are not responsible for websites we do not run.</p>
        </> },
        { id: 'use', title: 'Using the site fairly', body: <>
          <p>Do not misuse the website: no attempts to break in, overload it, send automated or false booking requests, or use it for anything unlawful.</p>
        </> },
        { id: 'liability', title: 'Our responsibility', body: <>
          <p>We take care to keep this website accurate and available, but we cannot guarantee that it is always complete, current or uninterrupted. To the extent the law allows, AVVVS is not liable for loss arising from use of the website. Nothing in these terms limits any right you have under Indian consumer law.</p>
        </> },
        { id: 'law', title: 'Law and disputes', body: <>
          <p>These terms are governed by the laws of India. Disputes are subject to the courts at Kozhikode, Kerala.</p>
        </> },
        { id: 'changes', title: 'Changes and contact', body: <>
          <p>We may update these terms; the date at the top shows the latest version. Questions: <a href={`mailto:${CLINIC.email}`}>{CLINIC.email}</a>. See also our <Link href="/privacy">Privacy Policy</Link>.</p>
        </> },
      ]}
    />
  );
}
