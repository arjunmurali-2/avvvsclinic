import { CLINIC } from './site';
import { THERAPIES } from './therapies';
import type { QA } from './clinics';

// The clinic's Journal. Written for general information, never as medical advice, and without
// promising outcomes. Each piece opens with a short answer that can be quoted on its own (AEO),
// and ends with questions that become FAQPage data. Have the clinic's doctors review each piece
// before it goes live (README).

export type Block =
  | { t: 'p'; text: string }
  | { t: 'h2'; text: string }
  | { t: 'ul'; items: string[] }
  | { t: 'ol'; items: { h: string; p: string }[] }
  | { t: 'note'; h: string; text: string }
  | { t: 'quote'; text: string }
  | { t: 'img'; url: string; alt: string; caption?: string };

export interface Post {
  slug: string;
  title: string;
  dek: string;
  kind: string;
  minutes: number;
  published: string;
  revised: string;
  cover: { src: string; alt: string; position?: string };
  /** two or three sentences that answer the title's question outright */
  answer: string;
  blocks: Block[];
  faq?: QA[];
  clinic?: string;
  /** therapies this article is about (slugs) */
  treatments?: string[];
  /** written in the admin rather than built into the site */
  fromAdmin?: boolean;
  /** slug of the clinic doctor who medically reviewed it, when one has */
  reviewer?: string;
}

