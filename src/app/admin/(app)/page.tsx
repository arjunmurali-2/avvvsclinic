import Link from 'next/link';
import { sql, ensureSchema } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { newPost, newTreatment } from '../actions';

export const metadata = { title: 'Overview' };

export default async function Overview() {
  const me = await requireUser();
  await ensureSchema();
  const [t, p] = await Promise.all([
    sql()`SELECT status, count(*)::int AS n FROM clinic_treatments GROUP BY status`,
    sql()`SELECT status, count(*)::int AS n FROM clinic_posts GROUP BY status`,
  ]);
  const n = (rows: Record<string, unknown>[], s: string) => Number(rows.find((r) => r.status === s)?.n ?? 0);
  return (
    <div className="ad-page">
      <h1>Hello, {me.name.split(' ')[0]}.</h1>
      <p className="ad-muted ad-lede">Add a treatment and choose the clinics that offer it, or write an article and link it to a clinic and its treatments. Published work appears on the site within a few minutes.</p>
      <div className="ad-cards">
        <section className="ad-card">
          <h2>Treatments</h2>
          <p className="ad-big">{n(t, 'published')}<span> published</span></p>
          <p className="ad-muted">{n(t, 'draft')} draft{n(t, 'draft') === 1 ? '' : 's'} · plus the 6 built-in therapies</p>
          <div className="ad-card-actions">
            <form action={newTreatment}><button className="ad-btn">New treatment</button></form>
            <Link className="ad-link" href="/admin/treatments">All treatments</Link>
          </div>
        </section>
        <section className="ad-card">
          <h2>Journal</h2>
          <p className="ad-big">{n(p, 'published')}<span> published</span></p>
          <p className="ad-muted">{n(p, 'draft')} draft{n(p, 'draft') === 1 ? '' : 's'} · plus the built-in articles</p>
          <div className="ad-card-actions">
            <form action={newPost}><button className="ad-btn">New article</button></form>
            <Link className="ad-link" href="/admin/journal">All articles</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
