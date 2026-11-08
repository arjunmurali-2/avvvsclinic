import { notFound } from 'next/navigation';
import { sql } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { CLINIC_SLUGS, POST_KINDS, cleanBlocks, clinicName, type PostRow, type TreatmentRow } from '@/lib/content';
import { THERAPIES } from '@/lib/therapies';
import { PostEditor } from './PostEditor';

export const metadata = { title: 'Edit article' };

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const p = (await sql()`SELECT * FROM clinic_posts WHERE id = ${id}`)[0] as unknown as PostRow | undefined;
  if (!p) notFound();
  const added = (await sql()`SELECT slug, name, status FROM clinic_treatments WHERE NOT slug LIKE 'draft-%' ORDER BY sort, name`) as unknown as Pick<TreatmentRow, 'slug' | 'name' | 'status'>[];
  const treatments = [
    ...THERAPIES.map((t) => ({ slug: t.slug, name: t.name, note: '' })),
    ...added.map((t) => ({ slug: t.slug, name: t.name, note: t.status === 'draft' ? 'draft' : '' })),
  ];
  return (
    <PostEditor
      id={p.id}
      status={p.status}
      author={me.name}
      kinds={[...POST_KINDS]}
      clinics={CLINIC_SLUGS.map((s) => ({ slug: s, name: clinicName(s) }))}
      treatments={treatments}
      initial={{
        title: p.title === 'Untitled article' ? '' : p.title,
        slug: p.slug.startsWith('draft-') ? '' : p.slug,
        dek: p.dek, answer: p.answer, kind: p.kind,
        cover: p.cover_url ? { url: p.cover_url, alt: p.cover_alt } : null,
        body: cleanBlocks(p.body), clinic: p.clinic ?? '', treatments: p.treatments ?? [],
      }}
    />
  );
}
