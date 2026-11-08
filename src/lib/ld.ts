import { CLINIC, FOUNDED, PARENT_URL, SITE_URL, abs } from './site';
import type { Doctor } from './content';
import { CLINICS, REVIVE, type QA } from './clinics';
import type { Therapy } from './therapies';
import type { Post } from './journal';

/*
 * Schema.org structured data. One MedicalClinic entity (#clinic) that every page points back to,
 * with each speciality clinic as a department; a Physician per doctor and a MedicalTherapy per
 * therapy, each with a stable @id on its own page; and per-page BreadcrumbList, FAQPage,
 * MedicalWebPage, ItemList and BlogPosting. Only facts the clinic has stated: no ratings, prices,
 * opening hours or coordinates until the clinic confirms them.
 */

const ID = { clinic: `${SITE_URL}/#clinic`, site: `${SITE_URL}/#website`, parent: `${PARENT_URL}/#organization` };
export const doctorId = (slug: string) => `${abs(`/doctors/${slug}`)}#physician`;
export const therapyId = (slug: string) => `${abs(`/therapies/${slug}`)}#therapy`;
const imageUrl = (src: string) => (src.startsWith('/') ? abs(src) : src);
const phones = CLINIC.phones.map((p) => p.replace(/\s/g, ''));

const address = {
  '@type': 'PostalAddress',
  streetAddress: CLINIC.address.street,
  addressLocality: 'Kozhikode (Calicut)',
  addressRegion: CLINIC.address.region,
  postalCode: CLINIC.address.postalCode,
  addressCountry: CLINIC.address.country,
};

const AREA = [
  { '@type': 'City', name: 'Kozhikode', alternateName: 'Calicut' },
  { '@type': 'AdministrativeArea', name: 'Kozhikode district' },
  { '@type': 'AdministrativeArea', name: 'Malabar' },
  { '@type': 'State', name: 'Kerala' },
];

/** The conditions each speciality clinic page is about (the clinic's own wording). */
export const CONDITIONS: Record<string, string[]> = {
  'headache-clinic': ['Headache', 'Migraine', 'Tension headache', 'Cluster headache', 'Sinus headache'],
  'pain-management-clinic': ['Chronic pain'],
  'obesity-lifestyle-clinic': ['Obesity', 'Metabolic disorders', 'Lifestyle diseases'],
  'infertility-clinic': ['Male infertility', 'Female infertility'],
  'pregnancy-postnatal-care-clinic': ['Pregnancy', 'Postpartum period'],
  'gloveda-revive': ['Skin conditions', 'Hair conditions'],
};

