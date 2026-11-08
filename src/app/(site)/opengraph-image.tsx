import { OG_SIZE, ogImage } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'AVVVS Ayur Speciality Clinic, Kozhikode';

export default function Image() {
  return ogImage({ still: 'photos/shirodhara.jpg', kicker: 'AVVVS Ayur Speciality Clinic', title: 'Rediscover health and well-being.' });
}