export const POSTS: Post[] = [
  {
    slug: 'your-first-ayurveda-consultation',
    title: 'What happens at your first Ayurveda consultation',
    dek: 'What the doctor will ask, what to bring, and how a plan is made: the first visit to the clinic, step by step.',
    kind: 'Visiting the clinic',
    minutes: 5,
    published: '2026-11-08',
    revised: '2026-11-08',
    cover: { src: '/photos/pulse.jpg', alt: 'A doctor reading a patient’s pulse at the wrist', position: '55% 50%' },
    answer: 'A first Ayurveda consultation is an unhurried conversation and examination. The doctor asks about your concern, your health history, diet, digestion, sleep and routine, examines you, and then explains a personalised plan, which may include medicines, therapies, diet and lifestyle changes.',
    blocks: [
      { t: 'p', text: 'Ayurveda looks at the person before the complaint. That is why the first visit to AVVVS Ayur Speciality Clinic takes longer than a quick prescription, and why the questions reach well past the reason you came.' },
      { t: 'h2', text: 'Before you come' },
      { t: 'ul', items: [
        'A list of every medicine and supplement you take, with doses.',
        'Recent test results, scans and discharge summaries, on paper or on your phone.',
        'A few notes on when your concern began, what makes it better or worse, and what you have already tried.',
      ] },
      { t: 'h2', text: 'In the consultation room' },
      { t: 'ol', items: [
        { h: 'Your story', p: 'What brings you in, in your own words, and how it affects your days and nights.' },
        { h: 'Your history', p: 'Past illnesses, surgeries, family health, and for women, menstrual and pregnancy history.' },
        { h: 'Your day', p: 'Food, appetite, digestion, sleep, work, exercise and stress: the patterns Ayurveda pays closest attention to.' },
        { h: 'Examination', p: 'A physical examination, which in Ayurveda traditionally includes reading the pulse, and looking at the tongue, skin and eyes.' },
        { h: 'Your plan', p: 'The doctor explains what they think is going on and proposes a plan. Ask anything; a good plan is one you understand.' },
      ] },
      { t: 'h2', text: 'What a plan can include' },
      { t: 'p', text: 'Depending on what you need, a plan may combine Ayurvedic medicines, therapies such as Abhyanga, Shirodhara or Elakizhi, dietary guidance and changes to daily routine. Some plans are a single visit and a follow-up; others are a course of therapies over several days.' },
      { t: 'note', h: 'Keep your other doctors informed', text: 'Ayurvedic care can sit alongside the care you already receive. Do not stop or change a prescribed medicine without the advice of the doctor who prescribed it, and tell every doctor what the others have given you.' },
    ],
    faq: [
      { q: 'How long is a first Ayurveda consultation?', a: 'Longer than a routine appointment, because the doctor asks about your history, diet, digestion, sleep and routine as well as your main concern. Allow time and do not book it between other commitments.' },
      { q: 'What should I bring to my first consultation?', a: 'A list of your medicines and supplements, recent test results and scans, and a few notes on your concern: when it began and what makes it better or worse.' },
    ],
  },
  {
    slug: 'kerala-panchakarma-therapies-explained',
    title: 'Pizhichil, Shirodhara, Elakizhi: Kerala’s classical therapies, explained',
    dek: 'What each of the clinic’s six therapies actually involves, from the oil to the hands that give it.',
    kind: 'Therapies',
    treatments: ['pizhichil', 'shirodhara', 'abhyanga', 'elakizhi', 'njavarakizhi', 'udwarthana'],
    minutes: 6,
    published: '2026-11-08',
    revised: '2026-11-08',
    cover: { src: '/photos/elakizhi.jpg', alt: 'Herbal leaf poultices warming in a brass pan', position: '50% 50%' },
    answer: 'Kerala’s classical Ayurvedic therapies are hands-on treatments with warm medicated oils, herbal poultices and powders. At AVVVS Ayur Speciality Clinic they include Pizhichil, Shirodhara, Abhyanga, Elakizhi, Njavarakizhi and Udwarthana, each chosen by the doctor after a consultation.',
    blocks: [
      { t: 'p', text: 'Kerala gave Ayurveda some of its most distinctive treatments: therapies built around warm oil, medicinal leaves and rice, and the trained hands of therapists working in rhythm. They are given at AVVVS Ayur Speciality Clinic with oils and preparations from a pharmacy that has made Ayurveda medicines in Kozhikode since 1921.' },
      ...THERAPIES.flatMap((t): Block[] => [
        { t: 'h2', text: `${t.name} (${t.ml})` },
        { t: 'p', text: `${t.what} ${t.how}` },
      ]),
      { t: 'h2', text: 'Which one is right for you?' },
      { t: 'p', text: 'That is the doctor’s decision, made after a consultation. The choice of therapy, the oil or preparation, the number of sittings and what you should do before and after all depend on you.' },
      { t: 'note', h: 'Panchakarma, briefly', text: 'Panchakarma is the classical Ayurvedic system of five cleansing procedures. In Kerala the word is often used more widely, for the therapies that prepare for and accompany it, like the ones above.' },
    ],
    faq: [
      { q: 'What is Pizhichil?', a: 'Pizhichil is a Kerala Ayurvedic therapy in which warm medicated oil is poured over the body in a continuous stream while therapists massage in rhythm.' },
      { q: 'What is the difference between Elakizhi and Njavarakizhi?', a: 'Elakizhi uses poultices of medicinal leaves warmed in oil. Njavarakizhi uses bundles of Njavara rice cooked in milk and herbal decoction.' },
      { q: 'Where can I have Pizhichil or Shirodhara in Kozhikode?', a: `At ${CLINIC.name}, 3rd floor, Kaloor Central, Annie Hall Road, opposite Kozhikode Railway Station, after a consultation with the clinic's doctor.` },
    ],
  },
  {
    slug: 'headaches-when-to-see-a-doctor',
    title: 'Headaches that keep coming back: what to know before you seek care',
    dek: 'Migraine, tension, cluster and sinus headaches, the warning signs that need an emergency room, and what the Headache Clinic looks at.',
    kind: 'Headache Clinic',
    minutes: 5,
    published: '2026-11-08',
    revised: '2026-11-08',
    cover: { src: '/photos/shirodhara.jpg', alt: 'Shirodhara, warm oil streaming onto the forehead', position: '30% 50%' },
    answer: 'Most recurring headaches are migraine, tension, cluster or sinus headaches. A sudden, severe headache, or one with fever and a stiff neck, weakness, confusion or loss of vision, needs emergency care first. For persistent headaches, the AVVVS Headache Clinic offers personalised Ayurvedic care.',
    blocks: [
      { t: 'note', h: 'First, the warning signs', text: 'Go to an emergency department at once for a sudden, severe headache unlike any before; a headache with fever and a stiff neck; with confusion, weakness, numbness or difficulty speaking; with loss of vision; or after a head injury.' },
      { t: 'h2', text: 'The four common kinds' },
      { t: 'ol', items: [
        { h: 'Migraine', p: 'Recurring, often one-sided and throbbing, sometimes with nausea or sensitivity to light and sound.' },
        { h: 'Tension headache', p: 'A tight band around the head, often linked with stress, posture and long hours at a screen.' },
        { h: 'Cluster headache', p: 'Short bouts of severe pain around one eye, coming in groups over days or weeks.' },
        { h: 'Sinus headache', p: 'Pressure around the forehead, eyes and cheeks, often with congestion.' },
      ] },
      { t: 'h2', text: 'How Ayurveda approaches headache' },
      { t: 'p', text: 'Ayurveda focuses on identifying underlying imbalances and managing symptoms through personalised treatments, therapies and lifestyle modifications. At the Headache Clinic that starts with a consultation about the pattern of your headaches, your sleep, diet, work and stress.' },
      { t: 'h2', text: 'Keep a headache diary' },
      { t: 'p', text: 'Two or three weeks of notes make a first consultation far more useful:' },
      { t: 'ul', items: ['When each headache started and how long it lasted', 'Where it was, and what it felt like', 'What you had eaten, how you had slept, and what you were doing', 'What you took for it, and whether it helped'] },
    ],
    faq: [
      { q: 'When is a headache an emergency?', a: 'A sudden, severe headache unlike any before, or a headache with fever and a stiff neck, confusion, weakness, numbness, loss of vision, or after a head injury, needs emergency care at once.' },
      { q: 'What are the common types of recurring headache?', a: 'Migraine, tension headache, cluster headache and sinus headache.' },
    ],
    clinic: 'headache-clinic',
  },
  {
    slug: 'finding-the-clinic-kozhikode-railway-station',
    title: 'Finding the clinic: opposite Kozhikode Railway Station',
    dek: 'Where the clinic is, how to reach it, and why being beside the station makes a course of therapies easier from anywhere in Malabar.',
    kind: 'Visiting the clinic',
    minutes: 3,
    published: '2026-11-08',
    revised: '2026-11-08',
    cover: { src: '/photos/herbs.jpg', alt: 'Kerala herbs on linen', position: '50% 50%' },
    answer: 'AVVVS Ayur Speciality Clinic is on the 3rd floor of Kaloor Central, Annie Hall Road, directly opposite Kozhikode Railway Station, Kozhikode 673002. Call +91 99469 29448 or +91 80892 02092 for directions.',
    blocks: [
      { t: 'p', text: 'The clinic sits in the heart of Kozhikode, across the road from the railway station, which makes it one of the easiest Ayurveda clinics in the city to reach by train, bus or taxi.' },
      { t: 'h2', text: 'The address' },
      { t: 'p', text: `${CLINIC.name}, ${CLINIC.address.lines.join(', ')}.` },
      { t: 'h2', text: 'Coming by train' },
      { t: 'p', text: 'Leave Kozhikode Railway Station on the Annie Hall Road side and cross to Kaloor Central, opposite. The clinic is on the 3rd floor.' },
      { t: 'h2', text: 'Coming from out of town' },
      { t: 'p', text: 'Many therapies are given as a course over several days. Being next to the station means patients from across Malabar can travel in for their sittings without driving into the city centre. Tell the clinic where you are travelling from when you book, and they can help you plan your visits.' },
      { t: 'note', h: 'Lost?', text: `Call ${CLINIC.phones[0]} or ${CLINIC.phones[1]} and the clinic will guide you in.` },
    ],
    faq: [
      { q: 'Where is AVVVS Ayur Speciality Clinic?', a: 'On the 3rd floor of Kaloor Central, Annie Hall Road, opposite Kozhikode Railway Station, Kozhikode (Calicut), Kerala 673002.' },
      { q: 'Is there an Ayurveda clinic near Kozhikode Railway Station?', a: 'Yes. AVVVS Ayur Speciality Clinic is directly opposite Kozhikode Railway Station, on the 3rd floor of Kaloor Central, Annie Hall Road.' },
    ],
  },
];

export const postBySlug = (slug: string) => POSTS.find((p) => p.slug === slug);
export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
