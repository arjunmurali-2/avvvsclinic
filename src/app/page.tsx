import Image from 'next/image';
import Link from 'next/link';
import { ClinicIndex } from '@/components/ClinicIndex';
import { Answer, BookInvite, Faq, JsonLd, TherapyBand, Thread } from '@/components/Parts';
import { JournalStrip, TherapyRail, VisitSection } from '@/components/Sections';
import { CLINICS, REVIVE } from '@/lib/clinics';
import { HOME_FAQ } from '@/lib/faq';
import { medicalPageLd } from '@/lib/ld';
import { CLINIC, DOCTOR, FOUNDED } from '@/lib/site';
import { THERAPIES } from '@/lib/therapies';

const YEARS = new Date().getFullYear() - FOUNDED;

export default function Home() {
  return (
    <main id="main">
      {/* ---------- hero ---------- */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="kicker" data-reveal data-now>AVVVS Ayur Speciality Clinic · Kozhikode</p>
          <h1 id="hero-title" data-split data-now>Rediscover health and <em>well-being.</em></h1>
          <p className="hero-lede" data-reveal data-now data-delay="200">
            Over a century of authentic Ayurvedic wisdom, now personal care in the heart of Kozhikode, opposite the railway station.
          </p>
          <div className="hero-actions" data-reveal data-now data-delay="320">
            <Link className="cta cta-lg" href="/book">Book a consultation <span aria-hidden="true">→</span></Link>
            <Link className="btn-ghost" href="/clinics">Explore the speciality clinics <span aria-hidden="true">→</span></Link>
          </div>
          <ul className="hero-facts" data-reveal data-now data-delay="440">
            <li><b>Since {FOUNDED}</b>A family pharmacy in Kozhikode</li>
            <li><b>{CLINICS.length + 1} clinics</b>Under one roof in Kozhikode</li>
            <li><b>Kerala Panchakarma</b>Given by hand</li>
          </ul>
        </div>

        <figure className="hero-media">
          <div className="arch" data-unveil data-now>
            <video src="/media/oil.mp4" poster="/media/k09.jpg" autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
          </div>
          <span className="arch-ring" aria-hidden="true" />
          <svg className="hero-seal" viewBox="0 0 124 124" aria-hidden="true">
            <defs><path id="seal" d="M62 62 m-48 0 a48 48 0 1 1 96 0 a48 48 0 1 1 -96 0" /></defs>
            <text><textPath href="#seal">AVVVS · Since 1921 · Kozhikode · Kerala ·</textPath></text>
            <circle cx="62" cy="62" r="4" fill="var(--gold)" />
          </svg>
          <figcaption className="hero-tag" data-reveal data-now data-delay="900">
            <span>Shirodhara</span><span lang="ml">ശിരോധാര</span>
          </figcaption>
        </figure>

        <svg className="hero-thread" viewBox="0 0 1440 300" preserveAspectRatio="none" aria-hidden="true" data-draw>
          <path d="M-20 260 C 260 120, 520 300, 820 180 S 1260 40, 1460 120" />
        </svg>
        <p className="hero-scroll" aria-hidden="true"><i />Scroll</p>
      </section>

      <TherapyBand />

      {/* ---------- what the clinic is ---------- */}
      <section className="statement" aria-labelledby="about-title">
        <p className="kicker" id="about-title">The clinic</p>
        <div>
          <p className="statement-text" data-words>
            We offer specialised care for headaches, chronic pain, obesity, lifestyle disorders, reproductive health, skin and hair, and pregnancy and postnatal care, <em>blending traditional Kerala Ayurveda with personalised medical care.</em>
          </p>
        </div>
        <ul className="stats">
          <li><b><span data-count={YEARS}>{YEARS}</span><sup>yrs</sup></b>of Ayurveda from AVVVS, since {FOUNDED}</li>
          <li><b><span data-count={CLINICS.length + 1}>{CLINICS.length + 1}</span></b>speciality clinics, including Gloveda Revive</li>
          <li><b><span data-count={THERAPIES.length}>{THERAPIES.length}</span></b>classical Kerala therapies</li>
        </ul>
        <div style={{ gridColumn: '2', marginTop: 'clamp(40px, 5vw, 64px)' }}>
          <Answer>{CLINIC.description}</Answer>
        </div>
      </section>

      <Thread />

      {/* ---------- the speciality clinics ---------- */}
      <section className="sec" aria-labelledby="clinics-title" style={{ paddingTop: 'clamp(40px, 5vw, 80px)' }}>
        <div className="sec-head">
          <p className="kicker">Speciality clinics</p>
          <h2 id="clinics-title" data-split>Care, organised around what you came for.</h2>
          <p data-reveal>Each clinic begins with a consultation and a plan written for you: Ayurvedic treatment, therapies, diet and daily routine, and modern medicine where it helps.</p>
        </div>
        <ClinicIndex />
      </section>

      <TherapyRail />

      {/* ---------- integrated care ---------- */}
      <section className="sec feature" aria-labelledby="int-title">
        <figure className="feature-media" data-unveil>
          <div className="feature-pan" data-parallax="0.08">
            <Image src="/media/k03.jpg" alt="A hand holding a medicinal leaf in the forest" fill sizes="(min-width: 860px) 40vw, 100vw" style={{ objectPosition: '70% 50%' }} />
          </div>
        </figure>
        <div className="feature-copy">
          <p className="kicker">Pain Management Clinic</p>
          <h2 id="int-title" data-split>Ayurveda and modern medicine, in one room.</h2>
          <p data-reveal>Living with pain can make even the simplest everyday activities difficult. The Pain Management Clinic combines Ayurvedic therapies with modern medical care, in a personalised plan to manage pain, improve mobility and get back to living more comfortably.</p>
          <div className="doc" data-reveal>
            <span className="doc-mono" aria-hidden="true">RK</span>
            <span className="doc-name">{DOCTOR.name}</span>
            <span className="doc-q">{DOCTOR.qualifications.map((q) => <span key={q}>{q}</span>)}</span>
          </div>
          <div data-reveal><Link className="btn-ghost" href="/clinics/pain-management-clinic">About the Pain Management Clinic <span aria-hidden="true">→</span></Link></div>
        </div>
      </section>

      {/* ---------- Gloveda Revive ---------- */}
      <section className="revive" aria-labelledby="revive-title">
        <span className="revive-orb" aria-hidden="true" />
        <div className="sec revive-inner">
          <h2 id="revive-title" className="revive-word" data-split>Gloveda <span>Revive</span></h2>
          <div className="revive-copy">
            <p className="kicker">{REVIVE.kicker}</p>
            <p data-reveal>{REVIVE.body[1]}</p>
            <ul className="pillars" data-stagger>{REVIVE.pillars.map((p) => <li key={p}>{p}</li>)}</ul>
            <div data-reveal><Link className="btn-ghost" href={`/clinics/${REVIVE.slug}`}>Discover Gloveda Revive <span aria-hidden="true">→</span></Link></div>
          </div>
        </div>
      </section>

      <VisitSection />

      <JournalStrip />

      <Faq id="home-faq" title="What people ask before their first visit" items={HOME_FAQ} />

      <BookInvite />
      <JsonLd data={medicalPageLd({ path: '/', name: CLINIC.name, description: CLINIC.description })} />
    </main>
  );
}
