import { doctorSlots, onlineDoctorBySlug } from '@/lib/slots';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Free slots for one doctor over the booking window: /api/consult/slots?doctor=<slug> */
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get('doctor') ?? '';
  const doctor = await onlineDoctorBySlug(slug);
  if (!doctor) return Response.json({ ok: false, error: 'unknown-doctor' }, { status: 404 });
  const days = await doctorSlots(doctor);
  return Response.json({ ok: true, minutes: doctor.online_minutes, days }, { headers: { 'Cache-Control': 'no-store' } });
}
