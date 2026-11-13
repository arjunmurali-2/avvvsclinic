'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CLINIC, PARENT_URL, tel } from '@/lib/site';

const NAV = [
  { href: '/clinics', label: 'Clinics' },
  { href: '/therapies', label: 'Therapies' },
  { href: '/doctors', label: 'Doctors' },
  { href: '/journal', label: 'Journal' },
  { href: '/visit', label: 'Visit' },
];

// other AVVVS sites, set apart from the clinic's own pages
const ELSEWHERE = [
  { href: CLINIC.pharmacy, label: 'Pharmacy' },
  { href: PARENT_URL, label: 'AVVVS' },
];

const Ext = () => <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 1.5h5.5V7M8.5 1.5 1.5 8.5" /></svg>;

/** A thin, translucent bar in the manner of a product site: the mark, five places, and Book. */
export function Header() {
  const bar = useRef<HTMLElement>(null);
  const path = usePathname() || '/';
  const [open, setOpen] = useState(false);
  const here = (href: string) =>
    href === '/clinics' ? path === '/clinics' || (path.startsWith('/clinics/') && !path.endsWith('gloveda-revive')) : path.startsWith(href);

  useEffect(() => {
    const el = bar.current!;
    const on = () => el.classList.toggle('is-scrolled', window.scrollY > 4);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add('is-locked');
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const wide = window.matchMedia('(min-width: 1001px)');
    const onWide = () => { if (wide.matches) setOpen(false); };
    window.addEventListener('keydown', onKey);
    wide.addEventListener('change', onWide);
    return () => { root.classList.remove('is-locked'); window.removeEventListener('keydown', onKey); wide.removeEventListener('change', onWide); };
  }, [open]);

  return (
    <header className={`nav${open ? ' is-open' : ''}`} ref={bar}>
      <div className="nav-row">
        <Link className="nav-mark" href="/" aria-label={`${CLINIC.name}, home`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/avvvs-since-1921.svg" alt="" width={127} height={28} />
          <span className="nav-name">Ayur Speciality Clinic</span>
        </Link>
        <ul className="nav-links">
          {NAV.map((n) => <li key={n.href}><Link href={n.href} aria-current={here(n.href) ? 'page' : undefined}>{n.label}</Link></li>)}
          <li className="nav-sep" aria-hidden="true" />
          {ELSEWHERE.map((n) => <li key={n.href}><a className="nav-ext" href={n.href} rel="noopener">{n.label}<Ext /></a></li>)}
        </ul>
        <div className="nav-end">
          <Link className="btn btn-sm" href="/book">Book</Link>
          <button type="button" className="nav-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="menu" onClick={() => setOpen((o) => !o)}>
            <i /><i />
          </button>
        </div>
      </div>
      <div className="sheet" id="menu" hidden={!open}>
        <ul>
          {[{ href: '/', label: 'Home' }, ...NAV, { href: '/book', label: 'Book a consultation' }, { href: '/consult', label: 'Online consultation' }].map((n, i) => (
            <li key={n.href} style={{ '--i': i } as React.CSSProperties}>
              <Link className="sheet-link" href={n.href} onClick={() => setOpen(false)}>{n.label}</Link>
            </li>
          ))}
        </ul>
        <ul className="sheet-sub">
          {ELSEWHERE.map((n, i) => (
            <li key={n.href} style={{ '--i': NAV.length + 2 + i } as React.CSSProperties}>
              <a className="sheet-link" href={n.href} rel="noopener">{n.label === 'AVVVS' ? 'avvvs.com' : 'AVVVS Pharmacy'}<Ext /></a>
            </li>
          ))}
        </ul>
        <div className="sheet-foot">
          {CLINIC.phones.map((p) => <a key={p} href={tel(p)}>{p}</a>)}
          <span className="muted">{CLINIC.landmark}</span>
        </div>
      </div>
    </header>
  );
}
