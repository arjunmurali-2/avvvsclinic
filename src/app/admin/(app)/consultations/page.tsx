import Link from 'next/link';
import { sql, ensureSchema } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { fmtDate, fmtTime } from '@/lib/consult';
import { googleStatus } from '@/lib/google';
import { AppointmentActions } from './AppointmentActions';

export const metadata = { title: 'Consultations' };

interface Row {
  ref: string; starts_at: string; ends_at: string; status: string; name: string; phone: string; email: string; age: string; note: string;
  meet_url: string | null; doctor_name: string; doctor_slug: string;
}

const LABEL: Record<string, string> = { confirmed: 'Booked', completed: 'Completed', no_show: 'Did not attend', cancelled: 'Cancelled', pending_payment: 'Awaiting payment' };

export default async function Consultations({ searchParams }: { searchParams: Promise<{ doctor?: string; show?: string }> }) {
  await requireUser();
  await ensureSchema();
  const { doctor = '', show = 'upcoming' } = await searchParams;
  const past = show === 'past';
  const cut = new Date(Date.now() - 60 * 60_000).toISOString();   // a call that began within the hour still counts as upcoming
  const all = (await (past
    ? sql()`SELECT a.*, d.name AS doctor_name, d.slug AS doctor_slug FROM clinic_appointments a JOIN clinic_doctors d ON d.id = a.doctor_id
        WHERE a.starts_at < ${cut} OR a.status = 'cancelled' ORDER BY a.starts_at DESC LIMIT 200`
    : sql()`SELECT a.*, d.name AS doctor_name, d.slug AS doctor_slug FROM clinic_appointments a JOIN clinic_doctors d ON d.id = a.doctor_id
        WHERE a.starts_at >= ${cut} AND a.status <> 'cancelled' ORDER BY a.starts_at LIMIT 200`)) as unknown as Row[];
  const rows = doctor ? all.filter((r) => r.doctor_slug === doctor) : all;
  const doctors = [...new Map(all.map((r) => [r.doctor_slug, r.doctor_name])).entries()];
  const google = await googleStatus();
  const q = (p: Record<string, string>) => `/admin/consultations?${new URLSearchParams({ ...(doctor ? { doctor } : {}), show, ...p })}`;

  return (
    <div className="ad-page">
      <div className="ad-head">
        <div>
          <h1>Consultations</h1>
          <p className="ad-muted">Online consultations booked on the website. Each one is also on the clinic’s Google Calendar, with its Meet link.</p>
        </div>
        <div className="ad-card-actions">
          <a className="ad-btn ad-btn-quiet" href={`/admin/consultations/export?show=${past ? 'past' : 'upcoming'}`}>Download as a spreadsheet</a>
          <a className="ad-btn" href="/consult" target="_blank" rel="noopener">New booking</a>
        </div>
      </div>

      {!google.connected && (
        <p className="ad-note ad-note-error">Google Calendar is not connected, so {process.env.NODE_ENV === 'production' ? 'online booking is closed' : 'bookings on this computer use a placeholder Meet link'}. <Link href="/admin/settings">Open Settings</Link></p>
      )}

      <div className="ad-filters">
        <span className="ad-seg">
          <Link href={q({ show: 'upcoming' })} aria-current={!past ? 'page' : undefined}>Upcoming</Link>
          <Link href={q({ show: 'past' })} aria-current={past ? 'page' : undefined}>Past and cancelled</Link>
        </span>
        {doctors.length > 1 && (
          <span className="ad-seg">
            <Link href={`/admin/consultations?show=${show}`} aria-current={!doctor ? 'page' : undefined}>All doctors</Link>
            {doctors.map(([slug, name]) => <Link key={slug} href={`/admin/consultations?show=${show}&doctor=${slug}`} aria-current={doctor === slug ? 'page' : undefined}>{name.replace('Dr. ', '')}</Link>)}
          </span>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="ad-empty">{past ? 'Nothing here yet.' : 'No upcoming online consultations.'}</p>
      ) : (
        <table className="ad-table">
          <thead><tr><th>When</th><th>Patient</th><th>Doctor</th><th>Status</th><th /></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.ref}>
                <td><b>{fmtDate(r.starts_at)}</b><span className="ad-muted ad-sub">{fmtTime(r.starts_at)} to {fmtTime(r.ends_at)}</span></td>
                <td>
                  <b>{r.name}</b>{r.age && <span className="ad-muted">, {r.age}</span>}
                  <span className="ad-muted ad-sub"><a href={`tel:${r.phone.replace(/\s/g, '')}`}>{r.phone}</a> · <a href={`mailto:${r.email}`}>{r.email}</a></span>
                  {r.note && <span className="ad-sub ad-patient-note">{r.note}</span>}
                </td>
                <td>{r.doctor_name}</td>
                <td><span className={`ad-pill ad-pill-${r.status === 'confirmed' || r.status === 'completed' ? 'published' : 'draft'}`}>{LABEL[r.status] ?? r.status}</span></td>
                <td className="ad-row-actions"><AppointmentActions refId={r.ref} status={r.status} meet={r.meet_url} doctor={r.doctor_slug} current={new Date(r.starts_at).toISOString()} started={new Date(r.starts_at).getTime() < Date.now()} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
