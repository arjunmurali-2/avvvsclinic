// The clinic's facts, in one place. Every page, the footer, the structured data and llms.txt read
// from here, so a change of phone number or address is made once.

/** The public address, fixed at build time (next.config.ts). Canonicals, sitemap and JSON-LD follow it. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://clinic.avvvs.com').replace(/\/$/, '');
export const abs = (path = '/') => `${SITE_URL}${path === '/' ? '' : path}`;

/** Vercel preview deployments stay out of search; only production is indexable. */
export const INDEXABLE = process.env.NEXT_PUBLIC_DEPLOY_ENV !== 'preview';

export const alternatesFor = (path: string) => ({ canonical: path, languages: { 'en-IN': path, 'x-default': path } });

export const PARENT_URL = 'https://avvvs.com';
export const FOUNDED = 1921;

export const CLINIC = {
  name: 'AVVVS Ayur Speciality Clinic',
  short: 'AVVVS Clinic',
  legal: 'Arya Vaidya Vilasini Vaidya Sala',
  malayalam: 'ആര്യവൈദ്യ വിലാസിനി വൈദ്യശാല',
  email: 'avvvsayurspecialityclinic@gmail.com',
  phones: ['+91 99469 29448', '+91 80892 02092'],
  address: {
    lines: ['3rd floor, Kaloor Central', 'Annie Hall Road', 'Opp. Kozhikode Railway Station', 'Kozhikode (Calicut), Kerala 673002'],
    street: '3rd floor, Kaloor Central, Annie Hall Road, opposite Kozhikode Railway Station',
    locality: 'Kozhikode',
    region: 'Kerala',
    postalCode: '673002',
    country: 'IN',
  },
  landmark: 'Opposite Kozhikode Railway Station',
  maps: 'https://www.google.com/maps/search/?api=1&query=Kaloor+Central+Annie+Hall+Road+Kozhikode+673002',
  pharmacy: 'https://shop.avvvs.com/',
  description:
    'AVVVS Ayur Speciality Clinic in Kozhikode (Calicut), Kerala, opposite Kozhikode Railway Station, brings over a century of authentic Ayurvedic wisdom from Arya Vaidya Vilasini Vaidya Sala (founded 1921) to personalised care: speciality clinics for headache, pain management, obesity and lifestyle management, male and female infertility, and pregnancy and postnatal care, with authentic Kerala Panchakarma therapies and the Gloveda Revive Ayur-Medi Cosmetic Clinic for skin and hair.',
  social: [
    { label: 'Facebook', href: 'https://www.facebook.com/aryavaidyavilasini' },
    { label: 'Instagram', href: 'https://www.instagram.com/avvvsglobal/' },
    { label: 'X', href: 'https://www.twitter.com/avvvsglobal' },
  ],
} as const;

export const tel = (p: string) => `tel:${p.replace(/\s/g, '')}`;

export const DOCTOR = {
  name: 'Dr. Ranjith Kumar',
  qualifications: ['BAMS', 'MBBS', 'DA', 'MD'],
  role: 'Pain Management Clinic',
};

/** The clinic's doctors, as the clinic listed them (2026-11-08, revised 2026-11-13). Roles only where the clinic has stated one. */
export const DOCTORS = [
  { slug: 'manoj-kaloor', name: 'Dr. Manoj Kaloor', quals: ['BAMS', 'MD (Ayu)'], role: 'Managing Director, AVVVS' },
  { slug: 'reeja-manoj', name: 'Dr. Reeja Manoj', quals: ['BAMS', 'FMC', 'PGDDF'], role: 'Medical Director, AVVVS' },
  { slug: 'henna-kunhabdhulla', name: 'Dr. Henna Kunhabdhulla', quals: ['BAMS', 'FMC'] },
  { slug: 'ranjith-kumar', name: 'Dr. Ranjith Kumar', quals: ['BAMS', 'MBBS', 'DA', 'MD'], role: 'Pain Management Clinic' },
  { slug: 'rekha-deepak', name: 'Dr. Rekha Deepak', quals: ['BAMS', 'MPH'] },
  { slug: 'archana-manoj', name: 'Dr. Archana Manoj', quals: ['BAMS', 'PGDAC'] },
  { slug: 'niyatha-kaloor', name: 'Dr. Niyatha Kaloor', quals: ['MBBS'] },
] as { slug: string; name: string; quals: string[]; role?: string }[];
