import { notFound } from 'next/navigation';
import { sql } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { hhmm } from '@/lib/consult';
import type { DoctorRow } from '@/lib/content';
import { DoctorEditor } from './DoctorEditor';
import { DoctorOnline } from './DoctorOnline';

export const metadata = { title: 'Edit doctor' };

export default async function EditDoctor({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const d = (await sql()`SELECT * FROM clinic_doctors WHERE id = ${id}`)[0] as unknown as (DoctorRow & { email: string; online: boolean; online_minutes: number; online_fee_paise: number | null }) | undefined;
  if (!d) notFound();
  const [hours, off] = await Promise.all([
    sql()`SELECT weekday, start_min, end_min FROM clinic_availability WHERE doctor_id = ${id} ORDER BY weekday, start_min`,
    sql()`SELECT from_date, to_date, note FROM clinic_time_off WHERE doctor_id = ${id} ORDER BY from_date`,
  ]);
  return (
    <>
      <DoctorEditor
        id={d.id}
        slug={d.slug.startsWith('draft-') ? null : d.slug}
        initial={{
          name: d.name === 'New doctor' ? '' : d.name,
          quals: (d.quals ?? []).join(', '), role: d.role, photo: d.photo_url, sort: d.sort, visible: d.visible,
        }}
      />
      <div className="ad-page ad-editor" style={{ marginTop: 24 }}>
        <DoctorOnline
          id={d.id}
          initial={{
            email: d.email ?? '', online: !!d.online, minutes: d.online_minutes ?? 20,
            feeRupees: d.online_fee_paise == null ? '' : String(d.online_fee_paise / 100),
            hours: hours.map((h) => ({ weekday: Number(h.weekday), from: hhmm(Number(h.start_min)), to: hhmm(Number(h.end_min)) })),
            off: off.map((o) => ({ from: String(o.from_date), to: String(o.to_date), note: String(o.note ?? '') })),
          }}
        />
      </div>
    </>
  );
}
