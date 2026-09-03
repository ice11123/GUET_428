import { getCollection } from 'astro:content';
import { resolveDirs } from './utils';

export interface SidebarPost {
  title: string;
  slug: string;
  pubDate: Date;
  dir1: string;
  dir2: string;
  tags: string[];
}

export interface SearchPost {
  title: string;
  description: string;
  dir1: string;
  dir2: string;
  tags: string;
  slug: string;
}

export async function getSidebarData(): Promise<SidebarPost[]> {
  const allPosts = await getCollection('blog');
  return allPosts.map(post => {
    const dirs = resolveDirs(post);
    return {
      title: post.data.title,
      slug: post.id,
      pubDate: post.data.pubDate,
      dir1: dirs.dir1,
      dir2: dirs.dir2,
      tags: post.data.tags || [],
    };
  });
}

export async function getSearchData(): Promise<SearchPost[]> {
  const allPosts = await getCollection('blog');
  return allPosts.map(post => {
    const dirs = resolveDirs(post);
    return {
      title: post.data.title,
      description: post.data.description.replace(/<[^>]+>/g, ''),
      dir1: dirs.dir1,
      dir2: dirs.dir2,
      tags: (post.data.tags || []).join(', '),
      slug: post.id,
    };
  });
}
