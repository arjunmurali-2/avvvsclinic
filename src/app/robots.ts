import type { MetadataRoute } from 'next';
import { abs, INDEXABLE } from '@/lib/site';

// Search engines and AI answer engines are welcome: being quoted accurately by ChatGPT, Claude,
// Perplexity and Google AI answers is part of the point (GEO). Only the APIs and the admin are off limits.
const AI_CRAWLERS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
  'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Bingbot', 'CCBot'];

export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) return { rules: [{ userAgent: '*', disallow: '/' }] };
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/admin'] },
      { userAgent: AI_CRAWLERS, allow: '/', disallow: ['/api/', '/admin'] },
    ],
    sitemap: abs('/sitemap.xml'),
    host: abs('/'),
  };
}
