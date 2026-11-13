import { appointmentForPatient, icsFor } from '@/lib/appointments';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** The appointment as a calendar file, for the patient's own calendar. */
export async function GET(req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const a = await appointmentForPatient(ref, new URL(req.url).searchParams.get('t') ?? '');
  if (!a || a.status !== 'confirmed') return new Response('Not found', { status: 404 });
  return new Response(icsFor(a), { headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': 'attachment; filename="avvvs-online-consultation.ics"' } });
}
