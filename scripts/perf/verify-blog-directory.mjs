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
        recentCount: document.querySelectorAll('.directory-recent-item').length,
        groupPostTotal: [...document.querySelectorAll('.directory-group-count strong')].reduce((total, node) => total + Number(node.textContent ?? 0), 0),
        total: Number(document.querySelector('.blog-directory-total strong')?.textContent ?? -1),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        theme: document.documentElement.dataset.theme,
      }));

      if (metrics.title !== '文章目录') throw new Error(`${target.name}/${theme}: 缺少文章目录标题`);
      if (metrics.groupCount !== 4 || metrics.levelOneCount !== 4) throw new Error(`${target.name}/${theme}: 一级分组数量错误`);
      if (metrics.groupArtCount !== 3) throw new Error(`${target.name}/${theme}: 三组素材未完整加载`);
      if (metrics.levelTwoCount !== 0) throw new Error(`${target.name}/${theme}: 总目录不应展开二级专题`);
      if (metrics.recentCount !== 4) throw new Error(`${target.name}/${theme}: 近期文章数量错误`);
      if (metrics.groupPostTotal !== metrics.total) throw new Error(`${target.name}/${theme}: 分组文章统计与总数不一致`);
      if (metrics.overflow > 1) throw new Error(`${target.name}/${theme}: 页面横向溢出 ${metrics.overflow}px`);
      if (metrics.theme !== theme) throw new Error(`${target.name}/${theme}: 主题初始化错误`);
      if (consoleErrors.length > 0) throw new Error(`${target.name}/${theme}: console errors: ${consoleErrors.join(' | ')}`);

      if (target.name === 'desktop') {
        await page.locator('.directory-group-link').first().hover();
        await page.waitForTimeout(220);
        const groupHoverTransform = await page.locator('.directory-section').first().evaluate((node) => getComputedStyle(node).transform);
        if (groupHoverTransform === 'none') throw new Error(`${target.name}/${theme}: 一级分组悬停没有伪 3D 反馈`);
        await page.screenshot({ path: `${output}-${target.name}-${theme}-group-hover.png`, fullPage: true });

        await page.locator('.directory-recent-item a').first().hover();
        await page.waitForTimeout(220);
        const separatedFeedback = await page.locator('.directory-recent-item a').first().evaluate((link) => ({
          groupTransform: getComputedStyle(link.closest('.directory-section')).transform,
          recentBackground: getComputedStyle(link).backgroundColor,
        }));
        if (separatedFeedback.groupTransform !== 'none') throw new Error(`${target.name}/${theme}: 近期文章悬停错误触发父分组位移`);
        if (separatedFeedback.recentBackground === 'rgba(0, 0, 0, 0)') throw new Error(`${target.name}/${theme}: 近期文章缺少独立悬停反馈`);
      }

      await page.screenshot({ path: `${output}-${target.name}-${theme}.png`, fullPage: true });
      results.push({ target: target.name, theme, ...metrics });

      await page.goto(new URL(`category/${encodeURIComponent('小车组')}/`, url).href, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.locator('.directory-group-art img').evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
      const categoryMetrics = await page.evaluate(() => ({
        groupCount: document.querySelectorAll('.directory-section').length,
        levelOneCount: document.querySelectorAll('.directory-level-label').length,
        levelTwoCount: document.querySelectorAll('.directory-subsection-label').length,
        postRowCount: document.querySelectorAll('.directory-post').length,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }));
      if (categoryMetrics.groupCount !== 1 || categoryMetrics.levelOneCount !== 1) throw new Error(`${target.name}/${theme}: 分类页一级分组错误`);
      if (categoryMetrics.levelTwoCount !== 2 || categoryMetrics.postRowCount !== 6) throw new Error(`${target.name}/${theme}: 分类页完整目录错误`);
      if (categoryMetrics.overflow > 1) throw new Error(`${target.name}/${theme}: 分类页横向溢出 ${categoryMetrics.overflow}px`);
      if (theme === 'light') await page.screenshot({ path: `${output}-${target.name}-category.png`, fullPage: true });

      await page.goto(new URL('../', url).href, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.locator('.group-entry').first().scrollIntoViewIfNeeded();
      const homeMetrics = await page.evaluate(() => {
        const links = [...document.querySelectorAll('.group-recent a')];
        const firstCard = document.querySelector('.group-entry');
        const firstCardRect = firstCard?.getBoundingClientRect();
        const artPointTarget = firstCardRect
          ? document.elementFromPoint(firstCardRect.right - 32, firstCardRect.top + firstCardRect.height / 2)?.closest('.group-card-link')
          : null;
        return {
          recentLinkCount: links.length,
          directArticleCount: links.filter((link) => !link.getAttribute('href')?.includes('/category/')).length,
          groupCardLinkCount: document.querySelectorAll('.group-card-link').length,
          groupHintCount: document.querySelectorAll('.group-enter').length,
          cardArtPointClickable: Boolean(artPointTarget),
        };
      });
      if (homeMetrics.recentLinkCount < 2 || homeMetrics.directArticleCount !== homeMetrics.recentLinkCount) throw new Error(`${target.name}/${theme}: 首页近期文章未全部直达文章`);
      if (homeMetrics.groupCardLinkCount !== 4 || homeMetrics.groupHintCount !== 4) throw new Error(`${target.name}/${theme}: 首页整卡分组入口数量错误`);
      if (target.name === 'desktop' && !homeMetrics.cardArtPointClickable) throw new Error(`${target.name}/${theme}: 分组图片与留白区域不可点击`);

      if (target.name === 'desktop') {
        await page.locator('.group-card-link').first().hover();
        await page.waitForTimeout(220);
        const cardHoverTransform = await page.locator('.group-entry').first().evaluate((node) => getComputedStyle(node).transform);
        if (cardHoverTransform === 'none') throw new Error(`${target.name}/${theme}: 首页父分组卡缺少悬停反馈`);
        await page.screenshot({ path: `${output}-${target.name}-${theme}-home-card-hover.png`, fullPage: true });

        await page.locator('.group-recent a').first().hover();
        await page.waitForTimeout(220);
        const homeSeparatedFeedback = await page.locator('.group-recent a').first().evaluate((link) => ({
          groupTransform: getComputedStyle(link.closest('.group-entry')).transform,
          recentBackground: getComputedStyle(link).backgroundColor,
        }));
        if (homeSeparatedFeedback.groupTransform !== 'none') throw new Error(`${target.name}/${theme}: 首页文章悬停错误触发父卡位移`);
        if (homeSeparatedFeedback.recentBackground === 'rgba(0, 0, 0, 0)') throw new Error(`${target.name}/${theme}: 首页文章缺少独立悬停反馈`);
        await page.screenshot({ path: `${output}-${target.name}-${theme}-home-recent-hover.png`, fullPage: true });
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify(results, null, 2));
