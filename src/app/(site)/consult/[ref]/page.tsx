import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ManageAppointment } from '@/components/ManageAppointment';
import { appointmentForPatient, canPatientChange } from '@/lib/appointments';
import { fmtDate, fmtTime } from '@/lib/consult';
import { CLINIC, tel } from '@/lib/site';

// A patient's own appointment: private (reached only with the emailed link) and never indexed.
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Your online consultation', robots: { index: false, follow: false } };

export default async function AppointmentPage({ params, searchParams }: { params: Promise<{ ref: string }>; searchParams: Promise<{ t?: string; new?: string }> }) {
  const { ref } = await params;
  const { t = '', new: isNew } = await searchParams;
  const a = await appointmentForPatient(ref, t);
  if (!a) notFound();
  const first = a.name.split(/\s+/)[0];
  const cancelled = a.status === 'cancelled';
  const over = a.status === 'completed' || a.status === 'no_show' || new Date(a.ends_at).getTime() < Date.now();

  return (
    <main id="main" className="mist">
      <div className="bk">
        <div className="bk-card">
          <div className="bk-done">
            {!cancelled && !over && isNew && <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" /><path d="M20 33 l8 8 l16 -18" /></svg>}
            <h1 className="t-2">{cancelled ? 'This consultation is cancelled.' : over ? 'This consultation is over.' : isNew ? `You’re booked, ${first}.` : 'Your online consultation'}</h1>
            <dl className="appt">
              <div><dt>Doctor</dt><dd>{a.doctor_name}</dd></div>
              <div><dt>Day</dt><dd>{fmtDate(a.starts_at)}</dd></div>
              <div><dt>Time</dt><dd>{fmtTime(a.starts_at)} <span className="muted">India time</span></dd></div>
            </dl>
            {!cancelled && !over && (
              <>
                {a.meet_url && <a className="btn" href={a.meet_url} target="_blank" rel="noopener">Join with Google Meet</a>}
                <p className="small">The link is also in the email sent to {a.email}. Join a few minutes early, from a quiet, well-lit place.</p>
                <ManageAppointment refId={a.ref} token={t} doctor={a.doctor_slug ?? ''} current={a.starts_at} canChange={canPatientChange(a)} />
              </>
            )}
            {(cancelled || over) && <Link className="btn" href="/consult">Book another consultation</Link>}
            <p className="small">Not for emergencies: call 112 or 108. Questions? Call <a href={tel(CLINIC.phones[0])}>{CLINIC.phones[0]}</a>.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
