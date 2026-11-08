# Ranking plan: AVVVS Ayur Speciality Clinic

No website can guarantee first place. For a local clinic, Google ranks the map pack and local
results mainly on **relevance, distance and prominence**, and prominence comes largely from outside
the website: the Google Business Profile, reviews, consistent listings and links. The site is now
built to win everything it can on its own; the steps below are the rest, roughly in order of impact.

## What the site already does

- A page for every clinic, therapy and doctor, each with its own title, description, canonical
  address, share card and "In short" answer written to be quoted by Google and AI answers.
- Kozhikode **and** Calicut throughout: titles, address, structured data, FAQs.
- Structured data: MedicalClinic + LocalBusiness with each speciality clinic as a department,
  Physician profiles, MedicalTherapy entities, MedicalWebPage (with the conditions each clinic
  covers), FAQPage, BreadcrumbList, ItemList, BlogPosting (with "medically reviewed by" when set),
  ReserveAction for booking.
- `sitemap.xml` with images, `robots.txt` welcoming AI crawlers, `llms.txt` and `llms-full.txt`,
  RSS for the Journal, IndexNow pings when the admin publishes.
- Search Console, Bing and Meta verification tags; GA4 and Meta Pixel after consent; booking,
  call, email and directions events.

## 1. Google Business Profile (the biggest single factor)

1. Claim or create the profile at business.google.com as **AVVVS Ayur Speciality Clinic**.
   Use exactly the name, address and phone below everywhere (NAP consistency):
   - AVVVS Ayur Speciality Clinic
   - 3rd floor, Kaloor Central, Annie Hall Road, Opp. Kozhikode Railway Station, Kozhikode, Kerala 673002
   - +91 99469 29448
2. Primary category **Ayurvedic clinic**; secondary categories such as *Alternative medicine
   practitioner*, *Medical clinic*, *Wellness center*, *Skin care clinic* (for Gloveda Revive).
3. Website: `https://clinic.avvvs.com`; appointment link: `https://clinic.avvvs.com/book`.
4. Opening hours, photos of the real clinic (entrance, reception, therapy rooms, the building from
   the station side), the six doctors, and each therapy as a "service" linking to its page.
5. Drop the map pin precisely on Kaloor Central. Then add the hours and the coordinates to
   `src/lib/site.ts` / `src/lib/ld.ts` so the site and the profile agree.
6. Post weekly (a therapy, a Journal article, a doctor), and answer the Q&A section.

## 2. Reviews

Ask every patient, at the end of a course of treatment, for a Google review (a QR code at
reception linking to the review form works well). Reply to every review. Never offer anything in
return, and never post reviews yourself; both breach Google's rules and India's Consumer
Protection (E-Commerce) rules. Do not add review stars to the site's structured data: Google
ignores self-published review markup for local businesses.

## 3. Listings (citations)

Create or correct listings with identical name, address and phone on: Practo, Justdial, Sulekha,
Lybrate, Bing Places, Apple Business Connect, Facebook and Instagram profiles, IndiaMART (for
AVVVS), Kerala Tourism wellness listings (for Panchakarma travellers), and Ayurveda directories.

## 4. Links

- avvvs.com links to the clinic in its header and footer; add a link from the main site's
  Our history and Journal articles about the clinic, using natural anchor text ("AVVVS Ayur
  Speciality Clinic in Kozhikode").
- Local press: the centenary story, the doctors, a new speciality clinic. Ask for a link.
- Partners: hotels near the station, Kerala tourism and wellness-travel sites, Ayurveda colleges.

## 5. Search Console and Bing Webmaster Tools

1. Set `NEXT_PUBLIC_GSC_VERIFICATION` and `NEXT_PUBLIC_BING_VERIFICATION` in Vercel, redeploy,
   verify, and submit `https://clinic.avvvs.com/sitemap.xml` in both.
2. Set `INDEXNOW_KEY` (32 hex characters) so new pages are announced to Bing immediately; Bing
   also powers ChatGPT search and Copilot answers.
3. Request indexing for the home page, each clinic page and each therapy page once.
4. Watch the queries report monthly: give each query with impressions but low clicks a better
   title or a Journal article that answers it.

## 6. Content that wins searches (GEO and AEO)

AI answers and featured snippets quote pages that answer one question plainly. In the admin:

- One Journal article a month answering a real question patients ask, with a clear short answer,
  linked to its clinic and therapies, and **medically reviewed by** one of the doctors.
- Candidates: "Is Ayurveda safe during pregnancy?", "How many sittings of Shirodhara are
  needed?", "What to eat during Panchakarma", "Ayurveda for migraine: what to expect",
  "Pizhichil vs Abhyanga", "Panchakarma in Kozhikode for visitors from the Gulf".
- Keep the clinic's rule: describe, never promise outcomes.

## 7. Before launch

- Point `clinic.avvvs.com` at the deployment and set `NEXT_PUBLIC_SITE_URL`.
- Replace the generated photographs with real ones of the clinic as they come.
- Have the Privacy Policy and Terms reviewed by a lawyer.
- Confirm opening hours and add them to the site and the Business Profile.
