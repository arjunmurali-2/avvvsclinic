import type { Metadata } from 'next';
import { Close, Crumbs, Faq, JsonLd, More } from '@/components/Parts';
import { CLINIC, alternatesFor, tel } from '@/lib/site';
import { breadcrumbLd } from '@/lib/ld';

const DESCRIPTION = `${CLINIC.name} is on the 3rd floor of Kaloor Central, Annie Hall Road, directly opposite Kozhikode Railway Station, Kozhikode (Calicut), Kerala 673002. Call ${CLINIC.phones.join(' or ')}, or email ${CLINIC.email}.`;

export const metadata: Metadata = {
  title: 'Visit: opposite Kozhikode Railway Station',
  description: DESCRIPTION,
  alternates: alternatesFor('/visit'),
  openGraph: { url: '/visit', title: `Visit · ${CLINIC.name}`, description: DESCRIPTION },
};

const WAYS = [
  { h: 'By train', p: 'After exiting Kozhikode Railway Station on the Annie Hall Road side, cross the road to Kaloor Central, the building marked by the Neelagiri Heritage hotel sign. The clinic is located on the 3rd floor and is easily accessible by lift.' },
  { h: 'By road', p: 'Ask for the Neelagiri Heritage hotel in the Kaloor Central building on Annie Hall Road, opposite the railway station. Any auto or taxi in the city knows the station.' },
  { h: 'From further away', p: 'Many therapies are provided over several days. Located opposite Kozhikode Railway Station, the clinic is easily accessible to patients from across Malabar. Our in-house hotel, Neelagiri Heritage, on the first and second floors of the same building, offers convenient accommodation for those who wish to stay during their treatment. Let us know where you are travelling from when booking, and we can help plan your visits.' },
];

export default function VisitPage() {
  return (
    <main id="main">
      <section className="page-head">
        <div className="in-narrow">
          <Crumbs trail={[{ name: 'Visit' }]} />
          <h1 className="t-1" data-reveal data-now>Right opposite the station.</h1>
          <p className="lede" data-reveal data-now data-delay="120" data-answer>{DESCRIPTION}</p>
          <div className="actions" data-reveal data-now data-delay="220">
            <a className="btn" href={CLINIC.maps} target="_blank" rel="noopener">Get directions</a>
            <a className="more" href={tel(CLINIC.phones[0])}>Call {CLINIC.phones[0]}</a>
          </div>
        </div>
      </section>

      <section className="sec mist" aria-labelledby="way-title">
        <div className="in center head"><h2 id="way-title" className="t-2" data-reveal>Getting here.</h2></div>
        <ul className="way" data-stagger>
          {WAYS.map((w) => <li key={w.h}><h3>{w.h}</h3><p>{w.p}</p></li>)}
        </ul>
      </section>

      <section className="sec" aria-labelledby="reach-title">
        <div className="visit">
          <div data-reveal>
            <h2 id="reach-title" className="t-1">Talk to the clinic.</h2>
            <address>
              {CLINIC.name}<br />
              {CLINIC.address.lines.join(', ')}
            </address>
            <p className="small" style={{ marginTop: 14 }}>Call ahead to confirm the clinic’s timings and your doctor’s availability.</p>
          </div>
          <ul className="reach" data-stagger>
            {CLINIC.phones.map((p) => <li key={p}><a href={tel(p)}><span>{p}</span><span>Call</span></a></li>)}
            <li><a href={`mailto:${CLINIC.email}`}><span>{CLINIC.email}</span><span>Email</span></a></li>
            <li><a href={CLINIC.maps} target="_blank" rel="noopener"><span>Kaloor Central in Google Maps</span><span>Open</span></a></li>
          </ul>
        </div>
      </section>

      <Faq title="Before you come." tone="mist" items={[
        { q: 'What is the clinic’s address?', a: `${CLINIC.name}, ${CLINIC.address.lines.join(', ')}.` },
        { q: 'Is the clinic near Kozhikode Railway Station?', a: 'Yes, directly opposite it, on Annie Hall Road. The clinic is on the 3rd floor of Kaloor Central.' },
        { q: 'Do I need an appointment?', a: 'Booking ahead is best, so the right doctor can see you. Book online or call the clinic; it calls back to confirm a time.' },
        { q: 'What should I bring?', a: 'A list of the medicines and supplements you take, and any recent test results, scans or discharge summaries.' },
      ]} />
      <section className="sec" style={{ paddingBottom: 0 }}>
        <p className="center" data-reveal><More href="/doctors">Meet the doctors</More></p>
      </section>
      <Close />
      <JsonLd data={breadcrumbLd([{ name: 'Visit', path: '/visit' }])} />
    </main>
  );
}
