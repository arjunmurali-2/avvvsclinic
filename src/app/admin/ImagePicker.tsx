'use client';

import { useState } from 'react';

/** Resize to at most 2000px on the long side and upload; returns the stored image's URL. */
export async function uploadImage(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
  const width = Math.round(bmp.width * scale), height = Math.round(bmp.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, width, height);
  bmp.close();
  const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('Could not read that image.'))), 'image/jpeg', 0.86));
  const form = new FormData();
  form.append('file', new File([blob], 'image.jpg', { type: 'image/jpeg' }));
  const r = await fetch('/api/admin/upload', { method: 'POST', body: form });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'Upload failed.');
  return j.url as string;
}

export function ImagePicker({ onPicked, label }: { onPicked: (url: string) => void; label: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  return (
    <span className="ad-upload">
      <label className="ad-btn ad-btn-quiet">
        <input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={busy}
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (!f) return;
            setBusy(true); setErr('');
            try { onPicked(await uploadImage(f)); } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
          }} />
        {busy ? 'Uploading…' : label}
      </label>
      {err && <span className="ad-note ad-note-error">{err}</span>}
    </span>
  );
}
