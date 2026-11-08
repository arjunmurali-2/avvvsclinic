import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main" className="nf">
      <p className="kicker">404</p>
      <h1>This page has wandered off.</h1>
      <p>The clinic is still where it always is, opposite Kozhikode Railway Station. Try one of these:</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px 28px', alignItems: 'center' }}>
        <Link className="cta cta-lg" href="/book">Book a consultation</Link>
        <Link className="btn-ghost" href="/clinics">Speciality clinics →</Link>
        <Link className="btn-ghost" href="/">Home →</Link>
      </div>
    </main>
  );
}
