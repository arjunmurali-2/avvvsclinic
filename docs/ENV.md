# Environment variables

Everything the clinic site (`clinic.avvvs.com`) reads from its environment: what each variable is,
where its value comes from, and where to set it.

## Where to set them

**On the live site (Vercel):** open the clinic project in Vercel, then go to **Settings → Environment
Variables**. Add each variable, tick the environments it applies to, and **redeploy** afterwards.
Variables starting with `NEXT_PUBLIC_` are fixed into the site when it is built, so they only take
effect after a new deployment.

**On a developer's computer:** copy `.env.example` to `.env.local` in the `clinic/` folder and fill in
what you need. `.env.local` is never committed. Locally, nothing is required: the admin uses a
built-in database, uploads go to `public/uploads/`, and booking emails are printed in the terminal.

Environments, as Vercel names them: **Production** is the live site; **Preview** is the test
deployment each branch gets; **Development** is `vercel dev` on a computer.

---

## 1. Site address

| Variable | Required | Value | Set for |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://clinic.avvvs.com` | Production |

Used for canonical links, the sitemap, share cards, structured data and llms.txt. Set it once the
domain `clinic.avvvs.com` points at the Vercel project (Vercel → **Settings → Domains**). Until then
the site uses Vercel's own production address automatically.

---

## 2. Booking emails (SMTP)

Without these, the booking form on the live site cannot send requests and shows the phone numbers
instead. The clinic uses Gmail (`avvvsayurspecialityclinic@gmail.com`), so the values below are
for Gmail.

| Variable | Required | Value | Set for |
|---|---|---|---|
| `SMTP_HOST` | Yes | `smtp.gmail.com` | Production, Preview |
| `SMTP_PORT` | Yes | `465` | Production, Preview |
| `SMTP_SECURE` | Yes | `true` | Production, Preview |
| `SMTP_USER` | Yes | `avvvsayurspecialityclinic@gmail.com` | Production, Preview |
| `SMTP_PASS` | Yes | A Gmail **App Password** (16 letters), not the account password | Production, Preview |
| `MAIL_FROM` | Yes | `avvvsayurspecialityclinic@gmail.com` | Production, Preview |
| `MAIL_TO` | No | Inbox that receives bookings. Default: `avvvsayurspecialityclinic@gmail.com` | Production |
| `SEND_ACK` | No | `true` to email the patient a short "we have your request" note when they give an email. Default `false` | Production |

**Getting the App Password:** sign in to the clinic's Google account → **Manage your Google Account →
Security** → turn on **2-Step Verification** → search **App passwords** → create one named
"Clinic website" → copy the 16-letter password into `SMTP_PASS`. Mark it **Sensitive** in Vercel.

---

## 3. Admin (`/admin`)

| Variable | Required | Value | Set for |
|---|---|---|---|
| `DATABASE_URL` | Yes | Set automatically by Vercel when you add **Neon** | Production, Preview |
| `BLOB_READ_WRITE_TOKEN` | Yes | Set automatically by Vercel when you add **Blob** | Production, Preview |
| `ADMIN_SETUP_KEY` | Yes, once | Any long random phrase (16+ characters) | Production |

**Neon (database):** Vercel project → **Storage → Create Database → Neon (Postgres)** → connect it
to the project. This adds `DATABASE_URL`. You may instead connect the avvvs.com project's existing
Neon database: every clinic table is named `clinic_…`, so the two sites never clash.

**Blob (images):** Vercel project → **Storage → Create → Blob** → connect it. This adds
`BLOB_READ_WRITE_TOKEN`. Photos uploaded in the admin (doctors, treatments, articles) are stored here.

**ADMIN_SETUP_KEY:** make one up (for example, run `openssl rand -hex 24`). After deploying, open
`https://clinic.avvvs.com/admin/setup`, enter the key, and create the first admin account. It only
works while there are no accounts; you can delete the variable afterwards.

---

## 4. Search engines

| Variable | Required | Value | Set for |
|---|---|---|---|
| `NEXT_PUBLIC_GSC_VERIFICATION` | Recommended | Google Search Console verification code | Production |
| `NEXT_PUBLIC_BING_VERIFICATION` | Recommended | Bing Webmaster Tools verification code | Production |
| `INDEXNOW_KEY` | Recommended | 32 hexadecimal characters you make up | Production |

**Google Search Console:** search.google.com/search-console → **Add property → URL prefix** →
`https://clinic.avvvs.com` → choose **HTML tag** → copy only the `content` value from
`<meta name="google-site-verification" content="THIS-PART">`. Redeploy, click **Verify**, then
**Sitemaps → add** `sitemap.xml`. (A Domain property verified by DNS covers `clinic.avvvs.com`
too; then this variable is optional.)

