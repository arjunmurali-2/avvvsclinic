import { CLINICS, REVIVE } from '@/lib/clinics';
import { OG_SIZE, ogImage } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'A speciality clinic at AVVVS Ayur Speciality Clinic, Kozhikode';
export function generateStaticParams() { return [...CLINICS.map((c) => ({ slug: c.slug })), { slug: REVIVE.slug }]; }

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = CLINICS.find((x) => x.slug === slug);
  if (!c) return ogImage({ still: 'photos/hairoil.jpg', kicker: REVIVE.kicker, title: 'Gloveda Revive: healthy skin, beautiful hair.' });
  return ogImage({ still: c.image.src.replace(/^\//, ''), kicker: 'Speciality clinic · Kozhikode', title: c.name });
}
