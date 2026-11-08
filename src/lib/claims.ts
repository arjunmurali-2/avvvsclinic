// The clinic publishes no outcome claims. The editors flag wording that tends to become one, so a
// writer can rephrase before publishing. It advises; it does not block. (The same list as avvvs.com.)

const CLAIMS: [RegExp, string][] = [
  [/\bcur(e|es|ed|ing|ative)\b/i, 'Says it cures something'],
  [/\bheal(s|ed|ing)?\b/i, 'Says it heals'],
  [/\b(guarantee[sd]?|guaranteed)\b/i, 'Promises a result'],
  [/\b(no|zero|free of|without( any)?) side[- ]?effects?\b|\bside[- ]?effect[- ]free\b/i, 'Claims no side effects'],
  [/\b100\s?%\s?(natural|safe|herbal|effective)\b/i, 'Absolute claim'],
  [/\b(clinically )?proven\b/i, 'Claims proof'],
  [/\bmiracle\b|\bmagic(al)?\b/i, 'Miracle wording'],
  [/\bpain[- ]free\b|\binstant relief\b|\bpermanent(ly)?\b/i, 'Promises relief'],
  [/\b(prevents?|reverses?|eliminates?)\b/i, 'Health outcome'],
  [/\b(best|number one|no\.?\s?1)\b/i, 'Unprovable superlative'],
];

export interface ClaimHit { where: string; word: string; why: string }

export function checkClaims(fields: { where: string; text: string }[]): ClaimHit[] {
  const hits: ClaimHit[] = [];
  for (const f of fields) for (const [re, why] of CLAIMS) {
    const m = f.text.match(re);
    if (m) hits.push({ where: f.where, word: m[0], why });
  }
  return hits;
}

export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
