// Kerala Panchakarma and allied therapies offered at the clinic (named by the clinic, 2026-11-08).
// Each line says what the therapy is, never what it will do for a reader.

export interface Therapy {
  slug: string;
  name: string;
  ml: string;
  what: string;
  how: string;
}

export const THERAPIES: Therapy[] = [
  {
    slug: 'pizhichil', name: 'Pizhichil', ml: 'പിഴിച്ചിൽ',
    what: 'A Kerala speciality in which warm medicated oil is poured over the body in a continuous stream while therapists massage in rhythm.',
    how: 'Cloths soaked in lukewarm oil are squeezed over the body by two or more therapists working in step.',
  },
  {
    slug: 'shirodhara', name: 'Shirodhara', ml: 'ശിരോധാര',
    what: 'A steady, unbroken stream of warm medicated liquid, usually oil, poured gently over the forehead.',
    how: 'You lie still while the stream sways slowly across the brow from a vessel suspended above.',
  },
  {
    slug: 'abhyanga', name: 'Abhyanga', ml: 'അഭ്യംഗം',
    what: 'A full-body massage with warm herbal oil chosen for you, the foundation of Ayurvedic body care.',
    how: 'Long, rhythmic strokes over the whole body, followed by rest.',
  },
  {
    slug: 'elakizhi', name: 'Elakizhi', ml: 'ഇലക്കിഴി',
    what: 'Poultices of fresh medicinal leaves, warmed in oil and pressed over the body.',
    how: 'Linen bundles of chopped leaves are heated in a pan and applied with rhythmic pressure.',
  },
  {
    slug: 'njavarakizhi', name: 'Njavarakizhi', ml: 'ഞവരക്കിഴി',
    what: 'Bundles of Njavara, a Kerala medicinal rice, cooked in milk and herbal decoction and massaged over the body.',
    how: 'The warm rice bundles are dipped again and again in the milk decoction as the massage goes on.',
  },
  {
    slug: 'udwarthana', name: 'Udwarthana', ml: 'ഉദ്വർത്തനം',
    what: 'A brisk massage with dry herbal powders, used in the clinic’s obesity management programme.',
    how: 'Firm strokes, mostly upward, with warm powder in place of oil.',
  },
];

export const therapyBySlug = (slug: string) => THERAPIES.find((t) => t.slug === slug);
