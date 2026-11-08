import { INDEXNOW_KEY } from '@/lib/indexnow';

// The IndexNow key, published so search engines can confirm pings come from this site.
export const dynamic = 'force-static';

export function GET() {
  if (!INDEXNOW_KEY) return new Response('Not configured', { status: 404 });
  return new Response(INDEXNOW_KEY, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
