import type { QA } from './clinics';
import { CLINIC } from './site';

// The questions people (and answer engines) ask about the clinic. Facts only.
export const HOME_FAQ: QA[] = [
  {
    q: 'Where is AVVVS Ayur Speciality Clinic?',
    a: `On the 3rd floor of Kaloor Central, Annie Hall Road, opposite Kozhikode Railway Station, Kozhikode (Calicut), Kerala 673002. Phone ${CLINIC.phones.join(' or ')}.`,
  },
  {
    q: 'Where can I get Ayurvedic treatment in Calicut (Kozhikode)?',
    a: 'AVVVS Ayur Speciality Clinic offers Ayurvedic consultations, speciality clinics and Kerala Panchakarma therapies in Kozhikode (Calicut), directly opposite Kozhikode Railway Station on Annie Hall Road. The clinic is part of Arya Vaidya Vilasini Vaidya Sala, an Ayurveda institution based in Kozhikode since 1921.',
  },
  {
    q: 'What does AVVVS Ayur Speciality Clinic treat?',
    a: 'The clinic offers specialised Ayurvedic care for headaches, chronic pain, obesity and lifestyle disorders, male and female infertility, skin and hair conditions, and pregnancy and postnatal care, with personalised treatment plans.',
  },
  {
    q: 'Which Kerala Panchakarma therapies are available?',
    a: 'Abhyanga, Podikizhi, Elakizhi, Njavarakizhi, Shirodhara, Pizhichil and Udwarthana, with specialised treatments for rejuvenation and healthy ageing. The doctor chooses the appropriate therapies after a consultation.',
  },
  {
    q: 'Who runs the clinic?',
    a: 'AVVVS Ayur Speciality Clinic belongs to Arya Vaidya Vilasini Vaidya Sala (AVVVS), an Ayurveda institution founded in Kozhikode in 1921 that makes more than 300 classical and proprietary Ayurveda formulations.',
  },
  {
    q: 'Does the clinic combine Ayurveda with modern medicine?',
    a: 'Yes, where it helps. The Pain Management Clinic combines Ayurvedic therapies with modern medical care under Dr. Ranjith Kumar (BAMS, MBBS, DA, MD), and the Obesity and Lifestyle Management Clinic uses modern body-contouring technologies like cryolipolysis alongside Udwarthana.',
  },
  {
    q: 'Can I consult a doctor online?',
    a: 'Yes. Book an online consultation at clinic.avvvs.com/consult: choose a doctor and a free time, and a Google Meet video link is emailed to you at once. Online consultations are not for emergencies.',
  },
  {
    q: 'How do I book a consultation?',
    a: `Book online at clinic.avvvs.com/book, choosing the care you need and a preferred day and time; the clinic calls back to confirm. Or call ${CLINIC.phones[0]} or email ${CLINIC.email}.`,
  },
];
