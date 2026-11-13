// Kerala Panchakarma and allied therapies offered at the clinic. The first six were named by the
// clinic on 2026-11-08; the rest, and the wording of all of them, are the clinic's own
// (Therapies.docx and its review of the site text, 2026-11-13). Nasya was named by the clinic
// without a description; its line is a plain account of the procedure, for the doctors to confirm.

export interface Therapy {
  slug: string;
  name: string;
  ml: string;
  what: string;
  how: string;
  /** a photograph, when the site has one; therapies without one are listed in text */
  img?: string;
  pos?: string;
  /** clinics that offer it (slugs); built-in therapies take theirs from each clinic's list */
  clinics?: string[];
  /** added in the admin rather than built into the site */
  fromAdmin?: boolean;
}

export const THERAPIES: Therapy[] = [
  {
    slug: 'pizhichil', img: '/photos/abhyanga.jpg', pos: '60% 50%', name: 'Pizhichil', ml: 'പിഴിച്ചിൽ',
    what: 'A Kerala speciality in which warm medicated oil is poured over the body in a continuous stream while therapists massage in rhythm.',
    how: 'Cloths soaked in lukewarm oil are squeezed over the body by two or more therapists working in step.',
  },
  {
    slug: 'shirodhara', img: '/photos/shirodhara.jpg', pos: '28% 50%', name: 'Shirodhara', ml: 'ശിരോധാര',
    what: 'A steady, unbroken stream of warm medicated liquid, usually oil or kashaya, poured gently over the forehead.',
    how: 'You lie still as a gentle, continuous stream flows across your forehead from a vessel suspended above.',
  },
  {
    slug: 'abhyanga', img: '/photos/abhyanga-massage.jpg', pos: '40% 50%', name: 'Abhyanga', ml: 'അഭ്യംഗം',
    what: 'A full-body massage with warm medicated oil chosen for you, the foundation of Ayurvedic body care.',
    how: 'Long, rhythmic strokes are used over the whole body, followed by rest.',
  },
  {
    slug: 'elakizhi', img: '/photos/elakizhi.jpg', pos: '50% 50%', name: 'Elakizhi', ml: 'ഇലക്കിഴി',
    what: 'Poultices of fresh medicinal leaves and other medicines, warmed in oil and pressed over the body.',
    how: 'Linen bundles of chopped leaves are heated in a pan and applied with rhythmic pressure.',
  },
  {
    slug: 'njavarakizhi', img: '/photos/njavara.jpg', pos: '50% 50%', name: 'Njavarakizhi', ml: 'ഞവരക്കിഴി',
    what: 'Poultices of Njavara, a Kerala medicinal rice, cooked in milk and herbal decoction and massaged over the body.',
    how: 'The warm rice bundles are dipped again and again in the milk decoction as the massage goes on.',
  },
  {
    slug: 'udwarthana', img: '/photos/udwarthana.jpg', pos: '60% 50%', name: 'Udwarthana', ml: 'ഉദ്വർത്തനം',
    what: 'A brisk massage using warm medicinal powder, applied in firm, mostly upward strokes.',
    how: 'It is used to exfoliate the skin, improve skin texture and support body care.',
  },
  {
    slug: 'utsadana', name: 'Utsadana', ml: 'ഉത്സാദനം',
    what: 'A therapy in which a warm herbal paste, mixed with medicinal oils or other prescribed liquids, is applied and massaged over the body.',
    how: 'It is used to improve circulation and skin texture, and for body contouring.',
  },
  {
    slug: 'dhanyamla-dhara', name: 'Dhanyamla Dhara', ml: 'ധാന്യാമ്ല ധാര',
    what: 'A treatment in which warm dhanyamla, a fermented herbal liquid, is poured continuously over the body or the affected areas.',
    how: 'It is used to help reduce stiffness, heaviness and discomfort.',
  },
  {
    slug: 'dhanyamla-kizhi', name: 'Dhanyamla Kizhi', ml: 'ധാന്യാമ്ല കിഴി',
    what: 'A treatment in which warm cloth bundles prepared with dhanyamla, a fermented herbal liquid, are gently applied over the body.',
    how: 'The bundles provide warmth and help relieve muscle stiffness and joint discomfort.',
  },
  {
    slug: 'lepana', name: 'Lepana', ml: 'ലേപനം',
    what: 'An external treatment in which a medicinal herbal paste is applied to a specific part of the body.',
    how: 'Depending on the formulation, it is used to help reduce swelling, pain, inflammation or other local skin and body complaints.',
  },
  {
    slug: 'nasya', name: 'Nasya', ml: 'നസ്യം',
    what: 'A Panchakarma procedure in which medicated oil or another herbal preparation is given through the nostrils.',
    how: '',
  },
  {
    slug: 'snehapanam', name: 'Snehapanam', ml: 'സ്നേഹപാനം',
    what: 'The internal administration of medicated ghee or oil, in gradually increasing doses over consecutive mornings.',
    how: 'It promotes internal oleation, prepares the body for Panchakarma therapies and supports the mobilisation of accumulated doshas. The physician selects the ghee or oil for your constitution, condition and treatment.',
  },
  {
    slug: 'kashaya-vasti', name: 'Kashaya Vasti', ml: 'കഷായ വസ്തി',
    what: 'A Panchakarma treatment in which a specially prepared herbal decoction is administered through the rectum.',
    how: 'It is used to help manage conditions associated with Vata imbalance, such as constipation and joint stiffness.',
  },
  {
    slug: 'sneha-vasti', name: 'Sneha Vasti', ml: 'സ്നേഹ വസ്തി',
    what: 'A treatment in which medicated oil or ghee is administered through the rectum.',
    how: 'It is used to nourish the body and help manage Vata-related conditions.',
  },
  {
    slug: 'uttara-vasti', name: 'Uttara Vasti', ml: 'ഉത്തര വസ്തി',
    what: 'A specialised procedure in which prescribed medicated oil or herbal preparations are administered through the urinary or reproductive passage by a qualified physician.',
    how: 'It is used for selected urinary or gynaecological conditions.',
  },
  {
    slug: 'varnya-lepana', name: 'Varnya Lepana', ml: 'വർണ്യ ലേപനം',
    what: 'A herbal paste applied to the face or body.',
    how: 'It is used to improve the skin’s appearance, reduce dullness and promote a healthy, natural glow.',
  },
  {
    slug: 'vethu-kuli', name: 'Vethu Kuli', ml: 'വേതുകുളി',
    what: 'A traditional medicated bath, in which you are bathed with warm, herbal-infused water.',
    how: 'It is given to soothe the body, relieve discomfort and promote overall well-being.',
  },
  {
    slug: 'dhoomapana', name: 'Dhoomapana', ml: 'ധൂമപാനം',
    what: 'A therapy in which medicated herbal smoke is gently inhaled through the nostrils or mouth, in a controlled manner.',
    how: '',
  },
  {
    slug: 'keshadhupana', name: 'Keshadhupana', ml: 'കേശധൂപനം',
    what: 'Medicated hair fumigation, in which the hair and scalp are gently exposed to medicated herbal smoke.',
    how: 'It is used to help maintain scalp hygiene and support the health of the hair and scalp.',
  },
  {
    slug: 'anjana', name: 'Anjana', ml: 'അഞ്ജനം',
    what: 'An eye treatment in which specially prepared herbal medicine is carefully applied to the inner margins of the eyelids.',
    how: 'It is used to cleanse and care for the eyes.',
  },
  {
    slug: 'veshtanam', name: 'Veshtanam', ml: 'വേഷ്ടനം',
    what: 'Abdominal binding: the practice of bandaging the abdomen after childbirth.',
    how: 'It supports weakened abdominal and pelvic floor muscles and promotes postpartum recovery.',
  },
];

/** The six classical therapies the site has photographs of. */
export const PICTURED = THERAPIES.filter((t) => t.img);

export const therapyBySlug = (slug: string) => THERAPIES.find((t) => t.slug === slug);
