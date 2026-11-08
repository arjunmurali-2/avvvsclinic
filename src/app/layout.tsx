import type { Metadata, Viewport } from 'next';
import { Manjari } from 'next/font/google';
import './globals.css';
import { ANIM_BOOT } from '@/components/Motion';
import { CLINIC, INDEXABLE, SITE_URL } from '@/lib/site';

// Malayalam words (therapy names, the family name) are set in Manjari; Latin headlines in CastleT.
const manjari = Manjari({ weight: ['400'], subsets: ['malayalam'], variable: '--font-manjari', display: 'swap' });

const TITLE = 'AVVVS Ayur Speciality Clinic · Ayurveda & Panchakarma in Kozhikode (Calicut)';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: '%s · AVVVS Ayur Speciality Clinic' },
  description:
    'Ayurveda clinic in Kozhikode (Calicut), opposite the railway station, from AVVVS (since 1921). Speciality clinics for headache, pain, obesity, lifestyle diseases, infertility, pregnancy and postnatal care; Pizhichil, Shirodhara, Abhyanga, Elakizhi and Njavarakizhi; Gloveda Revive for skin and hair.',
  applicationName: CLINIC.name,
  authors: [{ name: CLINIC.legal, url: 'https://avvvs.com' }],
  publisher: CLINIC.legal,
  category: 'health',
  keywords: ['Ayurveda clinic Kozhikode', 'Ayurveda clinic Calicut', 'Ayurvedic hospital Calicut', 'Ayurvedic treatment Kozhikode', 'Ayurvedic treatment Calicut', 'Panchakarma Kozhikode', 'Panchakarma Calicut', 'Ayurveda doctor Kozhikode', 'Ayurveda near Kozhikode railway station', 'Pizhichil', 'Shirodhara', 'Njavarakizhi', 'Elakizhi', 'Ayurveda pain management', 'Ayurveda infertility clinic', 'Ayurvedic pregnancy care', 'Gloveda Revive', 'AVVVS'],
  formatDetection: { telephone: false, address: false, email: false },
  alternates: { canonical: '/', languages: { 'en-IN': '/', 'x-default': '/' } },
  openGraph: { type: 'website', siteName: CLINIC.name, locale: 'en_IN', url: '/', title: TITLE,
    description: 'Over a century of authentic Ayurvedic wisdom, in the heart of Kozhikode: speciality clinics, Kerala Panchakarma and Gloveda Revive.' },
  twitter: { card: 'summary_large_image', site: '@avvvsglobal' },
  // Search Console, Bing Webmaster Tools and Meta domain verification: the token each service gives you
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
    other: {
      ...(process.env.NEXT_PUBLIC_BING_VERIFICATION ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION } : {}),
      ...(process.env.NEXT_PUBLIC_META_DOMAIN_VERIFICATION ? { 'facebook-domain-verification': process.env.NEXT_PUBLIC_META_DOMAIN_VERIFICATION } : {}),
    },
  },
  robots: INDEXABLE
    ? { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } }
    : { index: false, follow: false },
  other: { 'geo.region': 'IN-KL', 'geo.placename': 'Kozhikode, Kerala' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', colorScheme: 'light', themeColor: '#FFFFFF' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={manjari.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ANIM_BOOT }} />
        <link rel="preload" href="/fonts/CastleT.woff" as="font" type="font/woff" crossOrigin="anonymous" />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt" />
        <link rel="alternate" type="text/plain" href="/llms-full.txt" title="llms-full.txt" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
