import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { countArticleTags, groupDiscoveryTags, selectDiscoveryTags, matchesTagFilter, COMMON_TAG_LIMIT } from './tagDiscovery.ts';

test('按实际文章计数、去除篇内重复，并保留标签原名与安全键名', () => {
  const tags = countArticleTags([{ data: { tags: ['Codex', 'Codex', '__proto__', ' 原名 '] } }, { data: { tags: ['Codex', ''] } }, { data: {} }]);
  assert.equal(tags.find((tag) => tag.name === 'Codex')?.count, 2);
  assert.equal(tags.find((tag) => tag.name === '__proto__')?.count, 1);
  assert.ok(tags.some((tag) => tag.name === ' 原名 '));
  assert.equal(tags.length, 3);
  assert.deepEqual(countArticleTags([]), []);
});

test('常用区以篇数降序为准且上限明确，其余标签完整无重复', () => {
  const source = Array.from({ length: 40 }, (_, index) => ({ name: `标签${index}`, count: index + 1 }));
  const snapshot = structuredClone(source);
  const { common, more } = groupDiscoveryTags(source);
  assert.equal(common.length, COMMON_TAG_LIMIT);
  assert.equal(common[0].count, 40);
  assert.ok(common.every((tag) => tag.count > 1));
  assert.equal(new Set([...common, ...more].map((tag) => tag.name)).size, source.length);
  assert.equal(common.length + more.length, source.length);
  assert.deepEqual(source, snapshot);
  assert.equal(groupDiscoveryTags([{ name: '孤立主题', count: 1 }]).common.length, 0);
  assert.deepEqual(groupDiscoveryTags([]), { common: [], more: [] });
});

test('搜索覆盖折叠长尾，清空恢复数量限制，支持中文/全角/大小写/空结果', () => {
  const tags = [{ name: 'Codex', count: 5 }, { name: '高等数学', count: 2 }, { name: '长尾 PID', count: 1 }];
  assert.deepEqual(selectDiscoveryTags(tags, '', 1), [tags[0]]);
  assert.deepEqual(selectDiscoveryTags(tags, 'PID', 1), [tags[2]]);
  assert.deepEqual(selectDiscoveryTags(tags, ' 高等 ', 0), [tags[1]]);
  assert.deepEqual(selectDiscoveryTags(tags, '不存在', 1), []);
  assert.deepEqual(selectDiscoveryTags(tags, '   ', 1), [tags[0]]);
  assert.deepEqual(selectDiscoveryTags(tags, '', -1), []);
  assert.ok(matchesTagFilter('ＣＯＤＥＸ', 'codex'));
});

const source = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
test('标签聚合页没有构建假日期，详情保留文章布局与真实返回路径', () => {
  for (const path of ['pages/blog/tags.astro', 'pages/blog/tag/[tag].astro']) {
    const page = source(path);
    assert.doesNotMatch(page, /new Date\(/);
    assert.match(page, /showDate=\{false\}/);
    assert.match(page, /hidePageHeader=\{true\}/);
  }
  assert.match(source('pages/blog/tag/[tag].astro'), /<BlogList posts=\{filtered\} sort="time"/);
  assert.match(source('pages/blog/tag/[tag].astro'), /withBase\('\/blog\/tags\/'\)/);
  assert.match(source('components/blog/TagDiscoveryLink.astro'), /encodeURIComponent\(tag\.name\)/);
  assert.match(source('layouts/PublicContentLayout.astro'), /showDate && pubDate &&/);
});

test('标签无脚本可展开全部，脚本清理监听并保护输入法，不引入持续动画', () => {
  const page = source('pages/blog/tags.astro');
  const script = source('scripts/tag-discovery.ts');
  assert.match(page, /<details[^>]*data-more-group/);
  assert.match(page, /more\.map\(\(tag\) => <TagDiscoveryLink/);
  assert.match(page, /class="discovery-expand-label">展开探索 ↓/);
  assert.match(page, /class="discovery-collapse-label">收起标签 ↑/);
  assert.match(page, /\.discovery-collapse-label \{ display: none; \}/);
  assert.match(page, /\.discovery-more\[open\] \.discovery-expand-label \{ display: none; \}/);
  assert.match(page, /\.discovery-more\[open\] \.discovery-collapse-label \{ display: inline; \}/);
  assert.match(script, /astro:before-swap/);
  assert.match(script, /controller\.abort\(\)/);
  assert.match(script, /compositionstart/);
  assert.match(script, /compositionend/);
  assert.doesNotMatch(script, /requestAnimationFrame|setInterval|\.animate\(/);
});

test('实验室作品素材、分组入口与近期文章保持独立交互', () => {
  const showcase = source('components/home/LabGroupShowcase.astro');
  for (const name of ['电源组.png', '飞控组.png', '小车组.png']) assert.ok(showcase.includes(name));
  assert.match(showcase, /group-card-link/);
  assert.match(showcase, /group-recent/);
  assert.match(showcase, /prefers-reduced-motion/);
});
