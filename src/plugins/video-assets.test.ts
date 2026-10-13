import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import { FIXTURE_ROOT, FIXTURE_VIDEO, createVideoFixture } from './video-fixture.ts';
import {
  collectVideoAssetPaths,
  extractVideoReferences,
  isExternalAsset,
  resolveVideoReference,
  videoAssetOutputPath,
  videoAssetUrl,
} from './video-assets.ts';
import { viteVideoAssets } from './vite-video-assets.ts';

before(createVideoFixture);

test('提取文章里的视频与封面图引用', () => {
  const source = [
    '::video[a.mp4]',
    '::video[b.webm]{poster=cover.png, loop}',
    '正文里的 ::video[c.mp4] 不生效',
  ].join('\n\n');

  assert.deepEqual(extractVideoReferences(source), ['a.mp4', 'b.webm', 'cover.png']);
});

test('围栏代码块里的示例不算引用', () => {
  const source = ['```markdown', '::video[示例.mp4]', '```', '', '::video[real.mp4]'].join('\n');

  assert.deepEqual(extractVideoReferences(source), ['real.mp4']);
});

test('外部地址与站点绝对路径不参与打包', () => {
  assert.equal(isExternalAsset('https://cdn.example.com/a.mp4'), true);
  assert.equal(isExternalAsset('//cdn.example.com/a.mp4'), true);
  assert.equal(isExternalAsset('/static/a.mp4'), true);
  assert.equal(isExternalAsset('clips/a.mp4'), false);
  assert.equal(resolveVideoReference('https://cdn.example.com/a.mp4', '/repo'), null);
});

test('访问地址与落盘位置都是仓库相对路径', () => {
  assert.equal(videoAssetUrl(FIXTURE_VIDEO, '/GUET_428', FIXTURE_ROOT), '/GUET_428/src/content/blog/%E7%A4%BA%E4%BE%8B/clip.mp4');
  assert.equal(videoAssetOutputPath(FIXTURE_VIDEO, FIXTURE_ROOT), 'src/content/blog/示例/clip.mp4');
});

test('扫描文章目录能收集到引用的视频', () => {
  assert.deepEqual(collectVideoAssetPaths(FIXTURE_ROOT), [FIXTURE_VIDEO]);
});

test('构建阶段把视频原样写进产物', () => {
  const emitted: Array<{ fileName: string }> = [];
  const context = {
    emitFile: (file: { fileName: string }) => {
      emitted.push(file);
      return file.fileName;
    },
  };

  viteVideoAssets({ rootDir: FIXTURE_ROOT }).buildStart.call(context);

  assert.deepEqual(emitted.map((file) => file.fileName), ['src/content/blog/示例/clip.mp4']);
});
