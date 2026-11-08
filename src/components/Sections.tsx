import Image from 'next/image';
import Link from 'next/link';
import { CLINIC, tel } from '@/lib/site';
import { POSTS, type Post } from '@/lib/journal';
import { THERAPIES } from '@/lib/therapies';

/**
 * The walk from the station: a schematic, not a map. The railway, Annie Hall Road, and Kaloor
 * Central opposite with its 3rd floor lit; a gold path draws itself across as the section arrives.
 */
export function WalkMap() {
  return (
    <svg className="walk" viewBox="0 0 640 440" role="img" aria-labelledby="walk-t walk-d">
      <title id="walk-t">How to find the clinic</title>
      <desc id="walk-d">Kozhikode Railway Station on one side of Annie Hall Road; Kaloor Central directly opposite, with the clinic on its 3rd floor.</desc>
      {/* the railway */}
      {Array.from({ length: 22 }, (_, i) => <line key={i} className="w-tie" x1={18 + i * 28} y1="34" x2={18 + i * 28} y2="58" />)}
      <line className="w-rail" x1="0" y1="38" x2="640" y2="38" />
      <line className="w-rail" x1="0" y1="54" x2="640" y2="54" />
      <text x="20" y="22">Railway lines</text>
      {/* the station */}
      <rect className="w-block" x="70" y="84" width="300" height="86" rx="6" />
      <text className="w-label" x="92" y="122">Kozhikode</text>
      <text className="w-label" x="92" y="148">Railway Station</text>
      {/* Annie Hall Road */}
      <path className="w-road" d="M-20 236 H 660" />
      <path className="w-road-c" d="M-20 236 H 660" />
      <text x="430" y="212">Annie Hall Road</text>
      {/* Kaloor Central, opposite */}
      <rect className="w-clinic" x="250" y="282" width="210" height="140" rx="6" />
      {[0, 1, 2, 3].map((f) => <rect key={f} className={f === 2 ? 'w-floor' : 'w-block'} x="266" y={398 - f * 30} width="178" height="18" rx="3" opacity={f === 2 ? 1 : 0.9} />)}
      <text className="w-label" x="478" y="318">Kaloor Central</text>
      <text x="478" y="342">3rd floor · the clinic</text>
      {/* the walk, drawn */}
      <g data-draw>
        <path className="w-path" d="M220 172 C 220 210, 300 222, 330 248 S 352 300, 356 334" />
      </g>
      <circle className="w-pin" cx="356" cy="338" r="6" />
      <circle className="w-pulse" cx="356" cy="338" r="10" />
    </svg>
  );
}

export function VisitSection({ heading = 'Opposite the station, on the third floor.' }: { heading?: string }) {
  return (
    <section className="sec visit" aria-labelledby="visit-title">
      <div data-reveal><WalkMap /></div>
      <div className="visit-copy">
        <p className="kicker">Visit the clinic</p>
        <h2 id="visit-title" data-split>{heading}</h2>
        <address data-reveal>
          <span>{CLINIC.name}</span>
          {CLINIC.address.lines.map((l) => <span key={l}>{l}</span>)}
        </address>
        <div className="visit-reach" data-reveal>
          {CLINIC.phones.map((p) => <a key={p} href={tel(p)}><span>{p}</span><span aria-hidden="true">Call →</span></a>)}
          <a href={`mailto:${CLINIC.email}`}><span>{CLINIC.email}</span><span aria-hidden="true">Write →</span></a>
          <a href={CLINIC.maps} rel="noopener" target="_blank"><span>Open in Google Maps</span><span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>
  );
}

export function PostCard({ p, i, h = 'h3' }: { p: Post; i?: number; h?: 'h2' | 'h3' }) {
  const H = h;
  return (
    <li className="jr-card">
      <Link href={`/journal/${p.slug}`} className="jr-card-media" tabIndex={-1} aria-hidden="true">
        <Image src={p.cover.src} width={1600} height={1000} sizes="(min-width: 1100px) 30vw, (min-width: 700px) 46vw, 100vw" alt="" style={{ objectPosition: p.cover.position }} />
      </Link>
      {i !== undefined && <span className="jr-no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>}
      <p className="jr-meta"><span>{p.kind}</span><span aria-hidden="true">·</span><span>{p.minutes} min read</span></p>
      <H><Link href={`/journal/${p.slug}`}>{p.title}</Link></H>
      <p className="jr-dek">{p.dek}</p>
    </li>
  );
}

export function JournalStrip({ exclude }: { exclude?: string }) {
  const posts = POSTS.filter((p) => p.slug !== exclude).slice(0, 3);
  return (
    <section className="jr jr-strip" aria-labelledby="jstrip-title">
      <div className="jr-strip-head">
        <div>
          <p className="kicker">From the Journal</p>
          <h2 id="jstrip-title" data-split>Notes from the clinic</h2>
        </div>
        <Link className="jr-read" href="/journal">All of the Journal<span aria-hidden="true"> →</span></Link>
      </div>
      <ul className="jr-grid" data-stagger>{posts.map((p) => <PostCard key={p.slug} p={p} />)}</ul>
    </section>
  );
}

/** The therapies, lamp-dark, sliding sideways as the section is scrolled through (wide screens). */
export function TherapyRail() {
  return (
    <section className="rail" data-rail aria-labelledby="rail-title">
      <div className="rail-sticky">
        <div className="rail-head">
          <p className="kicker">Kerala Panchakarma</p>
          <h2 id="rail-title" data-split>The classical therapies, given by hand.</h2>
          <p data-reveal>Authentic Panchakarma therapies, with oils and preparations from a pharmacy that has made Ayurveda medicines in Kozhikode since 1921, alongside specialised treatments for rejuvenation and healthy ageing.</p>
        </div>
        <ul className="rail-track">
          <li className="tcard tcard-intro">
            <Image src="/media/k09.jpg" alt="Warm medicated oil in a bronze vessel" fill sizes="(min-width: 900px) 32vw, 82vw" />
            <div className="tcard-body">
              <p className="kicker on-dark">Six therapies</p>
              <p>Your doctor chooses the therapy, the oil and the number of sittings after a consultation.</p>
              <Link href="/therapies">Read about each therapy →</Link>
            </div>
          </li>
          {THERAPIES.map((t, i) => (
            <li key={t.slug} className="tcard">
              <span className="tcard-no">{String(i + 1).padStart(2, '0')}</span>
              <span className="tcard-ml" lang="ml" aria-hidden="true">{t.ml}</span>
              <div style={{ display: 'grid', gap: 12 }}>
                <h3><Link href={`/therapies#${t.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{t.name}</Link></h3>
                <p>{t.what}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="rail-progress" aria-hidden="true"><span /></div>
      </div>
    </section>
  );
}
