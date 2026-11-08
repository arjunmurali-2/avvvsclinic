import { notFound } from 'next/navigation';
import { sql } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import type { DoctorRow } from '@/lib/content';
import { DoctorEditor } from './DoctorEditor';

export const metadata = { title: 'Edit doctor' };

export default async function EditDoctor({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const d = (await sql()`SELECT * FROM clinic_doctors WHERE id = ${id}`)[0] as unknown as DoctorRow | undefined;
  if (!d) notFound();
  return (
    <DoctorEditor
      id={d.id}
      slug={d.slug.startsWith('draft-') ? null : d.slug}
      initial={{
        name: d.name === 'New doctor' ? '' : d.name,
        quals: (d.quals ?? []).join(', '), role: d.role, photo: d.photo_url, sort: d.sort, visible: d.visible,
      }}
    />
  );
}
