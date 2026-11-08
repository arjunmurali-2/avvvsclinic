import nodemailer from 'nodemailer';
import { LIMITS, SLOTS, careById, fmtDay, validate, type Booking } from '@/lib/booking';
import { CLINIC } from '@/lib/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/*
 * Consultation requests: validated here, then sent by SMTP to the clinic's inbox with Reply-To set
 * to the patient (when they gave an email). Configure in .env.local (see .env.example). Without SMTP
 * settings, development logs the request to the terminal and production answers 503, so the form
 * offers the phone numbers instead.
 */

const env = (k: string) => process.env[k]?.trim() || undefined;

const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return Response.json({ ok: false, error: 'bad-request' }, { status: 400 }); }

  // bots: a hidden field people never see, and a form filled faster than a person can
  const startedAt = Number(body.startedAt);
  if (body.website || (Number.isFinite(startedAt) && Date.now() - startedAt < 3000)) return Response.json({ ok: true });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  if (limited(ip)) return Response.json({ ok: false, error: 'rate-limited' }, { status: 429 });

  const str = (k: keyof Booking, max = 200) => (typeof body[k] === 'string' ? (body[k] as string).trim().slice(0, max) : '');
  const b: Booking = {
    care: str('care'), date: str('date', 10), slot: str('slot'), name: oneLine(str('name', LIMITS.name)), phone: oneLine(str('phone', LIMITS.phone)),
    email: oneLine(str('email', LIMITS.email)), age: oneLine(str('age', LIMITS.age)), visit: (str('visit') === 'first' || str('visit') === 'returning') ? (str('visit') as Booking['visit']) : '',
    message: str('message', LIMITS.message),
  };
  const errors = validate(b);
  if (Object.keys(errors).length) return Response.json({ ok: false, error: 'invalid', fields: errors }, { status: 422 });

  const care = careById(b.care)!.label;
  const when = `${fmtDay(b.date)}, ${SLOTS.find((s) => s.id === b.slot)!.label.toLowerCase()}`;
  const to = env('MAIL_TO') ?? CLINIC.email;
  const from = env('MAIL_FROM') ?? env('SMTP_USER');
  const subject = `Consultation request: ${care} · ${b.name} · ${fmtDay(b.date, { day: 'numeric', month: 'short' })}`;
  const rows: [string, string][] = [
    ['Care', care], ['Preferred', when], ['Name', b.name], ['Phone', b.phone], ['Email', b.email || '—'], ['Age', b.age || '—'],
    ['Visit', b.visit === 'first' ? 'First visit' : b.visit === 'returning' ? 'Returning patient' : '—'],
  ];
  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${b.message || '(no note)'}\n\nCall the patient to confirm a time.\n— Sent from clinic.avvvs.com/book`;
  const html = mailHtml('New consultation request', rows, b.message || '(no note)', 'Call the patient to confirm a time.');

  const host = env('SMTP_HOST');
  if (!host || !from) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[book] SMTP is not configured; this is what would be sent to ${to}:\n${subject}\n${text}`);
      return Response.json({ ok: true, dev: true });
    }
    return Response.json({ ok: false, error: 'not-configured' }, { status: 503 });
  }

  const port = Number(env('SMTP_PORT') ?? 587);
  const transport = nodemailer.createTransport({
    host, port, secure: env('SMTP_SECURE') ? env('SMTP_SECURE') === 'true' : port === 465,
    auth: env('SMTP_USER') ? { user: env('SMTP_USER')!, pass: env('SMTP_PASS') ?? '' } : undefined,
  });

  try {
    await transport.sendMail({ from: { name: 'AVVVS Clinic website', address: from }, to, replyTo: b.email ? { name: b.name, address: b.email } : undefined, subject, text, html });
    if (b.email && env('SEND_ACK') === 'true') {
      const first = b.name.split(/\s+/)[0];
      await transport.sendMail({
        from: { name: CLINIC.name, address: from }, to: { name: b.name, address: b.email }, replyTo: to,
        subject: 'We have your request · AVVVS Ayur Speciality Clinic',
        text: `Dear ${first},\n\nThank you for your request for ${care}, on or near ${when}. The clinic will call you on ${b.phone} to confirm a time.\n\n${CLINIC.name}\n${CLINIC.address.lines.join(', ')}\n${CLINIC.phones.join(' · ')}`,
        html: mailHtml(`Thank you, ${first}`, [['Care', care], ['Preferred', when]], `The clinic will call you on ${b.phone} to confirm a time.`, `${CLINIC.address.lines.join(', ')} · ${CLINIC.phones.join(' · ')}`),
      });
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error('[book] send failed', err);
    return Response.json({ ok: false, error: 'send-failed' }, { status: 502 });
  }
}

// Table-based, inline-styled: what email clients render reliably. Ivory ground, gold thread, ink type.
function mailHtml(title: string, rows: [string, string][], message: string, foot: string) {
  const r = rows.map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#6B5A48;font-size:13px;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:6px 0;color:#1E140E;font-size:15px">${esc(v)}</td></tr>`).join('');
  return `<!doctype html><html><body style="margin:0;background:#F4EFE5">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4EFE5"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FBF8F2;border:1px solid #E8D9B9">
<tr><td style="height:3px;background:#C3A46A;font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td style="padding:28px 32px 8px;font-family:Georgia,'Times New Roman',serif;color:#1E140E;font-size:24px">${esc(title)}</td></tr>
<tr><td style="padding:0 32px 4px;font-family:Arial,Helvetica,sans-serif;color:#06619B;font-size:12px;letter-spacing:.12em;text-transform:uppercase">AVVVS Ayur Speciality Clinic · Kozhikode</td></tr>
<tr><td style="padding:20px 32px 8px;font-family:Arial,Helvetica,sans-serif"><table role="presentation" cellpadding="0" cellspacing="0">${r}</table></td></tr>
<tr><td style="padding:12px 32px 24px;font-family:Arial,Helvetica,sans-serif;color:#1E140E;font-size:15px;line-height:1.6;white-space:pre-wrap;border-top:1px solid #E8D9B9">${esc(message)}</td></tr>
<tr><td style="padding:16px 32px 28px;font-family:Arial,Helvetica,sans-serif;color:#6B5A48;font-size:12px">${esc(foot)}</td></tr>
</table></td></tr></table></body></html>`;
}
