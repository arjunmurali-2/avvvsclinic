import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { connectGoogle } from '@/lib/google';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Google sends the admin back here after they approve (or refuse) access. */
export async function GET(req: Request) {
  await requireAdmin();
  const url = new URL(req.url);
  const jar = await cookies();
  const expected = jar.get('clinic_google_state')?.value;
  jar.delete('clinic_google_state');
  const code = url.searchParams.get('code');
  if (url.searchParams.get('error') || !code) redirect('/admin/settings?google=refused');
  if (!expected || url.searchParams.get('state') !== expected) redirect('/admin/settings?google=state');
  let ok = true;
  try { await connectGoogle(code, `${url.origin}/api/google/callback`); }
  catch (e) { console.error('[google] connect failed', e); ok = false; }
  redirect(`/admin/settings?google=${ok ? 'connected' : 'failed'}`);
}
