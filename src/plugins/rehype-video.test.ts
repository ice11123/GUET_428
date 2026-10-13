import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import { FIXTURE_ARTICLE, FIXTURE_ROOT, createVideoFixture } from './video-fixture.ts';
import { rehypeVideo } from './rehype-video.ts';

before(createVideoFixture);

const ARTICLE_URL = '/GUET_428/src/content/blog/%E7%A4%BA%E4%BE%8B';

function run(value: string): any {
  const tree = {
    type: 'root',
    children: [{ type: 'element', tagName: 'p', properties: {}, children: [{ type: 'text', value }] }],
  };
  rehypeVideo({ base: '/GUET_428', rootDir: FIXTURE_ROOT })(tree, { path: FIXTURE_ARTICLE });
  return tree;
}

test('把独占段落的 ::video 指令解析为资源地址', () => {
  const [node] = run('::video[clip.mp4]{loop, muted}').children;

  assert.equal(node.tagName, 'video');
  assert.equal(node.properties.controls, true);
  assert.equal(node.properties.playsinline, true);
  assert.equal(node.properties.preload, 'metadata');
  assert.equal(node.properties.loop, true);
  assert.equal(node.properties.muted, true);
  assert.equal(node.properties.src, `${ARTICLE_URL}/clip.mp4`);
});

test('段中的 ::video 文本保持原样', () => {
  const [node] = run('写法是 ::video[clip.mp4] 这样').children;

  assert.equal(node.tagName, 'p');
  assert.equal(node.children[0].value, '写法是 ::video[clip.mp4] 这样');
});

test('外部地址原样输出', () => {
  const [node] = run('::video[https://cdn.example.com/clip.mp4]').children;

  assert.equal(node.tagName, 'video');
  assert.equal(node.properties.src, 'https://cdn.example.com/clip.mp4');
});

test('视频文件不存在时构建失败', () => {
  assert.throws(() => run('::video[missing.mp4]'), /视频文件不存在/);
});

test('非视频扩展名被拒绝', () => {
  assert.throws(() => run('::video[cover.webp]'), /视频扩展名不受支持/);
});

test('封面图走同一套地址规则', () => {
  const [node] = run('::video[clip.mp4]{poster=cover.png}').children;

  assert.equal(node.tagName, 'video');
  assert.equal(node.properties.poster, `${ARTICLE_URL}/cover.png`);
});

test('遗漏数组注册形式时立刻报错', () => {
  assert.throws(() => rehypeVideo({ use() {} } as any), /必须以 \[rehypeVideo, \{ base \}\] 形式注册/);
});
