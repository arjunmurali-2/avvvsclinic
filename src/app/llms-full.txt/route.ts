import { CLINICS, REVIVE } from '@/lib/clinics';
import { HOME_FAQ } from '@/lib/faq';
import { getDoctors, getPosts, getTherapies, clinicName } from '@/lib/content';
import type { Block } from '@/lib/journal';
import { CLINIC, FOUNDED, PARENT_URL, abs } from '@/lib/site';

/*
 * llms-full.txt: the whole site as plain text, for AI answer engines that read a site in one pass
 * (the companion to /llms.txt, which is the index). Built from the same data as the pages.
 */
export const revalidate = 3600;

const blocks = (bs: Block[]) => bs.map((b) => {
  switch (b.t) {
    case 'p': case 'quote': return b.text;
    case 'h2': return `### ${b.text}`;
    case 'ul': return b.items.map((x) => `- ${x}`).join('\n');
    case 'ol': return b.items.map((x, i) => `${i + 1}. ${x.h}: ${x.p}`).join('\n');
    case 'note': return `> ${b.h}: ${b.text}`;
    case 'img': return b.caption ?? '';
  }
}).filter(Boolean).join('\n\n');

export async function GET() {
  const [therapies, doctors, posts] = await Promise.all([getTherapies(), getDoctors(), getPosts()]);
  const text = `# ${CLINIC.name}: the full site

> ${CLINIC.description}

- Address: ${CLINIC.name}, ${CLINIC.address.lines.join(', ')}, India (${CLINIC.landmark})
- Phone: ${CLINIC.phones.join(', ')}
- Email: ${CLINIC.email}
- Book: ${abs('/book')} (a request; the clinic calls to confirm a time)
- Part of ${CLINIC.legal} (AVVVS), an Ayurveda institution founded in Kozhikode in ${FOUNDED}: ${PARENT_URL}
- The clinic's information is general and is not medical advice. It does not promise treatment outcomes.

## Speciality clinics

${[...CLINICS.map((c) => `### ${c.name}\nURL: ${abs(`/clinics/${c.slug}`)}\n\n${c.short}\n\n${c.lede} ${c.body.join(' ')}\n\nTherapies: ${therapies.filter((t) => t.clinics?.includes(c.slug)).map((t) => t.name).join(', ') || 'chosen after consultation'}\n\n${c.faq.map((f) => `Q: ${f.q}\nA: ${f.a}`).join('\n\n')}`),
  `### ${REVIVE.name} (${REVIVE.kicker})\nURL: ${abs(`/clinics/${REVIVE.slug}`)}\n\n${REVIVE.short}\n\n${REVIVE.body.join(' ')}`].join('\n\n')}

## Therapies

${therapies.map((t) => `### ${t.name}${t.ml ? ` (${t.ml})` : ''}\nURL: ${abs(`/therapies/${t.slug}`)}\n\n${t.what}${t.how ? ` ${t.how}` : ''}\n\nOffered in: ${(t.clinics ?? []).map(clinicName).join(', ') || 'after consultation'}`).join('\n\n')}

## Doctors

${doctors.map((d) => `- ${d.name} (${d.quals.join(', ')})${d.role ? `, ${d.role}` : ''}: ${abs(`/doctors/${d.slug}`)}`).join('\n')}

## Questions and answers

${HOME_FAQ.map((f) => `Q: ${f.q}\nA: ${f.a}`).join('\n\n')}

## Journal

${posts.map((p) => `### ${p.title}\nURL: ${abs(`/journal/${p.slug}`)}\nPublished: ${p.published}\n\n${p.answer}\n\n${blocks(p.blocks)}`).join('\n\n')}
`;
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
