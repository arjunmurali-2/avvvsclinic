import Image from 'next/image';
import Link from 'next/link';
import { TherapyGallery } from '@/components/Gallery';
import { Close, Faq, JsonLd, More } from '@/components/Parts';
import { ClinicTiles, Doctors, Visit } from '@/components/Sections';
import { CLINICS } from '@/lib/clinics';
import { HOME_FAQ } from '@/lib/faq';
import { medicalPageLd } from '@/lib/ld';
import { CLINIC, DOCTOR, FOUNDED } from '@/lib/site';
import { getTherapies } from '@/lib/content';

export const revalidate = 300;

const YEARS = new Date().getFullYear() - FOUNDED;

export default async function Home() {
  const therapies = await getTherapies();
  return (
    <main id="main">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title" className="t-hero" data-reveal data-now>Rediscover health.</h1>
          <p className="lede" data-reveal data-now data-delay="120">Over a century of authentic Kerala Ayurveda, now personal care in the heart of Kozhikode.</p>
          <div className="actions" data-reveal data-now data-delay="240">
            <Link className="btn" href="/book">Book a consultation</Link>
            <More href="/clinics">Explore the clinics</More>
          </div>
        </div>
        <div className="hero-stage" data-hero>
          <div className="hero-frame">
            <div className="hero-pic">
              <Image src="/photos/shirodhara.jpg" alt="Warm oil streaming from a brass vessel onto the forehead during Shirodhara" fill priority sizes="100vw" />
              <div className="hero-caption">
                <p>Shirodhara</p>
                <span lang="ml">ശിരോധാര</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" aria-label="About the clinic">
        <p className="statement" data-fill data-answer>
          Specialised care for headaches, chronic pain, obesity, lifestyle disorders, fertility, skin and hair, and mothers before and after birth. Traditional Kerala Ayurveda, with modern medicine where it helps.
        </p>
        <ul className="facts" data-stagger>
          <li><b><span data-count={YEARS}>{YEARS}</span></b><span>years of AVVVS Ayurveda, since {FOUNDED}</span></li>
          <li><b>{CLINICS.length + 1}</b><span>speciality clinics under one roof</span></li>
          <li><b>{therapies.length}</b><span>Kerala therapies, given by hand</span></li>
        </ul>
      </section>

      <section className="sec mist" aria-labelledby="clinics-title" style={{ paddingTop: 'clamp(80px, 9vw, 130px)' }}>
        <div className="in center head">
          <h2 id="clinics-title" className="t-1" data-reveal>Care for what brought you here.</h2>
          <p className="lede" data-reveal data-delay="80">Every clinic begins with a consultation and a plan written for you.</p>
        </div>
        <ClinicTiles />
      </section>

      <section className="sec night on-night" aria-labelledby="therapies-title">
        <div className="in center head">
          <h2 id="therapies-title" className="t-1" data-reveal>Kerala’s classical therapies.</h2>
          <p className="lede" data-reveal data-delay="80">Authentic Panchakarma, given by hand, with oils from a pharmacy that has made Ayurveda medicines in Kozhikode since {FOUNDED}.</p>
        </div>
        <TherapyGallery items={therapies} />
      </section>

      <section className="sec" aria-labelledby="care-title">
        <div className="split">
          <figure className="split-pic" data-reveal>
            <Image src="/photos/pulse.jpg" alt="A doctor reading a patient’s pulse at the wrist" fill sizes="(min-width: 860px) 50vw, 100vw" style={{ objectPosition: '58% 50%' }} data-parallax="0.05" />
          </figure>
          <div className="split-copy" data-reveal>
            <h2 id="care-title" className="t-1">Ayurveda and modern medicine, in one room.</h2>
            <p className="lede">The Pain Management Clinic combines Ayurvedic therapies with modern medical care, in a personalised plan to manage pain, improve mobility and get back to living more comfortably.</p>
            <p className="doctor"><b>{DOCTOR.name}</b><span>{DOCTOR.qualifications.join(' · ')}</span></p>
            <More href="/clinics/pain-management-clinic">About the Pain Management Clinic</More>
          </div>
        </div>
      </section>

      <Doctors tone="mist" />

      <Visit />

      <Faq title="Questions, answered." items={HOME_FAQ} tone="mist" />

      <Close />
      <JsonLd data={medicalPageLd({ path: '/', name: CLINIC.name, description: CLINIC.description })} />
    </main>
  );
}
