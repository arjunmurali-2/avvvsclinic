import { sql, ensureSchema } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { CLINIC_SLUGS, builtInClinics, clinicName } from '@/lib/content';
import { THERAPIES } from '@/lib/therapies';
import { ClinicTherapies, ResetLinks } from './ClinicTherapies';

export const metadata = { title: 'Clinics' };

export default async function Clinics() {
  const me = await requireUser();
  await ensureSchema();
  const links = await builtInClinics();
  const added = (await sql()`SELECT slug, name, status, clinics FROM clinic_treatments WHERE NOT slug LIKE 'draft-%' ORDER BY sort, name`) as
    { slug: string; name: string; status: string; clinics: string[] }[];

  // every therapy, with the clinics it is shown under right now
  const all = [
    ...THERAPIES.map((t) => ({ slug: t.slug, name: t.name, note: '', clinics: links[t.slug] ?? [] })),
    ...added.map((t) => ({ slug: t.slug, name: t.name, note: t.status === 'draft' ? 'draft, not on the site yet' : 'added here', clinics: t.clinics ?? [] })),
  ];

  return (
    <div className="ad-page">
      <div className="ad-head">
        <div>
          <h1>Clinics</h1>
          <p className="ad-muted">Choose the therapies listed under &ldquo;Therapies the doctor may recommend&rdquo; on each clinic&rsquo;s page. A therapy can belong to several clinics. New treatments appear here once they have a name.</p>
        </div>
        {me.role === 'admin' && <ResetLinks />}
      </div>
      <div className="ad-cards ad-cards-wide">
        {CLINIC_SLUGS.map((c) => (
          <ClinicTherapies
            key={c}
            clinic={c}
            name={clinicName(c)}
            therapies={all.map((t) => ({ slug: t.slug, name: t.name, note: t.note }))}
            initial={all.filter((t) => t.clinics.includes(c)).map((t) => t.slug)}
          />
        ))}
      </div>
    </div>
  );
}