**Bing Webmaster Tools:** bing.com/webmasters → **Add site** → `https://clinic.avvvs.com` → choose
**HTML Meta Tag** → copy the `content` value of `<meta name="msvalidate.01" content="THIS-PART">`.
Redeploy, verify, and submit the sitemap. (You can also import the site from Search Console.)
Bing also powers ChatGPT search and Copilot answers.

**IndexNow:** make a key with `openssl rand -hex 16` (32 characters). After deploying, check that
`https://clinic.avvvs.com/indexnow.txt` shows it. From then on, every treatment, doctor and article
published in the admin is announced to Bing and Yandex within minutes.

---

## 5. Analytics and advertising

Both load only after a visitor allows them in the cookie banner.

| Variable | Required | Value | Set for |
|---|---|---|---|
| `NEXT_PUBLIC_GA_ID` | Optional | GA4 Measurement ID, like `G-XXXXXXXXXX` | Production |
| `NEXT_PUBLIC_META_PIXEL_ID` | Optional | Meta Pixel (dataset) ID, a long number | Production |
| `NEXT_PUBLIC_META_DOMAIN_VERIFICATION` | Optional | Meta domain verification code | Production |

**GA4:** analytics.google.com → **Admin → Create → Property** ("AVVVS Clinic") → **Data streams →
Web** → `https://clinic.avvvs.com` → copy the **Measurement ID**. Then mark `generate_lead` as a
**Key event** (Admin → Events), so bookings count as conversions.

**Meta Pixel:** business.facebook.com → **Events Manager → Connect data sources → Web** → name it
"AVVVS Clinic" → copy the **Pixel/Dataset ID**. Bookings are sent as `Schedule` and `Lead`; calls,
emails and directions as `Contact`.

**Meta domain verification:** Business Settings → **Brand safety → Domains → Add** → `avvvs.com`
(or `clinic.avvvs.com`) → **Meta-tag verification** → copy the `content` value of
`<meta name="facebook-domain-verification" content="THIS-PART">`.

---

## 6. Online consultations (Google Meet and Calendar)

| Variable | Required | Value | Set for |
|---|---|---|---|
| `GOOGLE_CLIENT_ID` | Yes | From the Google Cloud OAuth client | Production, Preview |
| `GOOGLE_CLIENT_SECRET` | Yes | From the same OAuth client | Production, Preview |
| `APP_SECRET` | Yes | A long random phrase (`openssl rand -hex 32`) | Production, Preview |
| `CRON_SECRET` | Yes | A long random phrase (`openssl rand -hex 24`) | Production |
| `GOOGLE_CALENDAR_ID` | No | A calendar's ID, to use one other than the account's main calendar | Production |

**Google Cloud, once, signed in as the clinic's Gmail:**

1. console.cloud.google.com → create a project ("AVVVS Clinic").
2. **APIs & Services → Library** → enable **Google Calendar API**.
3. **OAuth consent screen** → External → app name "AVVVS Clinic", the clinic's email → add the scope
   `.../auth/calendar.events` → **Publish app** (status "In production"). If it is left in "Testing",
   Google ends the connection every 7 days.
4. **Credentials → Create credentials → OAuth client ID → Web application**. Authorised redirect URI:
   `https://clinic.avvvs.com/api/google/callback`. Copy the client ID and secret into Vercel.
5. Redeploy, then in the clinic admin open **Settings → Connect Google Calendar**, sign in as the
   clinic's Gmail and allow access. Google shows a one-time "Google hasn't verified this app"
   screen: choose **Advanced → Go to AVVVS Clinic**. Press **Send a test** to check it.

**APP_SECRET** encrypts the stored Google connection. If it changes, connect Google again.

**CRON_SECRET** lets Vercel's daily job (set in `vercel.json`, 7 am India time) send each patient a
reminder on the morning of their consultation. Vercel sends it automatically once the variable exists.

Then, for each doctor, open **Admin → Doctors → the doctor → Online consultations**: add their email,
hours and (optionally) fee, and switch it on.

## Set automatically (do not add)

`VERCEL_ENV`, `VERCEL_PROJECT_PRODUCTION_URL` and `NODE_ENV` come from Vercel and Next.js. Preview
deployments are kept out of search engines automatically.

## Checklist

- [ ] Domain `clinic.avvvs.com` added in Vercel, `NEXT_PUBLIC_SITE_URL` set
- [ ] SMTP variables set, a test booking received in the clinic inbox
- [ ] Neon and Blob connected, `ADMIN_SETUP_KEY` set, first admin created at `/admin/setup`
- [ ] Search Console and Bing verified, sitemap submitted in both
- [ ] `INDEXNOW_KEY` set and `/indexnow.txt` showing it
- [ ] GA4 and Meta Pixel IDs set; `generate_lead` marked as a key event
- [ ] Google OAuth client created and published; `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `APP_SECRET`, `CRON_SECRET` set
- [ ] Google Calendar connected in Admin → Settings, test sent
- [ ] Online hours set and switched on for each doctor
- [ ] Redeployed after the last change
