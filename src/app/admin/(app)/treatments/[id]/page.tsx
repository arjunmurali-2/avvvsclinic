import { notFound } from 'next/navigation';
import { sql } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { CLINIC_SLUGS, clinicName, type TreatmentRow } from '@/lib/content';
import { TreatmentEditor } from './TreatmentEditor';

export const metadata = { title: 'Edit treatment' };

export default async function EditTreatment({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const r = (await sql()`SELECT * FROM clinic_treatments WHERE id = ${id}`)[0] as unknown as TreatmentRow | undefined;
  if (!r) notFound();
  const linked = (await sql()`SELECT id, title, status FROM clinic_posts WHERE ${r.slug} = ANY(treatments) ORDER BY updated_at DESC`) as { id: number; title: string; status: string }[];
  return (
    <TreatmentEditor
      id={r.id}
      status={r.status}
      clinics={CLINIC_SLUGS.map((s) => ({ slug: s, name: clinicName(s) }))}
      linked={linked}
      initial={{
        name: r.name === 'Untitled treatment' ? '' : r.name,
        slug: r.slug.startsWith('draft-') ? '' : r.slug,
        ml: r.ml, what: r.what, how: r.how, sort: r.sort,
        image: r.image_url ? { url: r.image_url, alt: r.image_alt } : null,
        clinics: r.clinics ?? [],
      }}
    />
  );
}
