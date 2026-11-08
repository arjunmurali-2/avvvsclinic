'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CLINIC, PARENT_URL, tel } from '@/lib/site';

const NAV = [
  { href: '/clinics', label: 'Speciality clinics', note: 'Headache, pain, obesity, fertility, mothers' },
  { href: '/therapies', label: 'Therapies', note: 'Pizhichil, Shirodhara, Elakizhi and more' },
  { href: '/clinics/gloveda-revive', label: 'Gloveda Revive', note: 'Ayur-Medi cosmetic care for skin and hair' },
  { href: '/journal', label: 'Journal', note: 'Notes from the clinic' },
  { href: '/visit', label: 'Visit', note: 'Opposite Kozhikode Railway Station' },
];

/**
 * The bar, as on avvvs.com: it tucks away on a deliberate scroll down and returns on any scroll up,
 * with a gold hairline along its foot that fills as the page is read. Narrow screens get the
 * numbered menu sheet with the thread running down its beads.
 */
export function Header() {
  const bar = useRef<HTMLElement>(null);
  const path = usePathname() || '/';
  const [open, setOpen] = useState(false);
  const here = (href: string) => (href === '/clinics' ? path === '/clinics' || (path.startsWith('/clinics/') && !path.endsWith('gloveda-revive')) : path.startsWith(href));

  useEffect(() => {
    const el = bar.current!;
    const fill = el.querySelector<HTMLElement>('.bar-thread span');
    let last = window.scrollY, raf = 0, max = 0;
    const measure = () => { max = document.documentElement.scrollHeight - window.innerHeight; };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      if (fill) fill.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      if (Math.abs(y - last) > 6) {
        el.classList.toggle('is-tucked', y > last && y > 200 && !el.contains(document.activeElement));
        last = y;
      }
      el.classList.toggle('is-scrolled', y > 8);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { ro.disconnect(); window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add('is-locked');
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const wide = window.matchMedia('(min-width: 1101px)');
    const onWide = () => { if (wide.matches) setOpen(false); };
    window.addEventListener('keydown', onKey);
    wide.addEventListener('change', onWide);
    return () => { root.classList.remove('is-locked'); window.removeEventListener('keydown', onKey); wide.removeEventListener('change', onWide); };
  }, [open]);

  return (
    <header className={`bar${open ? ' is-open' : ''}`} id="top" ref={bar}>
      <div className="bar-row">
        <Link className="bar-mark" href="/" aria-label={`${CLINIC.name}, home`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/avvvs-since-1921.svg" alt="" width={181} height={40} />
          <span className="bar-name" aria-hidden="true"><span>Ayur Speciality</span><span>Clinic</span></span>
        </Link>
        <nav className="bar-nav" aria-label="Main">
          {NAV.map((n) => <Link key={n.href} href={n.href} aria-current={here(n.href) ? 'page' : undefined}>{n.label}</Link>)}
        </nav>
        <div className="bar-end">
          <a className="bar-phone" href={tel(CLINIC.phones[0])}>{CLINIC.phones[0]}</a>
          <Link className="cta bar-cta" href="/book">Book a consultation</Link>
          <button type="button" className="bar-menu" aria-expanded={open} aria-controls="menu-sheet" onClick={() => setOpen((o) => !o)}>
            <span>{open ? 'Close' : 'Menu'}</span>
            <span className="bar-menu-icon" aria-hidden="true"><i /><i /></span>
          </button>
        </div>
      </div>
      <span className="bar-thread" aria-hidden="true"><span /></span>

      <div className="sheet" id="menu-sheet" hidden={!open}>
        <nav aria-label="Menu">
          <ol className="sheet-nav">
            {[{ href: '/', label: 'Home', note: 'AVVVS Ayur Speciality Clinic' }, ...NAV].map((m, i) => (
              <li key={m.href} style={{ '--i': i } as React.CSSProperties}>
                <Link href={m.href} aria-current={(m.href === '/' ? path === '/' : here(m.href)) ? 'page' : undefined} onClick={() => setOpen(false)}>
                  <span className="sheet-no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <span className="sheet-title">{m.label}</span>
                  <span className="sheet-note">{m.note}</span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <div className="sheet-foot" style={{ '--i': NAV.length + 1 } as React.CSSProperties}>
          <Link className="cta sheet-cta" href="/book" onClick={() => setOpen(false)}>Book a consultation</Link>
          <div className="sheet-contact">
            {CLINIC.phones.map((p) => <a key={p} href={tel(p)}>{p}</a>)}
            <a href={`mailto:${CLINIC.email}`}>{CLINIC.email}</a>
            <p>{CLINIC.landmark} · <a href={PARENT_URL} rel="noopener">avvvs.com ↗</a></p>
          </div>
        </div>
      </div>
    </header>
  );
}
