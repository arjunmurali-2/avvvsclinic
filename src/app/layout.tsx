import type { Metadata, Viewport } from 'next';
import { Gloock, Manjari } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ANIM_BOOT, Motion } from '@/components/Motion';
import { JsonLd } from '@/components/Parts';
import { clinicLd, doctorLd, websiteLd } from '@/lib/ld';
import { CLINIC, INDEXABLE, SITE_URL } from '@/lib/site';

const gloock = Gloock({ weight: '400', subsets: ['latin'], variable: '--font-gloock', display: 'swap' });
const manjari = Manjari({ weight: ['100', '400', '700'], subsets: ['latin', 'malayalam'], variable: '--font-manjari', display: 'swap' });

const TITLE = 'AVVVS Ayur Speciality Clinic, Kozhikode · Kerala Ayurveda & Panchakarma';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: '%s · AVVVS Ayur Speciality Clinic' },
  description:
    'Authentic Kerala Ayurveda opposite Kozhikode Railway Station, from AVVVS (since 1921). Speciality clinics for headache, pain, obesity, lifestyle diseases, infertility, pregnancy and postnatal care; Pizhichil, Shirodhara, Abhyanga, Elakizhi and Njavarakizhi; Gloveda Revive for skin and hair.',
  applicationName: CLINIC.name,
  authors: [{ name: CLINIC.legal, url: 'https://avvvs.com' }],
  publisher: CLINIC.legal,
  category: 'health',
  keywords: ['Ayurveda clinic Kozhikode', 'Ayurvedic treatment Calicut', 'Panchakarma Kozhikode', 'Pizhichil', 'Shirodhara', 'Njavarakizhi', 'Elakizhi', 'Ayurveda pain management', 'Ayurveda infertility clinic', 'Ayurvedic pregnancy care', 'Gloveda Revive', 'AVVVS'],
  formatDetection: { telephone: false, address: false, email: false },
  alternates: { canonical: '/', languages: { 'en-IN': '/', 'x-default': '/' } },
  openGraph: { type: 'website', siteName: CLINIC.name, locale: 'en_IN', url: '/', title: TITLE,
    description: 'Over a century of authentic Ayurvedic wisdom, in the heart of Kozhikode: speciality clinics, Kerala Panchakarma and Gloveda Revive.' },
  twitter: { card: 'summary_large_image', site: '@avvvsglobal' },
  verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined },
  robots: INDEXABLE
    ? { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } }
    : { index: false, follow: false },
  other: { 'geo.region': 'IN-KL', 'geo.placename': 'Kozhikode, Kerala' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', colorScheme: 'light', themeColor: '#F4EFE5' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${gloock.variable} ${manjari.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ANIM_BOOT }} />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt" />
      </head>
      <body suppressHydrationWarning>
        <a className="skip" href="#main">Skip to content</a>
        <Header />
        <Motion />
        {children}
        <Footer />
        <JsonLd data={clinicLd()} />
        <JsonLd data={doctorLd()} />
        <JsonLd data={websiteLd()} />
      </body>
    </html>
  );
}
