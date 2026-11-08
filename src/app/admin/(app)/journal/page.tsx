import Link from 'next/link';
import { sql, ensureSchema } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { clinicName, type PostRow } from '@/lib/content';
import { POSTS, fmtDate } from '@/lib/journal';
import { newPost } from '../../actions';

export const metadata = { title: 'Journal' };

export default async function Journal() {
  await requireUser();
  await ensureSchema();
  const rows = (await sql()`
    SELECT p.*, u.name AS author_name FROM clinic_posts p LEFT JOIN clinic_users u ON u.id = p.author_id
    ORDER BY p.updated_at DESC`) as unknown as PostRow[];
  return (
    <div className="ad-page">
      <div className="ad-head">
        <div>
          <h1>Journal</h1>
          <p className="ad-muted">Articles appear on the Journal, on the clinic they are linked to, and beside the treatments they are about.</p>
        </div>
        <form action={newPost}><button className="ad-btn">New article</button></form>
      </div>

      {rows.length === 0 ? (
        <p className="ad-empty">No articles written here yet. Start with <b>New article</b>.</p>
      ) : (
        <table className="ad-table">
          <thead><tr><th>Title</th><th>Clinic</th><th>Status</th><th>Updated</th><th /></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td><b>{p.title}</b><span className="ad-muted ad-sub">{p.author_name ? `by ${p.author_name}` : ''}</span></td>
                <td className="ad-muted">{p.clinic ? clinicName(p.clinic) : '—'}</td>
                <td><span className={`ad-pill ad-pill-${p.status}`}>{p.status === 'published' ? 'Published' : 'Draft'}</span></td>
                <td className="ad-muted">{fmtDate(new Date(p.updated_at as unknown as string).toISOString().slice(0, 10))}</td>
                <td className="ad-row-actions">
                  <Link href={`/admin/journal/${p.id}`}>Edit</Link>
                  {p.status === 'published' && <a href={`/journal/${p.slug}`} target="_blank" rel="noopener">View</a>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <section className="ad-builtin">
        <h2>Built into the site</h2>
        <p className="ad-muted">These articles are part of the site&rsquo;s code, so a developer changes them.</p>
        <ul>{POSTS.map((p) => <li key={p.slug}><a href={`/journal/${p.slug}`} target="_blank" rel="noopener">{p.title}</a> <span className="ad-muted">· {p.kind}</span></li>)}</ul>
      </section>
    </div>
  );
}
