import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compareDirectoryPostMetadata } from './postOrdering.ts';
const source = (path: string) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('实验室同步保留四组首页、蓝色主题并排除个人展示', () => {
  const home = source('pages/index.astro');
  assert.match(home, /sidebarMode="hidden"/);
  assert.match(home, /<LabGroupShowcase/);
  assert.doesNotMatch(home, /<RecentPosts|<TopicAtlas|<SoftwareShowcase/);
  assert.match(source('styles/themes/light-blue.css'), /--background: #eef6ff/);
  assert.doesNotMatch(source('components/layout/PersistentSidebar.astro'), /sidebar-tab-profile|SocialLinks/);
  assert.match(source('layouts/BlogPost.astro'), /post-author-name/);
  assert.doesNotMatch(source('layouts/BlogPost.astro'), /PERSONAL_BLOG_URL|gaoshu-handwritten/);
});

test('目录、系列导航采用同一编号规则，非编号文章按时间正序', () => {
  assert.ok(compareDirectoryPostMetadata('01｜第一篇', new Date('2026-10-10'), '02｜第二篇', new Date('2026-10-01')) < 0);
  assert.ok(compareDirectoryPostMetadata('旧文', new Date('2026-10-01'), '新文', new Date('2026-10-10')) < 0);
  assert.match(source('components/blog/BlogList.astro'), /compareDirectoryPostMetadata/);
  assert.match(source('lib/persistentSidebar.ts'), /compareDirectoryPostMetadata/);
  assert.match(source('lib/seriesNavigation.ts'), /compareDirectoryPostMetadata/);
});

test('同步后的阅读、搜索与标签交互具备渐进增强边界', () => {
  assert.match(source('scripts/article-images.ts'), /import\('\.\/image-viewer'\)/);
  assert.match(source('scripts/toc.ts'), /readingProgress\(window\.scrollY/);
  assert.match(source('scripts/search.ts'), /compositionstart/);
  assert.match(source('scripts/search.ts'), /data-search-retry/);
  assert.match(source('components/blog/SearchModal.astro'), /data-search-index/);
  assert.doesNotMatch(source('components/blog/SearchModal.astro'), /__SEARCH_DATA__/);
  assert.match(source('components/layout/PersistentSidebar.astro'), /data-tag-filter/);
  assert.match(source('styles/persistent-sidebar.scss'), /repeat\(2, minmax\(0, 1fr\)\)/);
});
