import { createAppointment } from '@/lib/appointments';
import { validateConsult, type ConsultInput } from '@/lib/consult';
import { canCreateEvents } from '@/lib/google';
import { onlineDoctorBySlug } from '@/lib/slots';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Books an online consultation: checks the details, takes the slot, creates the Meet event,
// emails the patient, the clinic and the doctor. The same bot checks as the in-person form.

const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 6;
}
const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return Response.json({ ok: false, error: 'bad-request' }, { status: 400 }); }

  const startedAt = Number(body.startedAt);
  if (body.website || (Number.isFinite(startedAt) && Date.now() - startedAt < 3000)) return Response.json({ ok: false, error: 'failed' }, { status: 400 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  if (limited(ip)) return Response.json({ ok: false, error: 'rate-limited' }, { status: 429 });

  const str = (k: string, max: number) => (typeof body[k] === 'string' ? (body[k] as string).trim().slice(0, max) : '');
  const input: ConsultInput = {
    doctor: str('doctor', 100), start: str('start', 40), name: oneLine(str('name', 120)), phone: oneLine(str('phone', 40)),
    email: oneLine(str('email', 200)).toLowerCase(), age: oneLine(str('age', 3)), note: str('note', 2000), consent: body.consent === true,
  };
  const fields = validateConsult(input);
  if (Object.keys(fields).length) return Response.json({ ok: false, error: 'invalid', fields }, { status: 422 });

  const doctor = await onlineDoctorBySlug(input.doctor);
  if (!doctor) return Response.json({ ok: false, error: 'invalid', fields: { doctor: 'That doctor is not taking online consultations right now.' } }, { status: 422 });
  if (!(await canCreateEvents())) return Response.json({ ok: false, error: 'unavailable' }, { status: 503 });

  const r = await createAppointment(doctor, input);
  if (!r.ok) return Response.json(r, { status: r.error === 'taken' ? 409 : r.error === 'unavailable' ? 503 : 500 });
  return Response.json({ ok: true, ref: r.ref, token: r.token, status: r.status });
}
