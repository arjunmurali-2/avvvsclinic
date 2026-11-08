import { redirect } from 'next/navigation';
import { hasDatabase, isLocalDatabase } from '@/lib/db';
import { userCount } from '@/lib/auth';
import { SetupForm } from '../AdminForms';
import { NotConnected } from '../NotConnected';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'First admin' };

export default async function Setup() {
  if (!hasDatabase()) return <NotConnected />;
  if ((await userCount()) > 0) redirect('/admin/login');
  const local = isLocalDatabase();
  return (
    <main className="ad-gate">
      <div className="ad-gate-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/avvvs-since-1921.svg" alt="AVVVS" width={181} height={40} />
        <h1>Create the first admin</h1>
        <p className="ad-muted">
          {local
            ? 'This is the local development database on this computer, so no setup key is needed.'
            : <>This works once, while there are no accounts. You need the <code>ADMIN_SETUP_KEY</code> set in the Vercel project.</>}
        </p>
        <SetupForm needsKey={!local} />
      </div>
    </main>
  );
}
