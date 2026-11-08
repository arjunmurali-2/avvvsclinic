import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Answer, BookInvite, Crumbs, Faq, JsonLd } from '@/components/Parts';
import { JournalStrip } from '@/components/Sections';
import { clinicBySlug } from '@/lib/clinics';
import { POSTS, fmtDate, postBySlug, type Block } from '@/lib/journal';
import { breadcrumbLd, postLd } from '@/lib/ld';
import { alternatesFor } from '@/lib/site';

export const dynamicParams = false;
export function generateStaticParams() { return POSTS.map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = postBySlug((await params).slug);
  if (!p) return {};
  return {
    title: p.title, description: p.dek, alternates: alternatesFor(`/journal/${p.slug}`),
    openGraph: { type: 'article', url: `/journal/${p.slug}`, title: p.title, description: p.dek, publishedTime: p.published, modifiedTime: p.revised },
  };
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.t) {
          case 'p': return <p key={i} className={i === 0 ? 'jr-lead-p' : undefined}>{b.text}</p>;
          case 'h2': return <h2 key={i}>{b.text}</h2>;
          case 'ul': return <ul key={i} className="jr-list">{b.items.map((t) => <li key={t}>{t}</li>)}</ul>;
          case 'ol': return <ol key={i} className="jr-steps">{b.items.map((t) => <li key={t.h}><h3 style={{ margin: '0 0 6px', fontSize: 'clamp(1.2rem, 1rem + 0.6vw, 1.5rem)' }}>{t.h}</h3><p>{t.p}</p></li>)}</ol>;
          case 'note': return <aside key={i} className="jr-note"><p className="jr-note-h">{b.h}</p><p>{b.text}</p></aside>;
          case 'quote': return <blockquote key={i}><p>{b.text}</p></blockquote>;
        }
      })}
    </>
  );
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = postBySlug((await params).slug);
  if (!p) notFound();
  const clinic = p.clinic ? clinicBySlug(p.clinic) : undefined;
  return (
    <main id="main">
      <article className="jr jr-post">
        <header className="jr-head">
          <Crumbs trail={[{ name: 'Journal', href: '/journal' }, { name: p.title }]} />
          <p className="jr-meta" data-reveal data-now><span>{p.kind}</span><span aria-hidden="true">·</span><span>{p.minutes} min read</span><span aria-hidden="true">·</span><time dateTime={p.revised}>{fmtDate(p.revised)}</time></p>
          <h1 data-split data-now>{p.title}</h1>
          <p className="jr-standfirst" data-reveal data-now>{p.dek}</p>
        </header>
        <figure className="jr-cover" data-unveil data-now>
          <Image src={p.cover.src} alt={p.cover.alt} width={1920} height={1080} priority sizes="(min-width: 1300px) 82rem, 100vw" style={{ objectPosition: p.cover.position }} />
        </figure>
        <div className="jr-answer"><Answer label="The short answer">{p.answer}</Answer></div>
        <div className="jr-body">
          <Blocks blocks={p.blocks} />
          <p className="jr-sign">Written by {clinic ? `the ${clinic.name} at ` : ''}AVVVS Ayur Speciality Clinic, Kozhikode, for general information. It is not a substitute for a consultation.</p>
        </div>
        <div className="jr-cta">
          <p>{clinic ? `See the ${clinic.name}` : 'Talk to a doctor at the clinic'}</p>
          <Link className="cta" href={clinic ? `/book?care=${clinic.slug}` : '/book'}>Book a consultation <span aria-hidden="true">→</span></Link>
        </div>
      </article>
      {p.faq && <Faq id="post-faq" title="Quick answers" items={p.faq} />}
      <JournalStrip exclude={p.slug} />
      <BookInvite care={clinic?.slug} />
      <JsonLd data={postLd(p)} />
      <JsonLd data={breadcrumbLd([{ name: 'Journal', path: '/journal' }, { name: p.title, path: `/journal/${p.slug}` }])} />
    </main>
  );
}
