import type { Metadata } from 'next';
import { Crumbs } from '@/components/Parts';
import { CLINIC, alternatesFor } from '@/lib/site';

export const metadata: Metadata = { title: 'Privacy', description: `How ${CLINIC.name} handles the details you send through this website.`, alternates: alternatesFor('/privacy') };

// A plain draft for legal review, matching what the site actually does.
export default function Privacy() {
  return (
    <main id="main" className="legal">
      <Crumbs trail={[{ name: 'Privacy' }]} />
      <h1>Privacy</h1>
      <p>Draft for review · November 2026</p>
      <h2>What we collect</h2>
      <p>When you request an appointment, we receive the details you enter: the care you are looking for, a preferred day and time, your name and phone number, and, if you give them, your email address, age and a note for the doctor.</p>
      <h2>How we use it</h2>
      <p>Only to arrange your appointment. Your request is emailed to the clinic, and the clinic calls you to confirm. We do not sell or share it, and we do not use it for marketing.</p>
      <h2>What this website does not do</h2>
      <p>This website sets no advertising or analytics cookies. Please do not send medical reports through the form; bring them to your consultation.</p>
      <h2>Your choices</h2>
      <p>To see, correct or delete what you sent us, write to <a href={`mailto:${CLINIC.email}`}>{CLINIC.email}</a> or call {CLINIC.phones[0]}.</p>
    </main>
  );
}
