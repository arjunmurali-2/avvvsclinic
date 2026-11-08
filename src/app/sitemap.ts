import type { MetadataRoute } from 'next';
import { CLINICS, REVIVE } from '@/lib/clinics';
import { getDoctors, getPosts, getTherapies } from '@/lib/content';
import { abs } from '@/lib/site';

// Every public page, with its main image (image sitemaps help photographs appear in image search
// and in AI answers that show pictures). Refreshed hourly and whenever the admin publishes.
export const revalidate = 3600;

const img = (src?: string | null) => (src ? [src.startsWith('/') ? abs(src) : src] : undefined);
const withLang = (e: MetadataRoute.Sitemap[number]) => ({ ...e, alternates: { languages: { 'en-IN': e.url, 'x-default': e.url } } });

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [posts, therapies, doctors] = await Promise.all([getPosts(), getTherapies(), getDoctors()]);
  return ([
    { url: abs('/'), lastModified: now, changeFrequency: 'weekly', priority: 1, images: img('/photos/shirodhara.jpg') },
    { url: abs('/book'), lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: abs('/clinics'), lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    ...CLINICS.map((c) => ({ url: abs(`/clinics/${c.slug}`), lastModified: now, changeFrequency: 'monthly' as const, priority: 0.9, images: img(c.image.src) })),
    { url: abs(`/clinics/${REVIVE.slug}`), lastModified: now, changeFrequency: 'monthly', priority: 0.8, images: img('/photos/hairoil.jpg') },
    { url: abs('/therapies'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    ...therapies.map((t) => ({ url: abs(`/therapies/${t.slug}`), lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8, images: img(t.img) })),
    { url: abs('/doctors'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    ...doctors.map((d) => ({ url: abs(`/doctors/${d.slug}`), lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7, images: img(d.photo) })),
    { url: abs('/visit'), lastModified: now, changeFrequency: 'yearly', priority: 0.8 },
    { url: abs('/journal'), lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    ...posts.map((p) => ({ url: abs(`/journal/${p.slug}`), lastModified: new Date(p.revised), changeFrequency: 'monthly' as const, priority: 0.6, images: img(p.cover.src) })),
    { url: abs('/privacy'), lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: abs('/terms'), lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ] as MetadataRoute.Sitemap).map(withLang);
}
