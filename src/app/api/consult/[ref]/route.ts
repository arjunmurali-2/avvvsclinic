import { appointmentForPatient, canPatientChange, cancelAppointment, rescheduleAppointment } from '@/lib/appointments';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** A patient cancels or moves their own consultation, proving it is theirs with the emailed link's token. */
export async function POST(req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const body = (await req.json().catch(() => ({}))) as { token?: string; action?: string; start?: string };
  const a = await appointmentForPatient(ref, String(body.token ?? ''));
  if (!a) return Response.json({ ok: false, error: 'not-found' }, { status: 404 });
  if (!canPatientChange(a)) return Response.json({ ok: false, error: 'too-late' }, { status: 409 });

  if (body.action === 'cancel') {
    await cancelAppointment(a, 'patient');
    return Response.json({ ok: true });
  }
  if (body.action === 'reschedule' && body.start && !Number.isNaN(Date.parse(body.start))) {
    const r = await rescheduleAppointment(a, body.start, 'patient');
    return Response.json(r, { status: r.ok ? 200 : 409 });
  }
  return Response.json({ ok: false, error: 'bad-request' }, { status: 400 });
}
