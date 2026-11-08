'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminNav({ admin, name }: { admin: boolean; name: string }) {
  const path = usePathname() || '';
  const items = [
    { href: '/admin', label: 'Overview', on: path === '/admin' },
    { href: '/admin/clinics', label: 'Clinics', on: path.startsWith('/admin/clinics') },
    { href: '/admin/doctors', label: 'Doctors', on: path.startsWith('/admin/doctors') },
    { href: '/admin/treatments', label: 'Treatments', on: path.startsWith('/admin/treatments') },
    { href: '/admin/journal', label: 'Journal', on: path.startsWith('/admin/journal') },
    ...(admin ? [{ href: '/admin/users', label: 'Accounts', on: path.startsWith('/admin/users') }] : []),
    { href: '/admin/account', label: name, on: path.startsWith('/admin/account') },
  ];
  return (
    <nav className="ad-nav" aria-label="Admin">
      {items.map((i) => <Link key={i.href} href={i.href} aria-current={i.on ? 'page' : undefined}>{i.label}</Link>)}
    </nav>
  );
}
