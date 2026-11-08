import type { QA } from './clinics';
import { CLINIC } from './site';

// The questions people (and answer engines) ask about the clinic. Facts only.
export const HOME_FAQ: QA[] = [
  {
    q: 'Where is AVVVS Ayur Speciality Clinic?',
    a: `On the 3rd floor of Kaloor Central, Annie Hall Road, opposite Kozhikode Railway Station, Kozhikode, Kerala 673002. Phone ${CLINIC.phones.join(' or ')}.`,
  },
  {
    q: 'What does AVVVS Ayur Speciality Clinic treat?',
    a: 'The clinic offers specialised Ayurvedic care for headaches, chronic pain, obesity, lifestyle disorders, male and female infertility, skin and hair conditions, and pregnancy and postnatal care, with personalised treatment plans.',
  },
  {
    q: 'Which Kerala Panchakarma therapies are available?',
    a: 'Pizhichil, Shirodhara, Abhyanga, Elakizhi and Njavarakizhi, with Udwarthana in the obesity programme and specialised treatments for rejuvenation and healthy ageing. The doctor chooses therapies after a consultation.',
  },
  {
    q: 'Who runs the clinic?',
    a: 'AVVVS Ayur Speciality Clinic belongs to Arya Vaidya Vilasini Vaidya Sala (AVVVS), an Ayurveda institution founded in Kozhikode in 1921 that makes more than 300 classical and proprietary Ayurveda formulations.',
  },
  {
    q: 'Does the clinic combine Ayurveda with modern medicine?',
    a: 'Yes, where it helps. The Pain Management Clinic combines Ayurvedic therapies with modern medical care under Dr. Ranjith Kumar (BAMS, MBBS, MD, DA), and the Obesity Management Clinic uses modern body-contouring technologies alongside Udwarthana.',
  },
  {
    q: 'How do I book a consultation?',
    a: `Book online at clinic.avvvs.com/book, choosing the care you need and a preferred day and time; the clinic calls back to confirm. Or call ${CLINIC.phones[0]} or email ${CLINIC.email}.`,
  },
];
