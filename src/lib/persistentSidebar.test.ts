import test from 'node:test';
import assert from 'node:assert/strict';
import type { SidebarPost } from './blogData.ts';
import {
  buildArticleDirectory,
  buildTagDirectory,
  computeSidebarStats,
} from './persistentSidebar.ts';

const posts: SidebarPost[] = [
  { title: 'A', slug: 'a', pubDate: new Date('2026-08-03'), dir1: '电源组', dir2: '变换器', tags: ['电源', '前端'] },
  { title: 'B', slug: 'b', pubDate: new Date('2026-08-01'), dir1: '电源组', dir2: '变换器', tags: ['电源'] },
  { title: 'C', slug: 'c', pubDate: new Date('2026-08-02'), dir1: '飞控组', dir2: '', tags: ['飞控'] },
  { title: 'D', slug: 'd', pubDate: new Date('2026-07-01'), dir1: '其他', dir2: '', tags: [] },
];

test('侧栏统计按一级分类和去重标签计算', () => {
  assert.deepEqual(computeSidebarStats(posts), {
    totalArticles: 4,
    totalCategories: 4,
    totalTags: 3,
  });
});

test('文章目录固定四组顺序并保留空分组，组内按日期正序', () => {
  const directory = buildArticleDirectory(posts);

  assert.deepEqual(directory.map(({ name, total }) => ({ name, total })), [
    { name: '电源组', total: 2 },
    { name: '飞控组', total: 1 },
    { name: '小车组', total: 0 },
    { name: '其他', total: 1 },
  ]);
  assert.deepEqual(directory[0].directPosts, []);
  assert.deepEqual(directory[0].subdirectories.map(({ name, posts }) => ({
    name,
    slugs: posts.map((post) => post.slug),
  })), [
    { name: '变换器', slugs: ['b', 'a'] },
  ]);
  assert.deepEqual(directory[1].directPosts.map((post) => post.slug), ['c']);
  assert.deepEqual(directory[2].directPosts, []);
  assert.deepEqual(directory[3].directPosts.map((post) => post.slug), ['d']);
});

test('标签目录按文章数倒序并对同数量标签稳定排序', () => {
  assert.deepEqual(buildTagDirectory(posts), [
    { name: '电源', count: 2 },
    { name: '飞控', count: 1 },
    { name: '前端', count: 1 },
  ]);
});

test('目录编号优先且未编号文章仍旧文在前、新文在后', () => {
  const sequence: SidebarPost[] = [
    { ...posts[0], title: '02｜第二篇', slug: '02-second', pubDate: new Date('2026-08-01') },
    { ...posts[0], title: '01｜第一篇', slug: '01-first', pubDate: new Date('2026-08-03') },
  ];
  assert.deepEqual(buildArticleDirectory(sequence)[0].subdirectories[0].posts.map(post => post.slug), ['01-first', '02-second']);
  assert.deepEqual(buildArticleDirectory(posts)[0].subdirectories[0].posts.map(post => post.slug), ['b', 'a']);
});
