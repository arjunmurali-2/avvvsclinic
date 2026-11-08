import Link from 'next/link';
import { sql, ensureSchema } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { clinicName, type TreatmentRow } from '@/lib/content';
import { THERAPIES } from '@/lib/therapies';
import { CLINICS, REVIVE } from '@/lib/clinics';
import { newTreatment } from '../../actions';

export const metadata = { title: 'Treatments' };

const draftName = (r: TreatmentRow) => (r.slug.startsWith('draft-') && r.name === 'Untitled treatment' ? 'Untitled treatment' : r.name);

export default async function Treatments() {
  await requireUser();
  await ensureSchema();
  const rows = (await sql()`SELECT * FROM clinic_treatments ORDER BY status DESC, sort, updated_at DESC`) as unknown as TreatmentRow[];
  return (
    <div className="ad-page">
      <div className="ad-head">
        <div>
          <h1>Treatments</h1>
          <p className="ad-muted">Each treatment appears on the therapies page and on every clinic it is linked to.</p>
        </div>
        <form action={newTreatment}><button className="ad-btn">New treatment</button></form>
      </div>

      {rows.length === 0 ? (
        <p className="ad-empty">No treatments added here yet. Start with <b>New treatment</b>.</p>
      ) : (
        <table className="ad-table">
          <thead><tr><th>Treatment</th><th>Clinics</th><th>Status</th><th /></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><b>{draftName(r)}</b>{r.ml && <span className="ad-muted" lang="ml"> {r.ml}</span>}</td>
                <td className="ad-muted">{(r.clinics ?? []).map(clinicName).join(', ') || 'Not linked yet'}</td>
                <td><span className={`ad-pill ad-pill-${r.status}`}>{r.status === 'published' ? 'Published' : 'Draft'}</span></td>
                <td className="ad-row-actions">
                  <Link href={`/admin/treatments/${r.id}`}>Edit</Link>
                  {r.status === 'published' && <a href={`/therapies#${r.slug}`} target="_blank" rel="noopener">View</a>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <section className="ad-builtin">
        <h2>Built into the site</h2>
        <p className="ad-muted">These therapies are part of the site&rsquo;s code and its clinic pages, so a developer changes them.</p>
        <ul>
          {THERAPIES.map((t) => {
            const at = [...CLINICS.filter((c) => c.therapies.includes(t.slug)).map((c) => c.name), ...(REVIVE.therapies.includes(t.slug) ? [REVIVE.name] : [])];
            return <li key={t.slug}><b>{t.name}</b> <span className="ad-muted">· {at.join(', ')}</span></li>;
          })}
        </ul>
      </section>
    </div>
  );
}
