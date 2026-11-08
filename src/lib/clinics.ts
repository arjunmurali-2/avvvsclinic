// The speciality clinics. Copy is the clinic's own (supplied 2026-11-08), set for the page; nothing
// here promises an outcome. "short" answers are written to be quoted on their own (AEO/GEO).

export interface QA { q: string; a: string }

export interface Clinic {
  slug: string;
  no: string;
  name: string;
  /** a two or three word label for menus and the booking form */
  label: string;
  kicker: string;
  title: string;
  /** one sentence, quotable on its own: what this clinic is */
  short: string;
  lede: string;
  body: string[];
  focus: { h: string; p: string }[];
  therapies: string[];
  image: { src: string; alt: string; position?: string };
  faq: QA[];
  lead?: string;
}

const consult: QA = {
  q: 'Should I stop my current medicines before an Ayurveda consultation?',
  a: 'No. Bring a list of the medicines and supplements you take, and any recent reports, to your consultation. Do not stop or change a prescribed treatment without the advice of the doctor who prescribed it.',
};

const book: QA = {
  q: 'How do I book an appointment?',
  a: 'Book a consultation on clinic.avvvs.com/book, or call +91 99469 29448 or +91 80892 02092. The clinic is on the 3rd floor of Kaloor Central, Annie Hall Road, opposite Kozhikode Railway Station.',
};

