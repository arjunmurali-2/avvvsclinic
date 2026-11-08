import Link from 'next/link';
import { redirect } from 'next/navigation';
import { hasDatabase } from '@/lib/db';
import { currentUser, userCount } from '@/lib/auth';
import { LoginForm } from '../AdminForms';
import { NotConnected } from '../NotConnected';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sign in' };

export default async function Login() {
  if (!hasDatabase()) return <NotConnected />;
  if (await currentUser()) redirect('/admin');
  const first = (await userCount()) === 0;
  return (
    <main className="ad-gate">
      <div className="ad-gate-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Link href="/" aria-label="AVVVS Ayur Speciality Clinic"><img src="/brand/avvvs-since-1921.svg" alt="" width={181} height={40} /></Link>
        <h1>Clinic admin</h1>
        {first ? (
          <p>No accounts yet. <Link href="/admin/setup">Create the first admin account</Link>.</p>
        ) : (
          <>
            <p className="ad-muted">Sign in to add treatments and write for the Journal.</p>
            <LoginForm />
          </>
        )}
      </div>
    </main>
  );
}
