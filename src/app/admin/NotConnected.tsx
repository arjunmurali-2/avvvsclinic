/** Shown until Neon and Blob are added to the Vercel project. */
export function NotConnected() {
  return (
    <main className="ad-gate">
      <div className="ad-gate-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/avvvs-since-1921.svg" alt="AVVVS" width={181} height={40} />
        <h1>Connect the database</h1>
        <p>The clinic admin stores treatments and articles in Neon Postgres and images in Vercel Blob. In the Vercel project, open Storage and add:</p>
        <ol className="ad-steps">
          <li><b>Neon</b> (Postgres), which sets <code>DATABASE_URL</code>. The avvvs.com database can be shared: the clinic’s tables are all named <code>clinic_…</code>.</li>
          <li><b>Blob</b>, which sets <code>BLOB_READ_WRITE_TOKEN</code></li>
          <li>an environment variable <code>ADMIN_SETUP_KEY</code>: any long random phrase, used once to create the first admin</li>
        </ol>
        <p>Then redeploy and come back here.</p>
      </div>
    </main>
  );
}
