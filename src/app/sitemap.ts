import type { MetadataRoute } from 'next';
import { CLINICS, REVIVE } from '@/lib/clinics';
import { getPosts } from '@/lib/content';

export const revalidate = 3600;
import { abs } from '@/lib/site';

const withLang = (e: MetadataRoute.Sitemap[number]) => ({ ...e, alternates: { languages: { 'en-IN': e.url, 'x-default': e.url } } });

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const POSTS = await getPosts();
  return ([
    { url: abs('/'), lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: abs('/book'), lastModified: now, changeFrequency: 'yearly', priority: 0.9 },
    { url: abs('/clinics'), lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    ...[...CLINICS, REVIVE].map((c) => ({ url: abs(`/clinics/${c.slug}`), lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 })),
    { url: abs('/doctors'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: abs('/therapies'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: abs('/visit'), lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: abs('/journal'), lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    ...POSTS.map((p) => ({ url: abs(`/journal/${p.slug}`), lastModified: new Date(p.revised), changeFrequency: 'yearly' as const, priority: 0.5 })),
    { url: abs('/privacy'), lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ] as MetadataRoute.Sitemap).map(withLang);
}
