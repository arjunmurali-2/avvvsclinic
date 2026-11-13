import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { authUrl, googleConfigured } from '@/lib/google';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Starts "Connect Google Calendar": an admin is sent to Google to approve access to the clinic's calendar. */
export async function GET(req: Request) {
  await requireAdmin();
  if (!googleConfigured()) redirect('/admin/settings?google=not-configured');
  const state = randomBytes(18).toString('base64url');
  (await cookies()).set('clinic_google_state', state, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/api/google', maxAge: 600 });
  redirect(authUrl(`${new URL(req.url).origin}/api/google/callback`, state));
}
