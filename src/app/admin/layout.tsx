import type { Metadata } from 'next';
import './admin.css';

// The clinic admin: out of search, and outside the public site's bar, footer and motion.
export const metadata: Metadata = {
  title: { default: 'Clinic admin', template: '%s · Clinic admin' },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="ad">{children}</div>;
}
