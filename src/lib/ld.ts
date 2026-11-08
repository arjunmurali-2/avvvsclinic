import { CLINIC, FOUNDED, PARENT_URL, SITE_URL, abs } from './site';
import type { Doctor } from './content';
import { CLINICS, REVIVE, type QA } from './clinics';
import { THERAPIES } from './therapies';
import type { Post } from './journal';

// Schema.org structured data. One MedicalClinic entity (#clinic) that every page points back to,
// a Physician, and per-page BreadcrumbList, FAQPage, MedicalWebPage and BlogPosting.

const ID = { clinic: `${SITE_URL}/#clinic`, site: `${SITE_URL}/#website`, parent: `${PARENT_URL}/#organization` };
const phones = CLINIC.phones.map((p) => p.replace(/\s/g, ''));

const address = {
  '@type': 'PostalAddress',
  streetAddress: CLINIC.address.street,
  addressLocality: CLINIC.address.locality,
  addressRegion: CLINIC.address.region,
  postalCode: CLINIC.address.postalCode,
  addressCountry: CLINIC.address.country,
};

export function clinicLd(doctors: Doctor[] = []) {
  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalClinic', 'LocalBusiness'],
    '@id': ID.clinic,
    name: CLINIC.name,
    alternateName: ['AVVVS Ayur Specialty Clinic', 'AVVVS Clinic Kozhikode', 'AVVVS Ayurveda Clinic'],
    url: SITE_URL,
    description: CLINIC.description,
    image: abs('/opengraph-image'),
    logo: abs('/brand/avvvs-since-1921.svg'),
    email: CLINIC.email,
    telephone: phones,
    address,
    hasMap: CLINIC.maps,
    areaServed: [{ '@type': 'City', name: 'Kozhikode' }, { '@type': 'AdministrativeArea', name: 'Malabar, Kerala' }],
    knowsAbout: ['Ayurveda', 'Kerala Ayurveda', 'Panchakarma', ...THERAPIES.map((t) => t.name), 'Headache', 'Migraine', 'Chronic pain', 'Obesity', 'Lifestyle diseases', 'Infertility', 'Pregnancy care', 'Postnatal care', 'Skin care', 'Hair care'],
    availableService: [
      ...CLINICS.map((c) => ({ '@type': 'MedicalTherapy', name: c.name, description: c.short, url: abs(`/clinics/${c.slug}`) })),
      { '@type': 'MedicalTherapy', name: `${REVIVE.name} (${REVIVE.kicker})`, description: REVIVE.short, url: abs(`/clinics/${REVIVE.slug}`) },
      ...THERAPIES.map((t) => ({ '@type': 'MedicalTherapy', name: t.name, alternateName: t.ml, description: t.what, url: abs(`/therapies#${t.slug}`) })),
    ],
    employee: doctors.map((d) => ({ '@id': `${SITE_URL}/doctors#${d.slug}` })),
    parentOrganization: { '@type': 'Organization', '@id': ID.parent, name: CLINIC.legal, url: PARENT_URL, foundingDate: String(FOUNDED) },
    sameAs: CLINIC.social.map((s) => s.href),
    potentialAction: { '@type': 'ReserveAction', target: { '@type': 'EntryPoint', urlTemplate: abs('/book'), actionPlatform: ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform'] }, name: 'Book a consultation' },
    currenciesAccepted: 'INR',
  };
}

export function doctorLd(doctors: Doctor[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': doctors.map((d) => ({
      '@type': 'Physician', '@id': `${SITE_URL}/doctors#${d.slug}`, name: d.name, honorificSuffix: d.quals.join(', '),
      ...(d.photo ? { image: d.photo.startsWith('/') ? abs(d.photo) : d.photo } : {}), jobTitle: d.role, worksFor: { '@id': ID.clinic }, address,
      hasCredential: d.quals.map((q) => ({ '@type': 'EducationalOccupationalCredential', credentialCategory: 'degree', name: q })),
    })),
  };
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org', '@type': 'WebSite', '@id': ID.site, url: SITE_URL, name: CLINIC.name,
    inLanguage: 'en-IN', publisher: { '@id': ID.clinic },
  };
}

export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: abs(t.path) })),
  };
}

export function faqLd(items: QA[]) {
  return {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
}

/** A medical page: says who it is about and marks the quotable summary as speakable. */
export function medicalPageLd({ path, name, description, about }: { path: string; name: string; description: string; about?: string }) {
  return {
    '@context': 'https://schema.org', '@type': 'MedicalWebPage', '@id': `${abs(path)}#page`, url: abs(path), name, description,
    inLanguage: 'en-IN', isPartOf: { '@id': ID.site }, about: about ? { '@type': 'MedicalTherapy', name: about } : { '@id': ID.clinic },
    publisher: { '@id': ID.clinic }, lastReviewed: '2026-11-08',
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '[data-answer]'] },
  };
}

export function postLd(p: Post) {
  return {
    '@context': 'https://schema.org', '@type': 'BlogPosting', '@id': `${abs(`/journal/${p.slug}`)}#post`,
    headline: p.title, description: p.dek, abstract: p.answer, image: abs(p.cover.src), url: abs(`/journal/${p.slug}`),
    datePublished: p.published, dateModified: p.revised, inLanguage: 'en-IN', articleSection: p.kind,
    author: { '@type': 'Organization', '@id': ID.clinic, name: CLINIC.name },
    publisher: { '@type': 'Organization', '@id': ID.parent, name: CLINIC.legal, logo: { '@type': 'ImageObject', url: abs('/brand/avvvs-since-1921.svg') } },
    mainEntityOfPage: abs(`/journal/${p.slug}`), isPartOf: { '@id': ID.site },
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '[data-answer]'] },
  };
}