export const CLINICS: Clinic[] = [
  {
    slug: 'headache-clinic',
    no: '01',
    name: 'Headache Clinic',
    label: 'Headache',
    kicker: 'Speciality clinic',
    title: 'When headaches keep coming back',
    short: 'The AVVVS Headache Clinic in Kozhikode offers personalised Ayurvedic care for persistent headaches, including migraine, tension, cluster and sinus headaches.',
    lede: 'Persistent headaches can significantly affect daily life and well-being.',
    body: [
      'Common types include migraine, tension, cluster and sinus headaches.',
      'Ayurveda focuses on identifying underlying imbalances and managing symptoms through personalised treatments, therapies and lifestyle modifications.',
    ],
    focus: [
      { h: 'Migraine', p: 'Recurring headaches, often on one side, that can come with sensitivity to light or sound.' },
      { h: 'Tension headache', p: 'A band-like pressure that often follows stress, posture and long hours at a screen.' },
      { h: 'Cluster headache', p: 'Short, severe headaches that come in groups over days or weeks.' },
      { h: 'Sinus headache', p: 'Pain and pressure around the forehead, eyes and cheeks.' },
    ],
    therapies: ['shirodhara', 'abhyanga'],
    image: { src: '/media/k06.jpg', alt: 'Palm-leaf manuscripts beside a lit brass lamp', position: '60% 50%' },
    faq: [
      { q: 'Which headaches does the Headache Clinic see?', a: 'The clinic sees persistent headaches, including migraine, tension, cluster and sinus headaches. Care is personalised after a consultation.' },
      { q: 'When should a headache be seen in an emergency instead?', a: 'Seek emergency care at once for a sudden, severe headache unlike any before, or a headache with fever and a stiff neck, confusion, weakness, numbness, loss of vision, or one that follows a head injury.' },
      consult, book,
    ],
  },
  {
    slug: 'pain-management-clinic',
    no: '02',
    name: 'Pain Management Clinic',
    label: 'Pain management',
    kicker: 'Speciality clinic',
    title: 'Back to living more comfortably',
    short: 'The AVVVS Pain Management Clinic in Kozhikode combines Ayurvedic therapies with modern medical care under Dr. Ranjith Kumar (BAMS, MBBS, MD, DA), with personalised plans for chronic pain and mobility.',
    lede: 'Living with pain can make even the simplest everyday activities difficult, keeping you from doing the things you love.',
    body: [
      'AVVVS Ayur Speciality Clinic offers an integrated approach to pain management, combining Ayurvedic therapies with modern medical care under the guidance of Dr. Ranjith Kumar (BAMS, MBBS, MD, DA).',
      'Through personalised treatment plans, we help you manage pain, improve mobility and get back to living life more comfortably.',
    ],
    focus: [
      { h: 'Integrated care', p: 'Ayurvedic therapies and modern medicine, considered together by one doctor.' },
      { h: 'Personalised plans', p: 'A plan written for your pain, your history and your daily life.' },
      { h: 'Mobility', p: 'Care aimed at moving more freely and getting back to everyday activities.' },
    ],
    therapies: ['elakizhi', 'njavarakizhi', 'pizhichil', 'abhyanga'],
    image: { src: '/media/k03.jpg', alt: 'A hand holding a medicinal leaf in the forest', position: '70% 50%' },
    lead: 'Under the guidance of Dr. Ranjith Kumar, BAMS, MBBS, MD, DA',
    faq: [
      { q: 'Who leads the Pain Management Clinic?', a: 'The Pain Management Clinic is guided by Dr. Ranjith Kumar (BAMS, MBBS, MD, DA), who is qualified in both Ayurveda and modern medicine.' },
      { q: 'What does an integrated approach to pain mean here?', a: 'Ayurvedic therapies are combined with modern medical care, in a personalised treatment plan for managing pain and improving mobility.' },
      consult, book,
    ],
  },
  {
    slug: 'obesity-management-clinic',
    no: '03',
    name: 'Obesity Management Clinic',
    label: 'Obesity management',
    kicker: 'Speciality clinic',
    title: 'More than a number on the scale',
    short: 'The AVVVS Obesity Management Clinic in Kozhikode combines the Ayurvedic therapy Udwarthana with modern body-contouring technologies, dietary guidance and exercise to support healthy weight management.',
    lede: 'Obesity is more than a change in body weight; it can affect your overall health, mobility and quality of life.',
    body: [
      'AVVVS Ayur Speciality Clinic combines traditional Ayurvedic therapies such as Udwarthana with modern body-contouring technologies, dietary guidance and exercise.',
      'Together they support healthy weight management, improve metabolic health and promote overall well-being.',
    ],
    focus: [
      { h: 'Udwarthana', p: 'The traditional dry herbal-powder massage, given by trained therapists.' },
      { h: 'Body contouring', p: 'Modern body-contouring technologies, alongside the Ayurvedic therapies.' },
      { h: 'Diet and exercise', p: 'Dietary guidance and exercise that fit the life you actually lead.' },
    ],
    therapies: ['udwarthana', 'abhyanga'],
    image: { src: '/media/k02.jpg', alt: 'A tulsi plant in a shaft of forest light', position: '55% 50%' },
    faq: [
      { q: 'What does the Obesity Management Clinic offer?', a: 'Traditional Ayurvedic therapies such as Udwarthana, modern body-contouring technologies, dietary guidance and exercise, combined to support healthy weight management and metabolic health.' },
      { q: 'What is Udwarthana?', a: 'Udwarthana is a traditional Ayurvedic massage with dry herbal powders, given with firm upward strokes. Your doctor decides whether it suits you.' },
      consult, book,
    ],
  },
  {
    slug: 'lifestyle-diseases-clinic',
    no: '04',
    name: 'Lifestyle Diseases Clinic',
    label: 'Lifestyle diseases',
    kicker: 'Speciality clinic',
    title: 'Care that fits the way you live now',
    short: 'The AVVVS Lifestyle Diseases Clinic in Kozhikode helps people manage metabolic and lifestyle disorders through personalised Ayurvedic treatment, dietary guidance and lifestyle modification.',
    lede: 'Changing lifestyles, work patterns and dietary habits can contribute to metabolic disorders.',
    body: [
      'AVVVS Ayur Speciality Clinic helps you manage these conditions through personalised Ayurvedic treatments, dietary guidance and lifestyle modifications.',
      'The aim is better health and overall well-being, worked out around your day.',
    ],
    focus: [
      { h: 'Personalised treatment', p: 'Ayurvedic treatment chosen for you after a consultation.' },
      { h: 'Dietary guidance', p: 'What to eat, and when, in terms that work in a Kerala kitchen and an office canteen.' },
      { h: 'Lifestyle modification', p: 'Sleep, movement and routine, changed a step at a time.' },
    ],
    therapies: ['abhyanga', 'udwarthana'],
    image: { src: '/media/k01.jpg', alt: 'Morning light in a Western Ghats forest', position: '50% 50%' },
    faq: [
      { q: 'What does the Lifestyle Diseases Clinic help with?', a: 'Metabolic disorders linked to changing lifestyles, work patterns and dietary habits, managed through personalised Ayurvedic treatment, dietary guidance and lifestyle modification.' },
      consult, book,
    ],
  },
  {
    slug: 'infertility-clinic',
    no: '05',
    name: 'Male and Female Infertility Clinic',
    label: 'Infertility',
    kicker: 'Speciality clinic',
    title: 'Beside you on the way to parenthood',
    short: 'The AVVVS Male and Female Infertility Clinic in Kozhikode offers personalised Ayurvedic care for male and female reproductive health, with a holistic approach that supports couples on their journey towards parenthood.',
    lede: 'Fertility challenges can be an emotional and difficult journey for couples.',
    body: [
      'AVVVS Ayur Speciality Clinic offers personalised Ayurvedic care for male and female reproductive health, focusing on individual needs through specialised treatments and a holistic approach to reproductive well-being.',
      'Our aim is to support couples on their journey towards parenthood.',
    ],
    focus: [
      { h: 'For both partners', p: 'Care for male and for female reproductive health.' },
      { h: 'Individual needs', p: 'Specialised treatments chosen for each person, not a set package.' },
      { h: 'Holistic', p: 'Reproductive well-being considered alongside diet, rest and the whole of daily life.' },
    ],
    therapies: ['abhyanga'],
    image: { src: '/media/k04.jpg', alt: 'A single leaf held up to warm light', position: '35% 50%' },
    faq: [
      { q: 'Does the clinic see both partners?', a: 'Yes. The clinic offers personalised Ayurvedic care for both male and female reproductive health.' },
      { q: 'Can I continue fertility treatment elsewhere while I consult here?', a: 'Tell the clinic about any fertility treatment and medicines you are on. Do not stop or change prescribed treatment without the advice of the doctor managing it.' },
      book,
    ],
  },
  {
    slug: 'pregnancy-postnatal-care-clinic',
    no: '06',
    name: 'Pregnancy and Postnatal Care Clinic',
    label: 'Pregnancy and postnatal',
    kicker: 'Speciality clinic',
    title: 'Nurturing the mother who nurtures new life',
    short: 'The AVVVS Pregnancy and Postnatal Care Clinic in Kozhikode offers personalised Ayurvedic pregnancy and postnatal care, with dietary guidance and supportive therapies for mothers at every stage.',
    lede: 'Pregnancy and motherhood bring changing care needs at every stage.',
    body: [
      'Ayurveda emphasises nurturing the mother who nurtures new life, recognising the importance of her health and well-being.',
      'AVVVS Ayur Speciality Clinic offers personalised Ayurvedic pregnancy and postnatal care, with dietary guidance and supportive therapies to care for mothers throughout this journey.',
    ],
    focus: [
      { h: 'During pregnancy', p: 'Personalised care and dietary guidance, alongside your obstetric care.' },
      { h: 'After birth', p: 'Supportive postnatal therapies in the Kerala tradition of caring for a new mother.' },
      { h: 'Every stage', p: 'Care that changes as your needs change, month by month.' },
    ],
    therapies: ['abhyanga'],
    image: { src: '/media/k08.jpg', alt: 'Ripples spreading across warm oil', position: '50% 50%' },
    faq: [
      { q: 'Does Ayurvedic pregnancy care replace my obstetrician?', a: 'No. Ayurvedic pregnancy care at the clinic is given alongside your regular antenatal care. Keep all your obstetric appointments and tell both doctors about every medicine you take.' },
      { q: 'What does postnatal care at the clinic include?', a: 'Personalised Ayurvedic postnatal care, with dietary guidance and supportive therapies chosen for the mother after a consultation.' },
      book,
    ],
  },
];

