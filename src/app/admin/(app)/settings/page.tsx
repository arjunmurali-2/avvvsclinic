import { requireAdmin } from '@/lib/auth';
import { isLocalDatabase } from '@/lib/db';
import { googleStatus } from '@/lib/google';
import { fmtDate } from '@/lib/consult';
import { SettingsControls } from './SettingsControls';

export const metadata = { title: 'Settings' };

const NOTE: Record<string, { ok?: string; error?: string }> = {
  connected: { ok: 'Google Calendar is connected. Use “Send a test” to check it end to end.' },
  refused: { error: 'Google access was not granted. Nothing was changed.' },
  state: { error: 'That sign-in attempt expired. Please try again.' },
  failed: { error: 'Google could not be connected. See the server log for the reason, then try again.' },
  'not-configured': { error: 'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are not set yet.' },
};

export default async function Settings({ searchParams }: { searchParams: Promise<{ google?: string }> }) {
  await requireAdmin();
  const g = await googleStatus();
  const note = NOTE[(await searchParams).google ?? ''];
  const smtp = !!process.env.SMTP_HOST?.trim();
  const secret = !!process.env.APP_SECRET?.trim();
  const cron = !!process.env.CRON_SECRET?.trim();
  const local = isLocalDatabase();

  return (
    <div className="ad-page ad-narrow" style={{ maxWidth: 760 }}>
      <h1>Settings</h1>
      {note && <p className={`ad-note ${note.error ? 'ad-note-error' : 'ad-note-ok'}`} role="status">{note.error || note.ok}</p>}

      <section className="ad-card">
        <div className="ad-card-top">
          <h2>Google Calendar and Meet</h2>
          <span className={`ad-pill ad-pill-${g.connected ? 'published' : 'draft'}`}>{g.connected ? 'Connected' : 'Not connected'}</span>
        </div>
        {g.connected ? (
          <p className="ad-muted">Connected as <b>{g.email || 'the clinic’s Google account'}</b>{g.since ? ` since ${fmtDate(g.since)}` : ''}. Every online consultation is added to this account’s calendar with a Meet link, and the patient and the doctor are invited.</p>
        ) : g.configured ? (
          <p className="ad-muted">Sign in with the clinic’s Google account and allow access to its calendar. Online booking opens as soon as this is done.</p>
        ) : (
          <p className="ad-muted">Before connecting, add <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> to the site’s environment (see <code>docs/ENV.md</code>), then redeploy.{local && ' On this computer, bookings work without Google and use a placeholder Meet link.'}</p>
        )}
        <SettingsControls configured={g.configured} connected={g.connected} />
      </section>

      <section className="ad-card">
        <h2>Checklist</h2>
        <ul className="ad-checklist">
          <li className={g.connected ? 'is-ok' : ''}>Google Calendar connected</li>
          <li className={smtp ? 'is-ok' : ''}>Email (SMTP) set up, so confirmations reach patients</li>
          <li className={secret ? 'is-ok' : ''}><code>APP_SECRET</code> set, to protect the Google connection</li>
          <li className={cron ? 'is-ok' : ''}><code>CRON_SECRET</code> set, so morning reminders are sent</li>
        </ul>
        <p className="ad-muted">Then switch online consultations on for each doctor, under Doctors.</p>
      </section>
    </div>
  );
}
