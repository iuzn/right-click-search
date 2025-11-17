import type { SearchEngine } from '@/types/search';

/**
 * Default search engines
 */
export const DEFAULT_SEARCH_ENGINES: SearchEngine[] = [
  {
    id: 'youtube-text',
    title: 'Search on YouTube',
    url: 'https://www.youtube.com/results?search_query=%s',
    icon: '🎬',
    iconType: 'emoji',
    enabled: true,
    isDefault: true,
    contexts: ['selection'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'google-image',
    title: 'Search Image on Google',
    url: 'https://www.google.com/searchbyimage?image_url=%s',
    icon: '🖼️',
    iconType: 'emoji',
    enabled: true,
    isDefault: true,
    contexts: ['image'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];
