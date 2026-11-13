'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { disconnectGoogleAction, testGoogle, testMail } from '../../consult-actions';
import type { FormState } from '../../actions';

export function SettingsControls({ configured, connected }: { configured: boolean; connected: boolean }) {
  const router = useRouter();
  const [msg, setMsg] = useState<FormState>({});
  const [pending, go] = useTransition();
  const run = (fn: () => Promise<FormState>, refresh = false) => go(async () => { setMsg({}); const r = await fn(); setMsg(r); if (refresh) router.refresh(); });
  return (
    <>
      <div className="ad-card-actions" style={{ flexWrap: 'wrap' }}>
        {/* a full page load, not a client navigation: this route redirects to Google */}
        {configured && !connected && <a className="ad-btn" href="/api/google/connect">Connect Google Calendar</a>}
        {connected && <button type="button" className="ad-btn" disabled={pending} onClick={() => run(testGoogle)}>{pending ? 'Working…' : 'Send a test'}</button>}
        {connected && <a className="ad-link" href="/api/google/connect">Reconnect</a>}
        {connected && <button type="button" className="ad-link ad-danger" disabled={pending} onClick={() => { if (confirm('Disconnect Google Calendar? Online booking closes until it is connected again. Existing appointments stay.')) run(disconnectGoogleAction, true); }}>Disconnect</button>}
        <button type="button" className="ad-link" disabled={pending} onClick={() => run(testMail)}>Send me a test email</button>
      </div>
      {(msg.error || msg.ok) && <p className={`ad-note ${msg.error ? 'ad-note-error' : 'ad-note-ok'}`} role="status">{msg.error || msg.ok}</p>}
    </>
  );
}
