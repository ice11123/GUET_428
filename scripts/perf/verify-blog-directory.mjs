import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [url, outputRoot = 'artifacts/blog-directory', playwrightModule = 'playwright'] = process.argv.slice(2);
if (!url) throw new Error('用法：node verify-blog-directory.mjs <url> [output-root] [playwright-module]');
const moduleSpecifier = playwrightModule === 'playwright'
  ? playwrightModule
  : pathToFileURL(resolve(playwrightModule)).href;
const { chromium } = await import(moduleSpecifier);

const output = resolve(outputRoot);
await mkdir(dirname(`${output}-desktop-light.png`), { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = [];

try {
  for (const target of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ]) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: target, deviceScaleFactor: 1 });
      await context.addInitScript((value) => localStorage.setItem('guet-428-theme', value), theme);
      const page = await context.newPage();
      const consoleErrors = [];
      page.on('console', (message) => message.type() === 'error' && consoleErrors.push(message.text()));
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.locator('.directory-group-art img').evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
      const metrics = await page.evaluate(() => ({
        title: document.querySelector('#blog-directory-title')?.textContent?.trim(),
        groupCount: document.querySelectorAll('.directory-section').length,
        groupArtCount: document.querySelectorAll('.directory-group-art img').length,
        levelOneCount: [...document.querySelectorAll('.directory-level-label')].filter((node) => node.textContent?.includes('一级分组')).length,
        levelTwoCount: [...document.querySelectorAll('.directory-subsection-label')].filter((node) => node.textContent?.includes('二级专题')).length,
        postRowCount: document.querySelectorAll('.directory-post').length,
        total: Number(document.querySelector('.blog-directory-total strong')?.textContent ?? -1),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        theme: document.documentElement.dataset.theme,
      }));

      if (metrics.title !== '文章目录') throw new Error(`${target.name}/${theme}: 缺少文章目录标题`);
      if (metrics.groupCount !== 4 || metrics.levelOneCount !== 4) throw new Error(`${target.name}/${theme}: 一级分组数量错误`);
      if (metrics.groupArtCount !== 3) throw new Error(`${target.name}/${theme}: 三组素材未完整加载`);
      if (metrics.levelTwoCount < 3) throw new Error(`${target.name}/${theme}: 二级专题层级缺失`);
      if (metrics.postRowCount !== metrics.total) throw new Error(`${target.name}/${theme}: 文章统计与列表不一致`);
      if (metrics.overflow > 1) throw new Error(`${target.name}/${theme}: 页面横向溢出 ${metrics.overflow}px`);
      if (metrics.theme !== theme) throw new Error(`${target.name}/${theme}: 主题初始化错误`);
      if (consoleErrors.length > 0) throw new Error(`${target.name}/${theme}: console errors: ${consoleErrors.join(' | ')}`);

      await page.screenshot({ path: `${output}-${target.name}-${theme}.png`, fullPage: true });
      results.push({ target: target.name, theme, ...metrics });
      await context.close();
    }
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify(results, null, 2));