export function clinicLd(doctors: Doctor[] = [], therapies: Therapy[] = []) {
  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalClinic', 'LocalBusiness'],
    '@id': ID.clinic,
    name: CLINIC.name,
    alternateName: ['AVVVS Ayur Specialty Clinic', 'AVVVS Clinic', 'AVVVS Ayurveda Clinic Kozhikode', 'AVVVS Ayurveda Clinic Calicut', 'Arya Vaidya Vilasini Vaidya Sala Clinic'],
    url: SITE_URL,
    description: CLINIC.description,
    slogan: 'Over a century of authentic Ayurvedic wisdom.',
    image: [abs('/opengraph-image'), abs('/photos/shirodhara.jpg')],
    logo: abs('/brand/avvvs-since-1921.svg'),
    email: CLINIC.email,
    telephone: phones[0],
    contactPoint: phones.map((t) => ({ '@type': 'ContactPoint', telephone: t, contactType: 'appointments', areaServed: 'IN', availableLanguage: ['English', 'Malayalam'] })),
    address,
    hasMap: CLINIC.maps,
    areaServed: AREA,
    isAcceptingNewPatients: true,
    knowsAbout: ['Ayurveda', 'Kerala Ayurveda', 'Panchakarma', ...therapies.map((t) => t.name), 'Headache', 'Migraine', 'Chronic pain', 'Obesity', 'Lifestyle diseases', 'Infertility', 'Pregnancy care', 'Postnatal care', 'Skin care', 'Hair care'],
    department: [
      ...CLINICS.map((c) => ({ '@type': 'MedicalClinic', '@id': `${abs(`/clinics/${c.slug}`)}#clinic`, name: `${c.name}, ${CLINIC.name}`, url: abs(`/clinics/${c.slug}`), description: c.short, address })),
      { '@type': 'MedicalClinic', '@id': `${abs(`/clinics/${REVIVE.slug}`)}#clinic`, name: `${REVIVE.name}, ${REVIVE.kicker}`, url: abs(`/clinics/${REVIVE.slug}`), description: REVIVE.short, address },
    ],
    availableService: therapies.map((t) => ({ '@id': therapyId(t.slug) })),
    employee: doctors.map((d) => ({ '@id': doctorId(d.slug) })),
    parentOrganization: { '@type': 'Organization', '@id': ID.parent, name: CLINIC.legal, url: PARENT_URL, foundingDate: String(FOUNDED), foundingLocation: 'Kozhikode, Kerala' },
    sameAs: [PARENT_URL, ...CLINIC.social.map((s) => s.href)],
    potentialAction: { '@type': 'ReserveAction', target: { '@type': 'EntryPoint', urlTemplate: abs('/book'), actionPlatform: ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform'] }, name: 'Book a consultation' },
    currenciesAccepted: 'INR',
  };
}

function physician(d: Doctor) {
  return {
    '@type': 'Physician', '@id': doctorId(d.slug), name: d.name, url: abs(`/doctors/${d.slug}`), honorificSuffix: d.quals.join(', '),
    ...(d.photo ? { image: imageUrl(d.photo) } : {}), ...(d.role ? { jobTitle: d.role } : {}),
    worksFor: { '@id': ID.clinic }, memberOf: { '@id': ID.clinic }, address, areaServed: AREA,
    hasCredential: d.quals.map((q) => ({ '@type': 'EducationalOccupationalCredential', credentialCategory: 'degree', name: q })),
  };
}

/** Every doctor, on every page (the clinic entity points to them). */
export function doctorLd(doctors: Doctor[]) {
  return { '@context': 'https://schema.org', '@graph': doctors.map(physician) };
}

/** A doctor's own page: a ProfilePage whose main entity is the Physician. */
export function physicianLd(d: Doctor, path: string) {
  return {
    '@context': 'https://schema.org', '@type': 'ProfilePage', '@id': `${abs(path)}#page`, url: abs(path), name: d.name,
    inLanguage: 'en-IN', isPartOf: { '@id': ID.site }, mainEntity: physician(d),
  };
}

export function therapyLd(t: Therapy) {
  return {
    '@context': 'https://schema.org', '@type': 'MedicalTherapy', '@id': therapyId(t.slug), name: t.name,
    ...(t.ml ? { alternateName: t.ml } : {}), description: `${t.what}${t.how ? ` ${t.how}` : ''}`, url: abs(`/therapies/${t.slug}`),
    image: imageUrl(t.img), relevantSpecialty: 'Ayurveda',
    provider: { '@id': ID.clinic },
    ...(t.clinics?.length ? { isRelatedTo: t.clinics.map((c) => ({ '@id': `${abs(`/clinics/${c}`)}#clinic` })) } : {}),
  };
}

/** All therapies, as defined entities (on the therapies index, so each has a page and an @id). */
export function therapiesLd(therapies: Therapy[]) {
  return { '@context': 'https://schema.org', '@graph': therapies.map((t) => ({ ...therapyLd(t), '@context': undefined })) };
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org', '@type': 'WebSite', '@id': ID.site, url: SITE_URL, name: CLINIC.name,
    alternateName: 'AVVVS Clinic', inLanguage: 'en-IN', publisher: { '@id': ID.clinic },
  };
}

export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: abs(t.path) })),
  };
}

export function itemListLd(name: string, items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org', '@type': 'ItemList', name,
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: abs(it.path) })),
  };
}

export function faqLd(items: QA[]) {
  return {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
}

/** A medical page: what it is about, who publishes it, and the quotable summary marked speakable. */
export function medicalPageLd({ path, name, description, about, conditions }: { path: string; name: string; description: string; about?: string; conditions?: string[] }) {
  const subject = conditions?.length
    ? conditions.map((c) => ({ '@type': 'MedicalCondition', name: c }))
    : about ? { '@type': 'MedicalTherapy', name: about } : { '@id': ID.clinic };
  return {
    '@context': 'https://schema.org', '@type': 'MedicalWebPage', '@id': `${abs(path)}#page`, url: abs(path), name, description,
    inLanguage: 'en-IN', isPartOf: { '@id': ID.site }, about: subject, audience: { '@type': 'Patient' },
    publisher: { '@id': ID.clinic }, specialty: 'Ayurveda',
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '[data-answer]'] },
  };
}

export function postLd(p: Post, reviewer?: Doctor) {
  return {
    '@context': 'https://schema.org', '@type': 'BlogPosting', '@id': `${abs(`/journal/${p.slug}`)}#post`,
    headline: p.title, description: p.dek, abstract: p.answer, image: imageUrl(p.cover.src), url: abs(`/journal/${p.slug}`),
    datePublished: p.published, dateModified: p.revised, inLanguage: 'en-IN', articleSection: p.kind,
    author: { '@type': 'Organization', '@id': ID.clinic, name: CLINIC.name },
    ...(reviewer ? { reviewedBy: { '@id': doctorId(reviewer.slug), '@type': 'Physician', name: reviewer.name } } : {}),
    publisher: { '@type': 'Organization', '@id': ID.parent, name: CLINIC.legal, logo: { '@type': 'ImageObject', url: abs('/brand/avvvs-since-1921.svg') } },
    mainEntityOfPage: abs(`/journal/${p.slug}`), isPartOf: { '@id': ID.site },
    ...(p.treatments?.length ? { about: p.treatments.map((t) => ({ '@id': therapyId(t) })) } : {}),
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '[data-answer]'] },
  };
}
