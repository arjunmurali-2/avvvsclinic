# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: local patients in Kozhikode and the wider Malabar region with a health concern (headaches, chronic pain, weight, lifestyle disorders, fertility, pregnancy and postnatal care, skin and hair), deciding whether to book a consultation. Secondary: wellness travellers and NRIs coming to Kerala for a course of Panchakarma therapies (confirmed by the user, 2026-11-08).

## Product Purpose

The site of AVVVS Ayur Speciality Clinic at clinic.avvvs.com, a separate app from avvvs.com. It explains the speciality clinics and Kerala therapies, earns trust through AVVVS's century of Ayurveda, and turns a visit into a consultation request. Success is a booked consultation (the clinic calls back to confirm).

## Positioning

The clinic of Arya Vaidya Vilasini Vaidya Sala, an Ayurveda institution founded in Kozhikode in 1921 with its own GMP-certified pharmacy: authentic Kerala Ayurveda combined with modern medical care where it helps (the Pain Management Clinic under Dr. Ranjith Kumar, BAMS, MBBS, MD, DA; body-contouring technology beside Udwarthana), located directly opposite Kozhikode Railway Station.

## Operating Context

Patients usually phone or book online, then visit the 3rd floor of Kaloor Central, Annie Hall Road. Many therapies are a course of sittings over several days, so travel to the clinic matters; the station location helps people from across Malabar and visitors arriving by train.

## Capabilities and Constraints

- Speciality clinics: Headache; Pain Management; Obesity Management; Lifestyle Diseases; Male and Female Infertility; Pregnancy and Postnatal Care; Gloveda Revive (Ayur-Medi Cosmetic Clinic for skin and hair).
- Therapies named by the clinic: Pizhichil, Shirodhara, Abhyanga, Elakizhi, Njavarakizhi; Udwarthana in the obesity programme; treatments for rejuvenation and healthy ageing.
- Booking: a request form (care, preferred day, time of day, contact) emailed to the clinic by SMTP; the clinic confirms by phone. Journal (blog) for general-information articles.
- Stack: Next.js 15 (App Router) in `clinic/`, its own repo (github.com/arjunmurali-2/avvvsclinic), deployed as a Node app. Lenis and anime.js for motion (user, 2026-11-08).
- SEO, AEO and GEO are required: structured data, quotable answers, llms.txt, sitemap, AI crawlers allowed.
- Undecided: opening hours, map coordinates, doctors other than Dr. Ranjith Kumar.

## Brand Commitments

- Name: AVVVS Ayur Speciality Clinic, part of Arya Vaidya Vilasini Vaidya Sala (ആര്യവൈദ്യ വിലാസിനി വൈദ്യശാല). AVVVS logos in `public/brand/`, shown in their true colours.
- Headline typeface: CastleT (user-supplied, `~/Downloads/CastleT.woff`), headlines only; system UI font for body and forms (user, 2026-11-08).
- The user asked for a premium, Apple-like site with far fewer headings, and rejected the first build's film-still imagery and heading density (2026-11-08).
- Contact: avvvsayurspecialityclinic@gmail.com, +91 99469 29448, +91 80892 02092.

## Evidence on Hand

- Clinic copy supplied by the user on 2026-11-08 (overview, each clinic, Gloveda Revive).
- No real photographs of the clinic, its rooms or its doctors yet; the old avvvs.com clinic images are stock. Generated photography must not depict identifiable real staff or be presented as the actual clinic interior.
- Absent and not to be fabricated: testimonials, patient numbers, success rates, prices, awards, opening hours.

## Product Principles

1. Calm before persuasion: a worried patient should feel looked after within one screen.
2. One clear next step everywhere: book a consultation, or call.
3. Every claim is one the clinic already makes; no promised outcomes.
4. Kerala Ayurveda, presented with modern precision.
