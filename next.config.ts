import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

// The clinic's public address, fixed at build time. NEXT_PUBLIC_SITE_URL wins when set (the final
// domain, https://clinic.avvvs.com); otherwise Vercel's production domain. Canonicals, hreflang,
// the sitemap, robots, share cards and structured data all follow it.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://clinic.avvvs.com');

export default function config(phase: string): NextConfig {
  return {
    env: { NEXT_PUBLIC_SITE_URL: SITE_URL, NEXT_PUBLIC_DEPLOY_ENV: process.env.VERCEL_ENV || 'local' },
    reactStrictMode: true,
    // admin uploads live in Vercel Blob
    images: { formats: ['image/avif', 'image/webp'], remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }] },
    // PGlite (the local admin database) ships its own WebAssembly; keep it out of the server bundle
    serverExternalPackages: ['@electric-sql/pglite'],
    experimental: { inlineCss: true },
    // the dev server writes elsewhere, so a production build can run beside it
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
    async redirects() {
      // the old avvvs.com clinic page names, for anyone arriving from them
      return [
        { source: '/avvvs-speciality-clinic', destination: '/', permanent: true },
        { source: '/treatments', destination: '/therapies', permanent: true },
        { source: '/blog', destination: '/journal', permanent: true },
        { source: '/contact', destination: '/visit', permanent: true },
        { source: '/appointment', destination: '/book', permanent: true },
        // the obesity and lifestyle clinics became one (2026-11-08)
        { source: '/clinics/obesity-management-clinic', destination: '/clinics/obesity-lifestyle-clinic', permanent: true },
        { source: '/clinics/lifestyle-diseases-clinic', destination: '/clinics/obesity-lifestyle-clinic', permanent: true },
      ];
    },
  };
}
