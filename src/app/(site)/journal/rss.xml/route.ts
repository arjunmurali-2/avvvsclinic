import { getPosts } from '@/lib/content';
import { CLINIC, abs } from '@/lib/site';

// The Journal as RSS, for readers and for answer engines that follow feeds.
export const revalidate = 3600;

const x = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!);

export async function GET() {
  const items = (await getPosts()).map((p) => `<item><title>${x(p.title)}</title><link>${abs(`/journal/${p.slug}`)}</link><guid>${abs(`/journal/${p.slug}`)}</guid><pubDate>${new Date(p.published).toUTCString()}</pubDate><description>${x(p.answer)}</description></item>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${x(`Journal · ${CLINIC.name}`)}</title><link>${abs('/journal')}</link><description>Notes from the clinic</description><language>en-IN</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
