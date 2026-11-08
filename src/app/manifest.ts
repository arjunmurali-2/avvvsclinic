import type { MetadataRoute } from 'next';
import { CLINIC } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: CLINIC.name, short_name: CLINIC.short, description: CLINIC.description, start_url: '/', display: 'browser',
    background_color: '#F4EFE5', theme_color: '#F4EFE5',
    icons: [{ src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' }, { src: '/apple-icon', type: 'image/png', sizes: '180x180' }],
  };
}
