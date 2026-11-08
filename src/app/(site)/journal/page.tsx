import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Crumbs, JsonLd, More } from '@/components/Parts';
import { PostCard } from '@/components/Sections';
import { getPosts } from '@/lib/content';

export const revalidate = 300;
import { breadcrumbLd } from '@/lib/ld';
import { CLINIC, abs, alternatesFor } from '@/lib/site';

const DESCRIPTION = 'Notes from AVVVS Ayur Speciality Clinic, Kozhikode: what to expect at an Ayurveda consultation, Kerala Panchakarma therapies explained, headaches, and finding the clinic.';

export const metadata: Metadata = {
  title: 'Journal',
  description: DESCRIPTION,
  alternates: { ...alternatesFor('/journal'), types: { 'application/rss+xml': '/journal/rss.xml' } },
  openGraph: { url: '/journal', title: `Journal · ${CLINIC.name}`, description: DESCRIPTION },
};

export default async function JournalPage() {
  const POSTS = await getPosts();
  const [lead, ...rest] = POSTS;
  return (
    <main id="main">
      <section className="page-head">
        <div className="in-narrow">
          <Crumbs trail={[{ name: 'Journal' }]} />
          <h1 className="t-1" data-reveal data-now>Journal</h1>
          <p className="lede" data-reveal data-now data-delay="120">Plain answers about Ayurveda, the therapies, and what to expect when you visit.</p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }} aria-label="Articles">
        <article className="split" style={{ marginBottom: 'clamp(72px, 9vw, 120px)' }}>
          <Link href={`/journal/${lead.slug}`} className="split-pic" style={{ aspectRatio: '3 / 2' }} tabIndex={-1} aria-hidden="true" data-reveal>
            <Image src={lead.cover.src} alt="" fill priority sizes="(min-width: 860px) 50vw, 100vw" style={{ objectPosition: lead.cover.position, objectFit: 'cover' }} />
          </Link>
          <div className="split-copy" data-reveal data-delay="100">
            <p className="post-meta">{lead.kind} · {lead.minutes} min read</p>
            <h2 className="t-2"><Link href={`/journal/${lead.slug}`} style={{ color: 'inherit' }}>{lead.title}</Link></h2>
            <p className="lede">{lead.dek}</p>
            <More href={`/journal/${lead.slug}`}>Read</More>
          </div>
        </article>
        <ul className="posts" data-stagger>{rest.map((p) => <PostCard key={p.slug} p={p} h="h2" />)}</ul>
      </section>

      <JsonLd data={breadcrumbLd([{ name: 'Journal', path: '/journal' }])} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'Blog', '@id': `${abs('/journal')}#blog`, name: `Journal · ${CLINIC.name}`, url: abs('/journal'), description: DESCRIPTION, inLanguage: 'en-IN',
        blogPost: POSTS.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: abs(`/journal/${p.slug}`), datePublished: p.published, dateModified: p.revised, description: p.dek, image: abs(p.cover.src) })),
      }} />
    </main>
  );
}
