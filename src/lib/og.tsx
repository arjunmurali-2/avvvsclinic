import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

// Social cards (Open Graph / X), rendered at build time: a film still in an arched window, the
// Since 1921 lockup, and the page's line on ivory. The same language as avvvs.com's cards.
export const OG_SIZE = { width: 1200, height: 630 };
const pub = (p: string) => join(process.cwd(), 'public', p);
const dataUrl = (p: string, type: string) => `data:${type};base64,${readFileSync(pub(p)).toString('base64')}`;

export function ogImage({ still, kicker, title }: { still: string; kicker: string; title: string }) {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#FFFFFF' }}>
        <div style={{ position: 'absolute', right: 64, top: 48, width: 400, height: 534, display: 'flex', overflow: 'hidden', borderRadius: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUrl(still, 'image/jpeg')} width={400} height={534} alt="" style={{ width: 400, height: 534, objectFit: 'cover' }} />
        </div>
        <div style={{ position: 'absolute', left: 64, top: 56, display: 'flex' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUrl('brand/avvvs-since-1921.svg', 'image/svg+xml')} width={271} height={60} alt="" />
        </div>
        <div style={{ position: 'absolute', left: 64, width: 620, bottom: 64, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 22, letterSpacing: 4, textTransform: 'uppercase', color: '#06619B', marginBottom: 18 }}>{kicker}</div>
          <div style={{ display: 'flex', fontFamily: 'CastleT', fontSize: 64, lineHeight: 1.05, color: '#1D1D1F', letterSpacing: -1 }}>{title}</div>
                    <div style={{ display: 'flex', fontSize: 22, color: '#6E6E73', marginTop: 24 }}>Opposite Kozhikode Railway Station · clinic.avvvs.com</div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [{ name: 'CastleT', data: readFileSync(pub('fonts/CastleT.woff')), weight: 400, style: 'normal' }] },
  );
}
