import type { Metadata } from 'next';
import Link from 'next/link';
import { CookieSettingsLink } from '@/components/CookieConsent';
import { LegalPage } from '@/components/LegalPage';
import { CLINIC, alternatesFor, tel } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${CLINIC.name} handles the personal information you share through this website, the cookies it uses, and your rights under India’s Digital Personal Data Protection Act, 2023.`,
  alternates: alternatesFor('/privacy'),
};

// A draft for legal review. It describes what the site actually does; change the two together.
export default function Privacy() {
  const mail = <a href={`mailto:${CLINIC.email}`}>{CLINIC.email}</a>;
  return (
    <LegalPage
      title="Privacy Policy"
      updated="8 November 2026"
      intro={<p>This policy explains what {CLINIC.name} collects through clinic.avvvs.com, why, who it is shared with, and the choices and rights you have. It is a draft awaiting legal review.</p>}
      sections={[
        { id: 'who', title: 'Who we are', body: <>
          <p>{CLINIC.name} is the clinic of {CLINIC.legal} (AVVVS), {CLINIC.address.lines.join(', ')}, India. For this website, AVVVS is the data fiduciary: it decides why and how your personal data is used.</p>
          <p>Contact us about privacy at {mail} or {CLINIC.phones[0]}.</p>
        </> },
        { id: 'collect', title: 'What we collect', body: <>
          <p><b>When you book a consultation</b>, the form asks for the care you are looking for, a preferred day and time of day, your name and phone number, and, if you choose to give them, your email address, age, whether you have visited before, and a note for the doctor.</p>
          <p>A note for the doctor may describe your health. Please share only what helps the clinic arrange your appointment, and bring medical reports to the consultation rather than sending them through the website.</p>
          <p><b>When you browse</b>, the website’s host keeps short-lived technical logs (such as IP address and browser type) to run and secure the site. With your consent, Google Analytics and the Meta Pixel also collect usage information, as described under Cookies below.</p>
        </> },
        { id: 'use', title: 'How we use it', body: <>
          <ul>
            <li>To arrange your appointment: the clinic calls or writes to you to confirm a time.</li>
            <li>To reply to you, if you emailed or called.</li>
            <li>With your consent, to understand how the website is used and to measure our advertising.</li>
            <li>To keep the website secure and to meet legal obligations.</li>
          </ul>
          <p>We do not sell your personal data, and we do not use your booking details for marketing.</p>
        </> },
        { id: 'basis', title: 'Your consent', body: <>
          <p>We process booking details because you give them to us to request an appointment, and analytics and advertising data only with the consent you choose in the cookie banner. You can withdraw consent at any time: change your <CookieSettingsLink label="cookie settings" />, or ask us to delete your booking details. Withdrawing consent does not affect what was done before.</p>
        </> },
        { id: 'share', title: 'Who it is shared with', body: <>
          <ul>
            <li><b>The clinic’s team</b>, who arrange and confirm appointments.</li>
            <li><b>Our email provider</b>, which carries the booking request to the clinic’s inbox.</li>
            <li><b>Our website host</b> (Vercel), which runs the site and keeps short technical logs.</li>
            <li><b>Google</b> (Analytics) and <b>Meta</b> (Pixel), only if you allow them. They never receive what you type in the booking form.</li>
          </ul>
          <p>Some of these providers process data outside India. We share only what each needs to provide its service.</p>
        </> },
        { id: 'cookies', title: 'Cookies and similar technologies', body: <>
          <ul>
            <li><b>Essential:</b> your cookie choice, kept in your browser’s local storage. Always on.</li>
            <li><b>Analytics (optional):</b> Google Analytics 4, which sets cookies to count visits and see which pages are used.</li>
            <li><b>Marketing (optional):</b> the Meta Pixel, which measures our advertising on Facebook and Instagram.</li>
          </ul>
          <p>Optional tags do not load until you allow them. You can change your choice at any time in <CookieSettingsLink label="cookie settings" />.</p>
        </> },
        { id: 'keep', title: 'How long we keep it', body: <>
          <p>Booking requests are kept in the clinic’s email for as long as needed to arrange and follow up your care, and then deleted, unless the law requires us to keep them longer. Analytics data is kept for 14 months.</p>
        </> },
        { id: 'rights', title: 'Your rights', body: <>
          <p>Under the Digital Personal Data Protection Act, 2023, you can ask us for a summary of the personal data we hold about you, ask us to correct, complete or erase it, withdraw your consent, and nominate someone to exercise these rights for you. Write to {mail} or call {CLINIC.phones[0]}; we reply within 30 days.</p>
          <p>If you are not satisfied with our response, you can complain to the Data Protection Board of India.</p>
        </> },
        { id: 'grievance', title: 'Grievances', body: <>
          <p>For any concern about your personal data, contact the clinic at {mail}, <a href={tel(CLINIC.phones[0])}>{CLINIC.phones[0]}</a>, or in writing at {CLINIC.address.lines.join(', ')}.</p>
        </> },
        { id: 'children', title: 'Children', body: <>
          <p>Appointments for a child should be booked by a parent or guardian, who gives consent on the child’s behalf.</p>
        </> },
        { id: 'security', title: 'Security', body: <>
          <p>The website uses encrypted connections (HTTPS), and booking requests are sent to the clinic over encrypted email. No method is perfectly secure, but we take reasonable care to protect your data.</p>
        </> },
        { id: 'changes', title: 'Changes to this policy', body: <>
          <p>We will update this page when our practices change, and change the date at the top. See also our <Link href="/terms">Terms of use</Link>.</p>
        </> },
      ]}
    />
  );
}
