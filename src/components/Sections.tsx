import Image from 'next/image';
import Link from 'next/link';
import { CLINICS, REVIVE, clinicBySlug } from '@/lib/clinics';
import type { Post } from '@/lib/journal';
import { getDoctors, getPosts } from '@/lib/content';
import { CLINIC, tel } from '@/lib/site';
import { Chevron } from './Parts';

type Tile = { slug: string; size: 'wide' | 'half' | 'third' | 'full'; img?: string; pos?: string };

// The clinics as photographed tiles of three sizes.
const LAYOUT: Tile[] = [
  { slug: 'pain-management-clinic', size: 'wide', img: '/photos/pulse.jpg', pos: '58% 50%' },
  { slug: 'pregnancy-postnatal-care-clinic', size: 'third', img: '/photos/mother.jpg', pos: '50% 35%' },
  { slug: 'headache-clinic', size: 'third', img: '/photos/headache.jpg', pos: '42% 40%' },
  { slug: 'obesity-lifestyle-clinic', size: 'third', img: '/photos/lifestyle.jpg', pos: '30% 50%' },
  { slug: 'infertility-clinic', size: 'third', img: '/photos/infertility.jpg', pos: '62% 50%' },
  { slug: REVIVE.slug, size: 'full', img: '/photos/hairoil.jpg', pos: '50% 62%' },
];

export function ClinicTiles({ exclude }: { exclude?: string }) {
  // on a clinic's own page, three of the others, all the same size
  const tiles = exclude ? LAYOUT.filter((t) => t.slug !== exclude).slice(0, 3).map((t) => ({ ...t, size: 'third' as const })) : LAYOUT;
  return (
    <div className="tiles" data-stagger>
      {tiles.map((t) => {
        const c = t.slug === REVIVE.slug ? { name: REVIVE.name, lede: 'Ayur-Medi care for healthy skin and beautiful hair.' }
          : t.slug === 'obesity-lifestyle-clinic' ? { name: clinicBySlug(t.slug)!.name, lede: 'Healthy weight, and care for lifestyle and metabolic disorders.' }
          : clinicBySlug(t.slug)!;
        const cls = t.size === 'wide' ? ' tile-wide' : t.size === 'full' ? ' tile-full' : t.size === 'half' ? ' tile-half' : '';
        return (
          <Link key={t.slug} href={`/clinics/${t.slug}`} className={`tile has-img${cls}`}>
            <span className="tile-img"><Image src={t.img!} alt="" fill sizes={t.size === 'third' ? '(min-width: 1000px) 33vw, 100vw' : '(min-width: 1000px) 66vw, 100vw'} style={{ objectPosition: t.pos }} /></span>
            <span className="tile-copy">
              <h3>{c.name}</h3>
              <p>{c.lede}</p>
              <span className="more">Learn more<Chevron /></span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/** The doctors, as a quiet row of studio portraits. */
export async function Doctors({ tone = '', page = false }: { tone?: string; page?: boolean }) {
  const H = page ? 'h1' : 'h2';
  const doctors = await getDoctors();
  if (!doctors.length && !page) return null;
  return (
    <section className={`sec ${tone}`} aria-labelledby="doctors-title" style={page ? { paddingTop: 'clamp(40px, 6vh, 72px)' } : undefined}>
      <div className="in center head">
        <H id="doctors-title" className="t-1" data-reveal data-now={page ? '' : undefined}>Meet the doctors.</H>
        <p className="lede" data-reveal data-delay="80">Ayurvedic physicians, and modern medicine where it helps, under one roof.</p>
      </div>
      <ul className="docs" data-stagger>
        {doctors.map((d) => (
          <li key={d.slug} id={d.slug} className="doc">
            <span className="doc-pic">{d.photo && <Image src={d.photo} alt={`Portrait of ${d.name}`} width={600} height={720} sizes="(min-width: 1100px) 360px, (min-width: 640px) 45vw, 90vw" />}</span>
            <h3>{d.name}</h3>
            <p>{d.quals.join(' · ')}</p>
            {d.role && <p className="doc-role">{d.role}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Visit({ title = 'Opposite Kozhikode Railway Station.' }: { title?: string }) {
  return (
    <section className="sec" aria-labelledby="visit-title">
      <div className="visit">
        <div data-reveal>
          <h2 id="visit-title" className="t-1">{title}</h2>
          <address>
            {CLINIC.name}<br />
            {CLINIC.address.lines.join(', ')}
          </address>
        </div>
        <ul className="reach" data-stagger>
          {CLINIC.phones.map((p) => <li key={p}><a href={tel(p)}><span>{p}</span><span>Call</span></a></li>)}
          <li><a href={`mailto:${CLINIC.email}`}><span>{CLINIC.email}</span><span>Email</span></a></li>
          <li><a href={CLINIC.maps} rel="noopener" target="_blank"><span>Directions in Google Maps</span><span>Open ↗</span></a></li>
        </ul>
      </div>
    </section>
  );
}

export function PostCard({ p, h = 'h3' }: { p: Post; h?: 'h2' | 'h3' }) {
  const H = h;
  return (
    <li className="post">
      <Link href={`/journal/${p.slug}`} className="post-img" tabIndex={-1} aria-hidden="true">
        <Image src={p.cover.src} width={1200} height={800} sizes="(min-width: 900px) 33vw, 100vw" alt="" style={{ objectPosition: p.cover.position }} />
      </Link>
      <p className="post-meta">{p.kind} · {p.minutes} min read</p>
      <H><Link href={`/journal/${p.slug}`}>{p.title}</Link></H>
    </li>
  );
}

export async function Journal({ exclude, tone = '', only, title = 'From the Journal' }: { exclude?: string; tone?: string; only?: Post[]; title?: string }) {
  const posts = (only ?? (await getPosts())).filter((p) => p.slug !== exclude).slice(0, 3);
  if (!posts.length) return null;
  return (
    <section className={`sec ${tone}`} aria-labelledby="journal-title">
      <div className="in center head">
        <h2 id="journal-title" className="t-2" data-reveal>{title}</h2>
        <p data-reveal><Link className="more" href="/journal">All articles<Chevron /></Link></p>
      </div>
      <ul className="posts" data-stagger>{posts.map((p) => <PostCard key={p.slug} p={p} />)}</ul>
    </section>
  );
}

export { CLINICS };
