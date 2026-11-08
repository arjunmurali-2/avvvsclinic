import Link from 'next/link';
import { CLINICS, REVIVE } from '@/lib/clinics';
import { CLINIC, PARENT_URL, tel } from '@/lib/site';
import { Year } from './Year';

/** The quiet grey footer: the facts, the routes, the fine print. */
export function Footer() {
  return (
    <footer className="foot">
      <div className="foot-in">
        <p className="foot-note">Information on this site is general and is not a substitute for a consultation with a doctor. Photographs are illustrative.</p>
        <div className="foot-cols">
          <nav aria-label="Speciality clinics">
            <h2>Speciality clinics</h2>
            <ul>
              {CLINICS.map((c) => <li key={c.slug}><Link href={`/clinics/${c.slug}`}>{c.label}</Link></li>)}
              <li><Link href={`/clinics/${REVIVE.slug}`}>{REVIVE.name}</Link></li>
            </ul>
          </nav>
          <nav aria-label="The clinic">
            <h2>The clinic</h2>
            <ul>
              <li><Link href="/therapies">Therapies</Link></li>
              <li><Link href="/doctors">Doctors</Link></li>
              <li><Link href="/journal">Journal</Link></li>
              <li><Link href="/book">Book a consultation</Link></li>
              <li><Link href="/visit">Visit</Link></li>
            </ul>
          </nav>
          <div>
            <h2>Visit</h2>
            <address>{CLINIC.address.lines.map((l) => <span key={l}>{l}</span>)}</address>
          </div>
          <div>
            <h2>Contact</h2>
            <ul>
              {CLINIC.phones.map((p) => <li key={p}><a href={tel(p)}>{p}</a></li>)}
              <li><a href={`mailto:${CLINIC.email}`}>Email the clinic</a></li>
              <li><a href={CLINIC.pharmacy} rel="noopener">AVVVS Pharmacy</a></li>
              <li><a href={PARENT_URL} rel="noopener">avvvs.com</a></li>
            </ul>
          </div>
        </div>
        <div className="foot-base">
          <div className="foot-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/avvvs-since-1921.svg" alt="AVVVS, since 1921" width={136} height={30} />
            <span>© <Year /> {CLINIC.legal}</span>
          </div>
          <ul>
            <li><Link href="/privacy">Privacy</Link></li>
            {CLINIC.social.map((s) => <li key={s.label}><a href={s.href} rel="noopener">{s.label}</a></li>)}
          </ul>
        </div>
      </div>
    </footer>
  );
}
