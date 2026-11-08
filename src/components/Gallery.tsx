'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Therapy } from '@/lib/therapies';

/** The therapies as a sideways gallery with previous / next controls, on black. */
export function TherapyGallery({ items }: { items: Therapy[] }) {
  const list = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    const el = list.current!;
    const on = () => setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
    on();
    el.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { el.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, []);

  const step = (dir: 1 | -1) => {
    const el = list.current!;
    const card = el.querySelector<HTMLElement>('.g-card');
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 380) + 20), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  return (
    <div className="gallery-wrap">
      <ul className="gallery" ref={list} aria-label="Therapies" data-stagger>
        {items.map((t) => (
          <li key={t.slug} className="g-card">
            <div className="g-img">
              <Image src={t.img} alt="" width={760} height={950} sizes="(min-width: 600px) 420px, 82vw" style={{ objectPosition: t.pos }} />
            </div>
            <div className="g-copy">
              <h3>{t.name}</h3>
              <span className="g-ml" lang="ml">{t.ml}</span>
              <p>{t.what}</p>
              <Link className="more" href={`/therapies/${t.slug}`}>More about {t.name}</Link>
            </div>
          </li>
        ))}
      </ul>
      <div className="g-ctrl">
        <button type="button" aria-label="Previous therapies" disabled={edge.start} onClick={() => step(-1)}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg>
        </button>
        <button type="button" aria-label="Next therapies" disabled={edge.end} onClick={() => step(1)}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 3 5 5-5 5" /></svg>
        </button>
      </div>
    </div>
  );
}
