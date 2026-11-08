import Link from 'next/link';
import { CLINICS, REVIVE } from '@/lib/clinics';
import { CLINIC, FOUNDED, PARENT_URL, tel } from '@/lib/site';
import { Year } from './Year';

/** Where the thread comes to rest: the gold line ending in a bead, then the clinic's facts. */
export function Footer() {
  return (
    <footer className="foot">
      <span className="foot-thread" aria-hidden="true" />
      <div className="foot-grid">
        <div className="foot-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="foot-lockup" src="/brand/avvvs-since-1921.svg" alt="AVVVS, since 1921" width={253} height={56} />
          <p className="foot-name">{CLINIC.name}</p>
          <p className="ml" lang="ml">{CLINIC.malayalam}</p>
          <p className="foot-line">Kerala Ayurveda from a family pharmacy in Kozhikode since {FOUNDED}.</p>
        </div>

        <nav className="foot-col" aria-label="Speciality clinics">
          <h2 className="foot-h">Speciality clinics</h2>
          <ul>
            {CLINICS.map((c) => <li key={c.slug}><Link href={`/clinics/${c.slug}`}>{c.name.replace(' Clinic', '')}</Link></li>)}
            <li><Link href={`/clinics/${REVIVE.slug}`}>{REVIVE.name}</Link></li>
          </ul>
        </nav>

        <nav className="foot-col" aria-label="The clinic">
          <h2 className="foot-h">The clinic</h2>
          <ul>
            <li><Link href="/therapies">Therapies</Link></li>
            <li><Link href="/journal">Journal</Link></li>
            <li><Link href="/visit">Visit and contact</Link></li>
            <li><Link href="/book">Book a consultation</Link></li>
            <li><a href={PARENT_URL} rel="noopener">avvvs.com<span aria-hidden="true"> ↗</span></a></li>
          </ul>
        </nav>

        <div className="foot-col">
          <h2 className="foot-h">Visit</h2>
          <address>{CLINIC.address.lines.map((l) => <span key={l}>{l}</span>)}</address>
          <ul className="foot-reach">
            {CLINIC.phones.map((p) => <li key={p}><a href={tel(p)}>{p}</a></li>)}
            <li><a href={`mailto:${CLINIC.email}`}>{CLINIC.email}</a></li>
          </ul>
        </div>
      </div>

      <div className="foot-base">
        <p>© <Year /> {CLINIC.legal}</p>
        <ul className="foot-legal" aria-label="Legal">
          <li><Link href="/privacy">Privacy</Link></li>
        </ul>
        <ul className="foot-social" aria-label="AVVVS elsewhere">
          {CLINIC.social.map((s) => <li key={s.label}><a href={s.href} rel="noopener">{s.label}</a></li>)}
        </ul>
        <p className="foot-note">Information on this site is general and is not a substitute for a consultation.</p>
      </div>
    </footer>
  );
}
