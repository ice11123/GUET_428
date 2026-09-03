import type { CollectionEntry } from 'astro:content';
import { SITE_START_DATE } from '../consts';
import { countWords } from './utils';

export interface SiteStats {
  totalArticles: number;
  totalTags: number;
  totalCategories: number;
  daysSinceLaunch: number;
  totalWords: number;
  monthLabels: string[];
  monthCounts: number[];
}

export function computeSiteStats(allPosts: CollectionEntry<'blog'>[]): SiteStats {
  const totalArticles = allPosts.length;

  const allTags = new Set<string>();
  const allCategories = new Set<string>();
  for (const post of allPosts) {
    for (const tag of post.data.tags || []) {
      allTags.add(tag);
    }
    const segs = post.id.split('/');
    if (segs.length > 0) allCategories.add(segs[0]);
  }
  const totalTags = allTags.size;
  const totalCategories = allCategories.size;

  const daysSinceLaunch = Math.floor((Date.now() - SITE_START_DATE.getTime()) / 86400000);

  let totalWords = 0;
  for (const post of allPosts) {
    totalWords += countWords(post.body || '');
  }

  const monthMap = new Map<string, number>();
  for (const post of allPosts) {
    const d = post.data.pubDate;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthMap.set(key, (monthMap.get(key) || 0) + 1);
  }
  const sortedMonths = [...monthMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const monthLabels = sortedMonths.map(([k]) => `${parseInt(k.split('-')[1]!, 10)}月`);
  const monthCounts = sortedMonths.map(([, v]) => v);

  return { totalArticles, totalTags, totalCategories, daysSinceLaunch, totalWords, monthLabels, monthCounts };
}
