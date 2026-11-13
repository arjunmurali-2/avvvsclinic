import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Close, Crumbs, Faq, JsonLd, More } from '@/components/Parts';
import { Journal } from '@/components/Sections';
import { clinicName, getPosts, getTherapies, getTherapy } from '@/lib/content';
import { breadcrumbLd, medicalPageLd, therapyLd } from '@/lib/ld';
import { CLINIC, alternatesFor } from '@/lib/site';
import { THERAPIES } from '@/lib/therapies';

// One page per therapy, so "Shirodhara in Kozhikode" has a page that answers it.
// Built-in therapies are prerendered; ones added in the admin render on first visit and are cached.
export const revalidate = 300;
export function generateStaticParams() { return THERAPIES.map((t) => ({ slug: t.slug })); }

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const t = await getTherapy((await params).slug);
  if (!t) return {};
  const title = `${t.name} in Kozhikode (Calicut)`;
  const description = `${t.name}${t.ml ? ` (${t.ml})` : ''} at ${CLINIC.name}, opposite Kozhikode Railway Station: ${lower(t.what)}`.slice(0, 300);
  return { title, description, alternates: alternatesFor(`/therapies/${t.slug}`), openGraph: { url: `/therapies/${t.slug}`, title: `${title} · AVVVS`, description, ...(t.img ? { images: [{ url: t.img, alt: t.name }] } : {}) } };
}

export default async function TherapyPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const [t, all, posts] = await Promise.all([getTherapy(slug), getTherapies(), getPosts()]);
  if (!t) notFound();
  const clinics = t.clinics ?? [];
  const reading = posts.filter((p) => p.treatments?.includes(t.slug));
  const others = all.filter((x) => x.slug !== t.slug && x.img).slice(0, 3);
  const answer = `${t.name}${t.ml ? ` (${t.ml})` : ''} is ${lower(t.what)} It is available at ${CLINIC.name}, on the 3rd floor of Kaloor Central, opposite Kozhikode Railway Station, after a consultation with the clinic’s doctor.`;

  const faq = [
    { q: `What is ${t.name}?`, a: `${t.name} is ${lower(t.what)}${t.how ? ` ${t.how}` : ''}` },
    { q: `Where can I have ${t.name} in Kozhikode?`, a: `At ${CLINIC.name}, 3rd floor, Kaloor Central, Annie Hall Road, opposite Kozhikode Railway Station, Kozhikode (Calicut) 673002. Call ${CLINIC.phones[0]} or book at clinic.avvvs.com/book.` },
    { q: `Do I need a consultation before ${t.name}?`, a: `Yes. The clinic’s doctor decides whether ${t.name} suits you, which preparation to use and how many sittings you need, after a consultation.` },
    ...(clinics.length ? [{ q: `Which clinics offer ${t.name}?`, a: `${t.name} is offered in the ${clinics.map(clinicName).join(', ')} at ${CLINIC.name}.` }] : []),
  ];

  return (
    <main id="main">
      <section className="page-head">
        <div className="in-narrow">
          <Crumbs trail={[{ name: 'Therapies', href: '/therapies' }, { name: t.name }]} />
          <h1 className="t-1" data-reveal data-now>{t.name}</h1>
          {t.ml && <p className="lede" lang="ml" data-reveal data-now data-delay="80" style={{ color: 'var(--gold)' }}>{t.ml}</p>}
          <div className="actions" data-reveal data-now data-delay="160">
            <Link className="btn" href="/book?care=panchakarma">Book a consultation</Link>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 'clamp(16px, 2vw, 32px)' }} aria-label={`About ${t.name}`}>
        <article className={t.img ? 'th-item' : 'prose'}>
          {t.img && <figure className="th-pic" data-reveal>
            <Image src={t.img} alt={`${t.name} at AVVVS Ayur Speciality Clinic`} width={1200} height={1500} priority sizes="(min-width: 860px) 50vw, 100vw" style={{ objectPosition: t.pos }} />
          </figure>}
          <div className={t.img ? 'th-copy' : undefined} data-reveal data-delay="100">
            <p data-answer>{answer}</p>
            {t.how && <p className="muted">{t.how}</p>}
            {clinics.length > 0 && (
              <p className="small">Offered in {clinics.map((c, k) => <span key={c}>{k > 0 && (k === clinics.length - 1 ? ' and ' : ', ')}<Link href={`/clinics/${c}`}>{clinicName(c)}</Link></span>)}.</p>
            )}
          </div>
        </article>
      </section>

      <Faq title={`About ${t.name}.`} items={faq} tone="mist" />

      {reading.length > 0 && <Journal only={reading} title={`Reading about ${t.name}`} />}

      <section className="sec" aria-labelledby="more-th">
        <div className="in center head">
          <h2 id="more-th" className="t-2" data-reveal>More therapies.</h2>
          <p data-reveal><More href="/therapies">All therapies</More></p>
        </div>
        <ul className="posts" data-stagger>
          {others.map((o) => (
            <li key={o.slug} className="post">
              <Link href={`/therapies/${o.slug}`} className="post-img" tabIndex={-1} aria-hidden="true">
                <Image src={o.img!} alt="" width={900} height={600} sizes="(min-width: 900px) 33vw, 100vw" style={{ objectPosition: o.pos }} />
              </Link>
              <h3><Link href={`/therapies/${o.slug}`}>{o.name}</Link></h3>
              <p className="post-meta">{o.what}</p>
            </li>
          ))}
        </ul>
      </section>

      <Close care="panchakarma" title={`Ask about ${t.name}.`} />
      <JsonLd data={therapyLd(t)} />
      <JsonLd data={breadcrumbLd([{ name: 'Therapies', path: '/therapies' }, { name: t.name, path: `/therapies/${t.slug}` }])} />
      <JsonLd data={medicalPageLd({ path: `/therapies/${t.slug}`, name: `${t.name} in Kozhikode`, description: answer, about: t.name })} />
    </main>
  );
}
