import Link from 'next/link';
import { hasDatabase, isLocalDatabase } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { logout } from '../actions';
import { NotConnected } from '../NotConnected';
import { AdminNav } from './AdminNav';

export const dynamic = 'force-dynamic';

export default async function AdminApp({ children }: { children: React.ReactNode }) {
  if (!hasDatabase()) return <NotConnected />;
  const me = await requireUser();
  return (
    <>
      <header className="ad-bar">
        <Link href="/admin" className="ad-mark" aria-label="Clinic admin home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/avvvs-since-1921.svg" alt="" width={145} height={32} />
          <span>Clinic admin</span>
        </Link>
        <AdminNav admin={me.role === 'admin'} name={me.name} />
        <div className="ad-bar-end">
          <a href="/" target="_blank" rel="noopener" className="ad-link">View site</a>
          <form action={logout}><button className="ad-link">Sign out</button></form>
        </div>
      </header>
      {isLocalDatabase() && <p className="ad-local">Local development database: changes stay on this computer.</p>}
      <main className="ad-main">{children}</main>
    </>
  );
}
