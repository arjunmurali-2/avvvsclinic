import { POSTS } from '@/lib/journal';
import { OG_SIZE, ogImage } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'From the Journal of AVVVS Ayur Speciality Clinic';
export function generateStaticParams() { return POSTS.map((p) => ({ slug: p.slug })); }

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = POSTS.find((x) => x.slug === slug)!;
  return ogImage({ still: p.cover.src.replace(/^\//, ''), kicker: `Journal · ${p.kind}`, title: p.title });
}
