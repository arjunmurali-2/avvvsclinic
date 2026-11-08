import { POSTS } from '@/lib/journal';
import { getPost } from '@/lib/content';
import { OG_SIZE, ogImage } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'From the Journal of AVVVS Ayur Speciality Clinic';
export function generateStaticParams() { return POSTS.map((p) => ({ slug: p.slug })); }

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPost(slug);
  // a cover uploaded in the admin lives in Blob storage; the card then uses the site's own photograph
  const still = p && p.cover.src.startsWith('/photos/') ? p.cover.src.slice(1) : 'photos/herbs.jpg';
  return ogImage({ still, kicker: `Journal · ${p?.kind ?? 'AVVVS Clinic'}`, title: p?.title ?? 'Journal' });
}
