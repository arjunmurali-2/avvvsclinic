'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { animate } from 'animejs';
import { CLINICS, REVIVE } from '@/lib/clinics';

const ROWS = [
  ...CLINICS.map((c) => ({ href: `/clinics/${c.slug}`, no: c.no, name: c.name, note: c.lede, img: c.image.src })),
  { href: `/clinics/${REVIVE.slug}`, no: '07', name: `${REVIVE.name}`, note: 'Ayur-Medi cosmetic care for skin and hair.', img: '/media/k10.jpg' },
];

/**
 * The speciality clinics as one numbered index. On a desktop pointer, a picture follows the cursor
 * and changes with each row (anime.js eases it after the pointer); on touch it is a clean list.
 */
export function ClinicIndex() {
  const wrap = useRef<HTMLDivElement>(null);
  const float = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = wrap.current, card = float.current;
    if (!root || !card || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const imgs = [...card.querySelectorAll<HTMLImageElement>('img')];
    let shown = -1;
    const pos = { x: 0, y: 0 };
    const move = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      pos.x = e.clientX - r.left; pos.y = e.clientY - r.top;
      animate(card, { x: pos.x, y: pos.y, duration: 900, ease: 'outExpo', composition: 'replace' });
    };
    const enterRow = (i: number) => () => {
      if (shown === i) return;
      imgs.forEach((im, k) => animate(im, { opacity: k === i ? 1 : 0, scale: k === i ? [1.15, 1] : 1, duration: 700, ease: 'outQuart' }));
      shown = i;
    };
    const on = () => animate(card, { opacity: 1, scale: [0.85, 1], rotate: [-4, 0], duration: 600, ease: 'outBack(1.4)' });
    const off = () => { animate(card, { opacity: 0, scale: 0.85, duration: 400, ease: 'outQuart' }); };
    const rows = [...root.querySelectorAll<HTMLElement>('.ci-row')];
    const handlers = rows.map((r, i) => { const h = enterRow(i); r.addEventListener('pointerenter', h); return h; });
    root.addEventListener('pointermove', move);
    root.addEventListener('pointerenter', on);
    root.addEventListener('pointerleave', off);
    return () => {
      rows.forEach((r, i) => r.removeEventListener('pointerenter', handlers[i]));
      root.removeEventListener('pointermove', move); root.removeEventListener('pointerenter', on); root.removeEventListener('pointerleave', off);
    };
  }, []);

  return (
    <div className="ci" ref={wrap}>
      <ol className="ci-list" data-stagger>
        {ROWS.map((r) => (
          <li key={r.href}>
            <Link className="ci-row" href={r.href}>
              <span className="ci-no">{r.no}</span>
              <span className="ci-name">{r.name}</span>
              <span className="ci-note">{r.note}</span>
              <span className="ci-arrow" aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ol>
      <div className="ci-float" ref={float} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {ROWS.map((r) => <img key={r.href} src={r.img} alt="" loading="lazy" />)}
      </div>
    </div>
  );
}
