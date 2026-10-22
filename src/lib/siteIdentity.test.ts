import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcRoot = fileURLToPath(new URL('..', import.meta.url));
const textExtensions = new Set(['.astro', '.ts', '.js', '.json', '.md', '.mdx', '.svg']);
const schoolNames = /桂林电子科技大学|桂林電子科技大學|桂林电子科大|桂电|桂電/;
const read = (path: string) => readFileSync(join(srcRoot, path), 'utf8');

test('所有站点文本来源均不包含中文校名，保留 GUET 标识', () => {
  const violations: string[] = [];
  function inspect(directory: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) inspect(path);
      else if (!entry.name.includes('.test.') && textExtensions.has(extname(path)) && schoolNames.test(readFileSync(path, 'utf8'))) violations.push(path);
    }
  }
  inspect(srcRoot);
  assert.deepEqual(violations, []);
  assert.match(read('pages/index.astro'), /GUET · ELECTRICAL ENGINEERING LAB/);
  assert.match(read('consts.ts'), /ice11123\/GUET_428/);
  assert.match(read('consts.ts'), /SITE_TITLE = `\$\{LAB_NAME\}-\$\{PROGRAM_NAME\}`/);
});

test('首页、关于页和页脚不再引用学校字段或学校隶属关系', () => {
  for (const path of ['consts.ts', 'pages/index.astro', 'pages/about.astro', 'components/layout/Footer.astro']) {
    assert.doesNotMatch(read(path), /INSTITUTION_NAME/);
  }
  assert.doesNotMatch(read('pages/about.astro'), /parentOrganization|CollegeOrUniversity/);
  assert.match(read('pages/index.astro'), /<p>\{PROGRAM_NAME\}<\/p>/);
});
