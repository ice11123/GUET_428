// 为 ::video 测试准备最小目录结构，避免依赖仓库里的真实文章资源。
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const FIXTURE_ROOT = fileURLToPath(new URL('../../tmp/video-fixture/', import.meta.url));
export const FIXTURE_ARTICLE = path.join(FIXTURE_ROOT, 'src', 'content', 'blog', '示例', 'article.md');
export const FIXTURE_VIDEO = path.join(FIXTURE_ROOT, 'src', 'content', 'blog', '示例', 'clip.mp4');
export const FIXTURE_POSTER = path.join(FIXTURE_ROOT, 'src', 'content', 'blog', '示例', 'cover.png');

export function createVideoFixture(): void {
  mkdirSync(path.dirname(FIXTURE_ARTICLE), { recursive: true });
  writeFileSync(FIXTURE_VIDEO, Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70]));
  writeFileSync(FIXTURE_POSTER, Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  writeFileSync(FIXTURE_ARTICLE, '# 示例\n\n::video[clip.mp4]\n');
}
