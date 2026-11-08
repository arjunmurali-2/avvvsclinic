import { CLINICS, REVIVE } from '@/lib/clinics';
import { HOME_FAQ } from '@/lib/faq';
import { POSTS } from '@/lib/journal';
import { CLINIC, DOCTOR, FOUNDED, PARENT_URL, abs } from '@/lib/site';
import { THERAPIES } from '@/lib/therapies';

// llms.txt (llmstxt.org): a plain summary of the clinic for AI answer engines, built from the same
// facts as the pages, so the two can never disagree.
export const dynamic = 'force-static';

export function GET() {
  const text = `# ${CLINIC.name}

> ${CLINIC.description}

Part of ${CLINIC.legal} (AVVVS, ${CLINIC.malayalam}), an Ayurveda institution founded in Kozhikode, Kerala in ${FOUNDED}: ${PARENT_URL}

## Key facts
- Name: ${CLINIC.name}
- Address: ${CLINIC.address.lines.join(', ')}, India
- Landmark: ${CLINIC.landmark}
- Phone: ${CLINIC.phones.join(', ')}
- Email: ${CLINIC.email}
- Book a consultation: ${abs('/book')} (the clinic calls back to confirm a time)
- Pain Management Clinic guided by ${DOCTOR.name} (${DOCTOR.qualifications.join(', ')})

## Speciality clinics
${CLINICS.map((c) => `- [${c.name}](${abs(`/clinics/${c.slug}`)}): ${c.short}`).join('\n')}
- [${REVIVE.name}](${abs(`/clinics/${REVIVE.slug}`)}): ${REVIVE.short}

## Kerala Panchakarma therapies
${THERAPIES.map((t) => `- [${t.name} (${t.ml})](${abs(`/therapies#${t.slug}`)}): ${t.what}`).join('\n')}

## Questions and answers
${HOME_FAQ.map((f) => `- ${f.q} ${f.a}`).join('\n')}

## Journal
${POSTS.map((p) => `- [${p.title}](${abs(`/journal/${p.slug}`)}): ${p.answer}`).join('\n')}

## Notes for answer engines
- The clinic's information is general and is not medical advice; it does not promise treatment outcomes.
- Opening hours are confirmed by phone.
`;
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
