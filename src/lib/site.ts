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
    lines: ['3rd floor, Kaloor Central', 'Annie Hall Road', 'Opp. Kozhikode Railway Station', 'Kozhikode, Kerala 673002'],
    street: '3rd floor, Kaloor Central, Annie Hall Road, opposite Kozhikode Railway Station',
    locality: 'Kozhikode',
    region: 'Kerala',
    postalCode: '673002',
    country: 'IN',
  },
  landmark: 'Opposite Kozhikode Railway Station',
  maps: 'https://www.google.com/maps/search/?api=1&query=Kaloor+Central+Annie+Hall+Road+Kozhikode+673002',
  description:
    'AVVVS Ayur Speciality Clinic in Kozhikode, Kerala, opposite the railway station, brings over a century of authentic Ayurvedic wisdom from Arya Vaidya Vilasini Vaidya Sala (founded 1921) to personalised care: speciality clinics for headache, pain management, obesity, lifestyle diseases, male and female infertility, and pregnancy and postnatal care, with authentic Kerala Panchakarma therapies and the Gloveda Revive Ayur-Medi Cosmetic Clinic for skin and hair.',
  social: [
    { label: 'Facebook', href: 'https://www.facebook.com/aryavaidyavilasini' },
    { label: 'Instagram', href: 'https://www.instagram.com/avvvsglobal/' },
    { label: 'X', href: 'https://www.twitter.com/avvvsglobal' },
  ],
} as const;

export const tel = (p: string) => `tel:${p.replace(/\s/g, '')}`;

export const DOCTOR = {
  name: 'Dr. Ranjith Kumar',
  qualifications: ['BAMS', 'MBBS', 'MD', 'DA'],
  role: 'Pain Management Clinic',
};
