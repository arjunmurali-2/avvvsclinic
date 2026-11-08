# AVVVS Ayur Speciality Clinic · clinic.avvvs.com

The clinic's own site, a separate Next.js 15 app in the avvvs.com design system (ivory and parchment
grounds, Gloock and Manjari, AVVVS blue for action, gold for the thread). Motion is **Lenis** (smooth
scroll) and **anime.js v4** (split-word headings, scroll-scrubbed parallax and statement, drawn gold
threads, the sideways therapies rail, a velocity-aware marquee). All of it is skipped under reduced
motion, and nothing is hidden without JavaScript.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```

## Pages

| Route | What it is |
| --- | --- |
| `/` | Home: hero, the clinics index, the therapies rail, integrated care, Gloveda Revive, visit, journal, FAQ |
| `/clinics`, `/clinics/[slug]` | The six speciality clinics and Gloveda Revive |
| `/therapies` | Pizhichil, Shirodhara, Abhyanga, Elakizhi, Njavarakizhi, Udwarthana |
| `/book` | Three-step consultation request (`?care=<clinic-slug>` preselects) |
| `/journal`, `/journal/[slug]`, `/journal/rss.xml` | The blog |
| `/visit`, `/privacy` | Address and contact; privacy draft |

Content lives in `src/lib/` (`site.ts` facts, `clinics.ts`, `therapies.ts`, `journal.ts`, `faq.ts`).
Change a phone number in `site.ts` and every page, the JSON-LD and llms.txt follow.

## Booking

`/api/book` validates the request and emails it by SMTP to `MAIL_TO`
(default avvvsayurspecialityclinic@gmail.com). Copy `.env.example` to `.env.local`. Without SMTP,
development prints the request to the terminal and production returns 503 (the form then shows the
phone numbers). The app therefore needs a Node host (Vercel is fine), not a static export.

## SEO, AEO, GEO

- Per-page titles, descriptions, canonicals and hreflang (en-IN); generated share cards per page.
- JSON-LD: `MedicalClinic` + `LocalBusiness` (address, phones, services, ReserveAction to /book,
  parent organisation AVVVS), `Physician`, `MedicalWebPage` with `speakable`, `BreadcrumbList`,
  `FAQPage`, `Blog` and `BlogPosting`.
- Every page opens with an "In short" answer (`[data-answer]`) written to be quoted on its own,
  and ends with visible questions that mirror the FAQPage data.
- `robots.txt` welcomes AI crawlers; `/llms.txt` is generated from the same data as the pages;
  `/sitemap.xml`; RSS for the Journal; `geo.region` / `geo.placename` meta.

## Before launch

- Point `clinic.avvvs.com` at the deployment and set `NEXT_PUBLIC_SITE_URL=https://clinic.avvvs.com`.
- Have the clinic's doctors review the Journal pieces and FAQ answers.
- Add opening hours and map coordinates to `site.ts` and `ld.ts` once the clinic confirms them
  (deliberately left out rather than guessed), and claim the Google Business Profile with the same
  name, address and phone.
- Imagery is the AVVVS film's stills; swap in photographs of the clinic when they exist.
