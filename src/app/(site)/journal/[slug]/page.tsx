import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Close, Crumbs, Faq, JsonLd } from '@/components/Parts';
import { Journal } from '@/components/Sections';
import { clinicBySlug } from '@/lib/clinics';
import { POSTS, fmtDate, type Block } from '@/lib/journal';
import { getPost } from '@/lib/content';
import { breadcrumbLd, postLd } from '@/lib/ld';
import { alternatesFor } from '@/lib/site';

// built-in articles are prerendered; articles published in the admin render on first visit and are cached
export const revalidate = 300;
export function generateStaticParams() { return POSTS.map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getPost((await params).slug);
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
          case 'p': return <p key={i}>{b.text}</p>;
          case 'h2': return <h2 key={i}>{b.text}</h2>;
          case 'ul': return <ul key={i}>{b.items.map((t) => <li key={t}>{t}</li>)}</ul>;
          case 'ol': return <ol key={i}>{b.items.map((t) => <li key={t.h}><b style={{ color: 'var(--ink)', fontWeight: 600 }}>{t.h}.</b> {t.p}</li>)}</ol>;
          case 'note': return <aside key={i} className="note"><b>{b.h}</b><p>{b.text}</p></aside>;
          case 'quote': return <blockquote key={i} className="note"><p style={{ fontFamily: 'var(--f-head)', fontSize: '1.4em', lineHeight: 1.3, color: 'var(--ink)' }}>{b.text}</p></blockquote>;
          case 'img': return (
            <figure key={i} style={{ margin: '1em 0' }}>
              <Image src={b.url} alt={b.alt} width={1600} height={1000} sizes="(min-width: 760px) 680px, 100vw" style={{ width: '100%', height: 'auto', borderRadius: 14 }} />
              {b.caption && <figcaption className="small" style={{ marginTop: 8 }}>{b.caption}</figcaption>}
            </figure>
          );
        }
      })}
    </>
  );
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getPost((await params).slug);
  if (!p) notFound();
  const clinic = p.clinic ? clinicBySlug(p.clinic) : undefined;
  return (
    <main id="main">
      <article>
        <header className="art-head">
          <div className="in-narrow">
            <Crumbs trail={[{ name: 'Journal', href: '/journal' }, { name: p.kind }]} />
            <h1 className="t-1" data-reveal data-now>{p.title}</h1>
            <p className="lede" data-reveal data-now data-delay="120">{p.dek}</p>
            <p className="small" data-reveal data-now data-delay="200">{p.minutes} min read · <time dateTime={p.revised}>{fmtDate(p.revised)}</time></p>
          </div>
        </header>
        <div className="art-pic" data-reveal data-now data-delay="260">
          <figure><Image src={p.cover.src} alt={p.cover.alt} width={2400} height={1350} priority sizes="(min-width: 1080px) 1080px, 100vw" style={{ objectPosition: p.cover.position }} /></figure>
        </div>
        <div className="art-body">
          <div className="prose">
            <p className="first" data-answer>{p.answer}</p>
            <Blocks blocks={p.blocks} />
            <p className="small" style={{ marginTop: '1.5em' }}>Written by AVVVS Ayur Speciality Clinic, Kozhikode, for general information. It is not a substitute for a consultation.</p>
          </div>
        </div>
      </article>
      {p.faq && <Faq title="Quick answers." items={p.faq} tone="mist" />}
      <Journal exclude={p.slug} />
      <Close care={clinic?.slug} title={clinic ? `Book the ${clinic.name}.` : 'Talk to a doctor.'} />
      <JsonLd data={postLd(p)} />
      <JsonLd data={breadcrumbLd([{ name: 'Journal', path: '/journal' }, { name: p.title, path: `/journal/${p.slug}` }])} />
    </main>
  );
}
