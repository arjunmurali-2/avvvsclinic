import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Crumbs, JsonLd } from '@/components/Parts';
import { PostCard } from '@/components/Sections';
import { POSTS, fmtDate } from '@/lib/journal';
import { breadcrumbLd } from '@/lib/ld';
import { CLINIC, abs, alternatesFor } from '@/lib/site';

const DESCRIPTION = 'Notes from AVVVS Ayur Speciality Clinic, Kozhikode: what to expect at an Ayurveda consultation, Kerala Panchakarma therapies explained, headaches, and finding the clinic.';

export const metadata: Metadata = {
  title: 'Journal',
  description: DESCRIPTION,
  alternates: { ...alternatesFor('/journal'), types: { 'application/rss+xml': '/journal/rss.xml' } },
  openGraph: { url: '/journal', title: `Journal · ${CLINIC.name}`, description: DESCRIPTION },
};

export default function JournalPage() {
  const [lead, ...rest] = POSTS;
  return (
    <main id="main" className="jr">
      <header className="jr-mast">
        <Crumbs trail={[{ name: 'Journal' }]} />
        <h1 data-split data-now>Journal</h1>
        <p className="jr-lede" data-reveal data-now>Notes from the clinic: plain answers about Ayurveda, the therapies, and what to expect when you visit.</p>
      </header>

      <article className="jr-lead">
        <Link href={`/journal/${lead.slug}`} className="jr-lead-media" tabIndex={-1} aria-hidden="true" data-unveil>
          <Image src={lead.cover.src} width={1920} height={1080} priority sizes="(min-width: 860px) 58vw, 100vw" alt="" style={{ objectPosition: lead.cover.position }} />
        </Link>
        <div className="jr-lead-copy" data-reveal>
          <p className="jr-meta"><span>{lead.kind}</span><span aria-hidden="true">·</span><span>{lead.minutes} min read</span></p>
          <h2><Link href={`/journal/${lead.slug}`}>{lead.title}</Link></h2>
          <p className="jr-dek">{lead.dek}</p>
          <Link className="jr-read" href={`/journal/${lead.slug}`}>Read<span aria-hidden="true"> →</span></Link>
        </div>
      </article>

      <ul className="jr-grid" data-stagger>{rest.map((p, i) => <PostCard key={p.slug} p={p} i={i + 1} h="h2" />)}</ul>

      <JsonLd data={breadcrumbLd([{ name: 'Journal', path: '/journal' }])} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'Blog', '@id': `${abs('/journal')}#blog`, name: `Journal · ${CLINIC.name}`, url: abs('/journal'), description: DESCRIPTION, inLanguage: 'en-IN',
        blogPost: POSTS.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: abs(`/journal/${p.slug}`), datePublished: p.published, dateModified: p.revised, description: p.dek, image: abs(p.cover.src) })),
      }} />
      <p style={{ marginTop: 48, color: 'var(--muted)', fontSize: '0.9rem' }}>Last updated {fmtDate(POSTS.map((p) => p.revised).sort().at(-1)!)}.</p>
    </main>
  );
}
