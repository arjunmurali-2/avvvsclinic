import { releaseExpiredHolds } from '@/lib/appointments';
import { addDays, fmtTime, fmtWhen, istDate, istInstant } from '@/lib/consult';
import { ensureSchema, hasDatabase, sql } from '@/lib/db';
import { sendMail } from '@/lib/mail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/*
 * The morning reminder: once a day (vercel.json, 7 am India time) each patient with an online
 * consultation today gets an email with the time and how to join. Vercel calls this with
 * "Authorization: Bearer <CRON_SECRET>"; anyone else is refused.
 *
 * The emailed link cannot carry the patient's private token (only its hash is stored), so the
 * reminder gives the Meet link itself and points to the confirmation email for changes.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return new Response('Unauthorized', { status: 401 });
  if (!hasDatabase()) return Response.json({ ok: true, sent: 0 });
  await ensureSchema();
  await releaseExpiredHolds();

  const today = istDate(new Date());
  const from = new Date().toISOString(), to = istInstant(addDays(today, 1), 0).toISOString();
  const due = await sql()`
    SELECT a.id, a.ref, a.name, a.email, a.starts_at, a.meet_url, d.name AS doctor_name
    FROM clinic_appointments a JOIN clinic_doctors d ON d.id = a.doctor_id
    WHERE a.status = 'confirmed' AND a.reminder_sent_at IS NULL AND a.starts_at >= ${from} AND a.starts_at < ${to}`;

  let sent = 0;
  for (const a of due) {
    const starts = new Date(a.starts_at as string);
    const r = await sendMail({
      to: String(a.email), subject: `Today at ${fmtTime(starts)}: your online consultation · AVVVS Clinic`,
      title: `See you today, ${String(a.name).split(/\s+/)[0]}.`,
      rows: [['Doctor', String(a.doctor_name)], ['When', fmtWhen(starts)]],
      message: 'Join a few minutes early from a quiet, well-lit place, with your reports and a list of your medicines. To change or cancel, use the link in your confirmation email.',
      ...(a.meet_url ? { button: { label: 'Join with Google Meet', url: String(a.meet_url) } } : {}),
    });
    if (r === 'sent' || r === 'logged') { await sql()`UPDATE clinic_appointments SET reminder_sent_at = now() WHERE id = ${a.id}`; sent++; }
  }
  return Response.json({ ok: true, sent });
}

