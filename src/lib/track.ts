'use client';

// Thin wrappers over gtag and fbq. Both are no-ops until Analytics.tsx has loaded the tag, which
// only happens after the visitor's consent, so call sites never need to check. No personal or
// health details are ever sent: only which kind of care was requested.

type Gtag = (...args: unknown[]) => void;
type Fbq = ((...args: unknown[]) => void) & { loaded?: boolean };
const w = () => (typeof window === 'undefined' ? undefined : (window as unknown as { gtag?: Gtag; fbq?: Fbq; __clinicGa?: boolean; __clinicPixel?: boolean }));

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID?.trim() || '';
export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || '';

export function trackPageView(path: string) {
  const win = w();
  if (win?.__clinicGa && win.gtag) win.gtag('event', 'page_view', { page_path: path, page_location: window.location.href, page_title: document.title });
  if (win?.__clinicPixel && win.fbq) win.fbq('track', 'PageView');
}

/** A consultation request was sent: GA4 generate_lead, Meta Schedule (with Lead for older ad sets). */
export function trackBooking(care: string) {
  const win = w();
  if (win?.__clinicGa && win.gtag) win.gtag('event', 'generate_lead', { lead_source: 'booking_form', care });
  if (win?.__clinicPixel && win.fbq) { win.fbq('track', 'Schedule', { content_category: care }); win.fbq('track', 'Lead', { content_category: care }); }
}

/** Someone tapped a phone number or the directions link. */
export function trackContact(kind: 'call' | 'email' | 'directions') {
  const win = w();
  if (win?.__clinicGa && win.gtag) win.gtag('event', kind === 'call' ? 'click_to_call' : kind === 'email' ? 'click_email' : 'click_directions');
  if (win?.__clinicPixel && win.fbq) win.fbq('track', 'Contact', { content_category: kind });
}
