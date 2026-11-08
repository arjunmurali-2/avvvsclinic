import Link from 'next/link';
import { More } from '@/components/Parts';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function NotFound() {
  return (
    <>
    <Header />
    <main id="main" className="nf">
      <h1 className="t-1">This page has wandered off.</h1>
      <p className="lede">The clinic is still where it always is, opposite Kozhikode Railway Station.</p>
      <div className="actions">
        <Link className="btn" href="/book">Book a consultation</Link>
        <More href="/">Go home</More>
      </div>
    </main>
    <Footer />
    </>
  );
}
