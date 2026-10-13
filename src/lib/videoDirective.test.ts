import test from 'node:test';
import assert from 'node:assert/strict';
import { parseVideoDirective, renderVideoElement, videoSourcePath } from './videoDirective.ts';

test('解析 ::video 的基础路径', () => {
  const directive = parseVideoDirective('::video[vid1.mp4]');
  assert.equal(directive.src, 'vid1.mp4');
  assert.equal(directive.loop, undefined);
  assert.equal(directive.preload, undefined);
});

test('解析 ::video 的花括号属性列表', () => {
  const directive = parseVideoDirective(
    '::video[clips/a.mp4]{poster=封面.webp, loop, muted, class="hero-video", width=1280, height=720, preload=none}',
  );
  assert.equal(directive.src, 'clips/a.mp4');
  assert.equal(directive.poster, '封面.webp');
  assert.equal(directive.loop, true);
  assert.equal(directive.muted, true);
  assert.equal(directive.className, 'hero-video');
  assert.equal(directive.width, '1280');
  assert.equal(directive.height, '720');
  assert.equal(directive.preload, 'none');
});

test('拒绝非法 ::video 指令', () => {
  assert.throws(() => parseVideoDirective('::video[]'), /格式应为/);
  assert.throws(() => parseVideoDirective('::video[ ]'), /缺少视频文件路径/);
  assert.throws(() => parseVideoDirective('::video[a.mp4]{autoply}'), /未知属性 autoply/);
  assert.throws(() => parseVideoDirective('::video[a.mp4]{width=wide}'), /必须是正整数/);
  assert.throws(() => parseVideoDirective('::video[a.mp4]{preload=fast}'), /preload/);
});

test('渲染 <video> 时保留默认播放控制', () => {
  const directive = parseVideoDirective('::video[vid1.mp4]{loop, muted, poster=cover.webp}');
  const html = renderVideoElement(directive, (reference) => `/base/${reference}`);
  assert.equal(
    html,
    '<video controls playsinline preload="metadata" loop muted poster="/base/cover.webp" src="/base/vid1.mp4"></video>',
  );
});

test('渲染 <video> 时转义属性值', () => {
  const directive = parseVideoDirective('::video[a.mp4]{title="<b>标题</b>"}');
  const html = renderVideoElement(directive, (reference) => reference);
  assert.match(html, /title="&lt;b&gt;标题&lt;\/b&gt;"/);
});

test('把相对引用解析为源文件路径', () => {
  assert.equal(
    videoSourcePath('vid1.mp4', 'src/content/blog/飞控组/drone-showcase'),
    '/src/content/blog/%E9%A3%9E%E6%8E%A7%E7%BB%84/drone-showcase/vid1.mp4',
  );
  assert.equal(videoSourcePath('https://cdn.example.com/a.mp4', 'src'), null);
  assert.equal(videoSourcePath('/static/a.mp4', 'src'), null);
});
