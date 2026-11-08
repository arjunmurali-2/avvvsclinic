import Link from 'next/link';
import { sql, ensureSchema } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import type { DoctorRow } from '@/lib/content';
import { newDoctor } from '../../actions';
import { MoveDoctor } from './MoveDoctor';

export const metadata = { title: 'Doctors' };

export default async function Doctors() {
  await requireUser();
  await ensureSchema();
  const rows = (await sql()`SELECT * FROM clinic_doctors ORDER BY sort, name`) as unknown as DoctorRow[];
  return (
    <div className="ad-page">
      <div className="ad-head">
        <div>
          <h1>Doctors</h1>
          <p className="ad-muted">The doctors shown on the home page and the Doctors page, in this order. Hide a doctor to take them off the site without deleting them.</p>
        </div>
        <form action={newDoctor}><button className="ad-btn">Add a doctor</button></form>
      </div>

      {rows.length === 0 ? (
        <p className="ad-empty">No doctors yet. Start with <b>Add a doctor</b>.</p>
      ) : (
        <table className="ad-table">
          <thead><tr><th>Doctor</th><th>Qualifications</th><th>On the site</th><th>Order</th><th /></tr></thead>
          <tbody>
            {rows.map((d, i) => (
              <tr key={d.id}>
                <td>
                  <span className="ad-doc">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {d.photo_url ? <img src={d.photo_url} alt="" /> : <span className="ad-doc-empty" aria-hidden="true" />}
                    <span><b>{d.name}</b>{d.role && <span className="ad-muted ad-sub">{d.role}</span>}</span>
                  </span>
                </td>
                <td className="ad-muted">{(d.quals ?? []).join(' · ') || '—'}</td>
                <td><span className={`ad-pill ad-pill-${d.visible ? 'published' : 'draft'}`}>{d.visible ? 'Shown' : 'Hidden'}</span></td>
                <td><MoveDoctor id={d.id} first={i === 0} last={i === rows.length - 1} /></td>
                <td className="ad-row-actions"><Link href={`/admin/doctors/${d.id}`}>Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
