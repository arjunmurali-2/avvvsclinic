import 'server-only';
import nodemailer from 'nodemailer';
import { CLINIC } from './site';

/*
 * Email, by SMTP (the same settings as the booking form: SMTP_HOST, SMTP_USER, SMTP_PASS…).
 * Without SMTP, development prints the message to the terminal; production reports 'unconfigured'
 * and the caller decides what that means.
 */

const env = (k: string) => process.env[k]?.trim() || undefined;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const clinicInbox = () => env('MAIL_TO') ?? CLINIC.email;

export interface Mail { to: string | string[]; subject: string; title: string; rows: [string, string][]; message: string; foot?: string; button?: { label: string; url: string }; replyTo?: string; attachments?: { filename: string; content: string; contentType: string }[] }

export async function sendMail(m: Mail): Promise<'sent' | 'logged' | 'unconfigured' | 'failed'> {
  const host = env('SMTP_HOST'), from = env('MAIL_FROM') ?? env('SMTP_USER');
  const text = `${m.title}\n\n${m.rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${m.message}${m.button ? `\n\n${m.button.label}: ${m.button.url}` : ''}${m.foot ? `\n\n${m.foot}` : ''}`;
  if (!host || !from) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[mail] SMTP is not configured; this would be sent to ${[m.to].flat().join(', ')}:\n${m.subject}\n${text}\n`);
      return 'logged';
    }
    return 'unconfigured';
  }
  const port = Number(env('SMTP_PORT') ?? 587);
  const transport = nodemailer.createTransport({
    host, port, secure: env('SMTP_SECURE') ? env('SMTP_SECURE') === 'true' : port === 465,
    auth: env('SMTP_USER') ? { user: env('SMTP_USER')!, pass: env('SMTP_PASS') ?? '' } : undefined,
  });
  try {
    await transport.sendMail({ from: { name: CLINIC.name, address: from }, to: m.to, replyTo: m.replyTo ?? clinicInbox(), subject: m.subject, text, html: html(m), attachments: m.attachments });
    return 'sent';
  } catch (e) {
    console.error('[mail] send failed', e);
    return 'failed';
  }
}

// Table-based and inline-styled: what email clients render reliably.
function html(m: Mail) {
  const r = m.rows.map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#6E6E73;font-size:13px;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:6px 0;color:#1D1D1F;font-size:15px">${esc(v)}</td></tr>`).join('');
  const b = m.button ? `<tr><td style="padding:4px 32px 24px"><a href="${esc(m.button.url)}" style="display:inline-block;background:#06619B;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:16px;padding:13px 24px;border-radius:999px">${esc(m.button.label)}</a></td></tr>` : '';
  return `<!doctype html><html><body style="margin:0;background:#F5F5F7">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F7"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:18px">
<tr><td style="padding:30px 32px 6px;font-family:Georgia,'Times New Roman',serif;color:#1D1D1F;font-size:26px;line-height:1.2">${esc(m.title)}</td></tr>
<tr><td style="padding:0 32px 6px;font-family:Arial,Helvetica,sans-serif;color:#06619B;font-size:13px">AVVVS Ayur Speciality Clinic · Kozhikode</td></tr>
<tr><td style="padding:18px 32px 8px;font-family:Arial,Helvetica,sans-serif"><table role="presentation" cellpadding="0" cellspacing="0">${r}</table></td></tr>
<tr><td style="padding:10px 32px 22px;font-family:Arial,Helvetica,sans-serif;color:#424245;font-size:15px;line-height:1.6;white-space:pre-wrap">${esc(m.message)}</td></tr>
${b}
<tr><td style="padding:16px 32px 28px;font-family:Arial,Helvetica,sans-serif;color:#6E6E73;font-size:12px;line-height:1.5;border-top:1px solid #E8E8ED">${esc(m.foot ?? `${CLINIC.address.lines.join(', ')} · ${CLINIC.phones.join(' · ')}`)}</td></tr>
</table></td></tr></table></body></html>`;
}