export const LIFESTYLE_NOTE = 'Speciality care for headaches, chronic pain, obesity, lifestyle disorders, reproductive health, skin and hair, and pregnancy and postnatal care.';

export const clinicBySlug = (slug: string) => CLINICS.find((c) => c.slug === slug);

/** Gloveda Revive: the clinic's Ayur-Medi Cosmetic Clinic for skin and hair. */
export const REVIVE = {
  slug: 'gloveda-revive',
  name: 'Gloveda Revive',
  kicker: 'Ayur-Medi Cosmetic Clinic',
  short: 'Gloveda Revive is an Ayur-Medi Cosmetic Clinic and Treatment Centre at AVVVS Ayur Speciality Clinic, Kozhikode, combining traditional Ayurvedic formulations with modern skin and hair care technologies.',
  lede: 'Rooted in over 105 years of authentic Ayurvedic heritage, trust and expertise.',
  body: [
    'Gloveda Revive is an Ayur-Medi Cosmetic Clinic and Treatment Centre rooted in over 105 years of authentic Ayurvedic heritage, trust and expertise.',
    'Combining traditional Ayurvedic formulations with modern skin and hair care technologies, we offer specialised solutions for a wide range of skin and hair concerns, making us your destination for healthy skin, beautiful hair, wellness and longevity.',
  ],
  pillars: ['Healthy skin', 'Beautiful hair', 'Wellness', 'Longevity'],
};
