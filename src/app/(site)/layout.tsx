import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Motion } from '@/components/Motion';
import { JsonLd } from '@/components/Parts';
import { clinicLd, doctorLd, websiteLd } from '@/lib/ld';

/** The public site: the bar, the page, the footer, and the clinic's structured data on every page. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <Motion />
      {children}
      <Footer />
      <JsonLd data={clinicLd()} />
      <JsonLd data={doctorLd()} />
      <JsonLd data={websiteLd()} />
    </>
  );
}
