import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcRoot = fileURLToPath(new URL('..', import.meta.url));
const readSource = (path: string) => readFileSync(join(srcRoot, path), 'utf8');

function readBlogSources(directory = join(srcRoot, 'content', 'blog')): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return readBlogSources(path);
    return /\.mdx?$/.test(entry.name) ? [readFileSync(path, 'utf8')] : [];
  });
}

test('文章不再使用验收清单作为结尾', () => {
  const posts = readBlogSources();
  assert.ok(posts.length > 0);
  assert.doesNotMatch(posts.join('\n'), /^## 本篇验收清单$/m);
  assert.doesNotMatch(posts.join('\n'), /^- \[ \] /m);
});

test('小车组新生入门与 TI 小车实战各自保持清晰定位', () => {
  const beginnerPaths = [
    'content/blog/小车组/新生入门/01-first-week.md',
    'content/blog/小车组/新生入门/02-electrical-basics.md',
    'content/blog/小车组/新生入门/03-mcu-gpio-pwm.md',
  ];
  const projectPaths = [
    'content/blog/小车组/TI小车实战/01-ti-car-start.md',
    'content/blog/小车组/TI小车实战/02-system-architecture.md',
    'content/blog/小车组/TI小车实战/03-first-motor-run.md',
    'content/blog/小车组/TI小车实战/04-software-architecture.md',
    'content/blog/小车组/TI小车实战/05-motor-execution-chain.md',
    'content/blog/小车组/TI小车实战/06-encoder-motion-metrics.md',
    'content/blog/小车组/TI小车实战/07-speed-position-control.md',
    'content/blog/小车组/TI小车实战/08-line-tracking-system.md',
    'content/blog/小车组/TI小车实战/09-observability-and-hmi.md',
    'content/blog/小车组/TI小车实战/10-integration-and-delivery.md',
  ];

  const beginnerPosts = beginnerPaths.map(readSource);
  const projectPosts = projectPaths.map(readSource);

  for (const post of beginnerPosts) {
    assert.match(post, /dir1: "小车组"/);
    assert.match(post, /dir2: "新生入门"/);
  }
  for (const post of projectPosts) {
    assert.match(post, /dir1: "小车组"/);
    assert.match(post, /dir2: "TI小车实战"/);
    assert.match(post, /^## 本篇总结$/m);
    assert.doesNotMatch(post, /^## (动手练习|读完后应该能回答)$/m);
    assert.match(post, /MSPM0G35XX/);
    assert.doesNotMatch(post, /MSPM0G3507|MSPM0G3519/);
  }

  assert.match(beginnerPosts[0], /做实验的固定循环/);
  assert.match(beginnerPosts[1], /测电压时并联，测电流时串联/);
  assert.match(beginnerPosts[2], /GPIO 不能直接驱动电机/);
  assert.doesNotMatch(beginnerPosts.join('\n'), /PB14|TIMG8|MSPM0G3519/);

  assert.match(projectPosts[0], /整体—部分—整体/);
  assert.match(projectPosts[0], /非抢占式任务调度器/);
  assert.match(projectPosts[1], /优先级不等于抢占/);
  assert.match(projectPosts[1], /Encoder.*10 ms/s);
  assert.match(projectPosts[2], /TB6612/);
  assert.match(projectPosts[2], /`-1000` 到 `1000`/);
  assert.match(projectPosts[3], /硬件 QEI/);
  assert.match(projectPosts[3], /TIMG8.*TIMG9/s);
  assert.match(projectPosts[4], /速度内环/);
  assert.match(projectPosts[4], /一阶低通/);
  assert.match(projectPosts[5], /五路循迹/);
  assert.match(projectPosts[5], /低通再求微分/);
  assert.match(projectPosts[6], /ICM42688_ENABLE = 0U/);
  assert.match(projectPosts[6], /当前模块默认关闭/);
  assert.match(projectPosts[7], /阻塞串口/);
  assert.match(projectPosts[8], /统一停机/);
  assert.match(projectPosts[9], /交付包应包含什么/);
  assert.match(projectPosts[9], /初始化—启动—感知—决策—控制—观测—完成/);

  const constants = readSource('consts.ts');
  assert.match(constants, /小车组: \['新生入门', 'TI小车实战', 'PID算法', 'RTOS-任务调度器', '灰度及循迹环PID', '滤波算法与陀螺仪驱动'\]/);
});

test('资料总结按四个二级目录发布并保留代码证据边界', () => {
  const paths = [
    'content/blog/小车组/PID算法/01-pid-algorithms.md',
    'content/blog/小车组/RTOS-任务调度器/01-cooperative-scheduler.md',
    'content/blog/小车组/灰度及循迹环PID/01-line-tracking-control.md',
    'content/blog/小车组/滤波算法与陀螺仪驱动/01-filtering-and-imu-drivers.md',
  ];
  const posts = paths.map(readSource);

  posts.forEach((post) => {
    assert.match(post, /dir1: "小车组"/);
    assert.match(post, /^## 本篇总结$/m);
    assert.doesNotMatch(post, /^## (动手练习|读完后应该能回答|本篇验收清单)$/m);
  });

  assert.match(posts[0], /位置式 PID/);
  assert.match(posts[0], /抗积分饱和/);
  assert.match(posts[1], /任务名使用指针比较/);
  assert.match(posts[1], /`MaxUsed` 没有保存最大值/);
  assert.match(posts[2], /备用未调用/);
  assert.match(posts[2], /失线逻辑互相抵消/);
  assert.match(posts[3], /DMP 驱动文件被当前 `IMU\.c` 调用 \| 否/);
  assert.match(posts[3], /BNO080 UART-RVC 初始化与中断链可达/);
});

test('PublicStatus 可见或手动触发，共享请求且初次不连续重试', () => {
  const source = readSource('scripts/public-status.ts');
  const component = readSource('components/home/PublicStatus.astro');
  assert.match(source, /WORKER_INITIAL_ATTEMPTS\s*=\s*1/);
  assert.match(source, /WORKER_MANUAL_ATTEMPTS\s*=\s*3/);
  assert.match(source, /new IntersectionObserver/);
  assert.match(source, /runRefresh\(true\)/);
  assert.match(source, /if \(refreshInFlight\) return refreshInFlight/);
  assert.match(source, /astro:before-swap/);
  assert.match(source, /controller\.abort\(\)/);
  assert.match(source, /initPublicStatus\(\);/);
  assert.match(component, /import\(['"]\.\.\/\.\.\/scripts\/public-status['"]\)/);
  assert.match(component, /rootMargin:\s*['"]240px 0px['"]/);
  assert.doesNotMatch(component, /<script src="\.\.\/\.\.\/scripts\/public-status"/);
  assert.ok(component.indexOf("if (!root || root.dataset.loaderBound === 'true') return") < component.indexOf('cleanupPublicStatusLoader?.()'));
  assert.match(component, /stopImmediatePropagation\(\)/);
  assert.match(component, /refreshButton\?\.click\(\)/);
  assert.match(source, /deployment\.status === 'failure'/);
  assert.match(source, /部署状态暂未确认/);
  assert.match(source, /不代表部署失败/);
});

test('Plot3D 与 MiniBrowser 不在文章首载抢占外部资源', () => {
  const plotComponent = readSource('components/widgets/Plot3D.astro');
  const plotRuntime = readSource('scripts/plot3d.ts');
  const miniBrowser = readSource('components/widgets/MiniBrowser.astro');

  assert.doesNotMatch(plotComponent, /<script[^>]+src="https:\/\/cdn\.plot\.ly/);
  assert.match(plotComponent, /data-plot3d/);
  assert.match(plotRuntime, /new IntersectionObserver/);
  assert.match(plotRuntime, /rootMargin:\s*'240px 0px'/);
  assert.match(plotRuntime, /document\.head\.appendChild\(script\)/);
  assert.match(plotRuntime, /Plotly\?\.purge\?\.\(root\)/);
  assert.match(plotRuntime, /PLOTLY_TIMEOUT_MS\s*=\s*10_000/);
  assert.match(plotRuntime, /responsive:\s*true/);
  assert.match(plotRuntime, /new ResizeObserver/);
  assert.match(plotRuntime, /Plotly\?\.Plots\?\.resize\(root\)/);
  assert.match(plotRuntime, /Plotly\.relayout/);
  assert.match(plotRuntime, /script\.remove\(\)/);
  assert.match(plotRuntime, /attributeFilter:\s*\['data-theme'\]/);
  assert.match(miniBrowser, /loading="lazy"/);
  assert.match(miniBrowser, /document\.addEventListener\('astro:page-load', initMiniBrowsers\)/);
});

test('Mermaid 在每次文章路由挂载并释放主题观察器', () => {
  const source = readSource('scripts/mermaid.ts');
  assert.match(source, /document\.addEventListener\('astro:page-load', initMermaidPage\)/);
  assert.match(source, /document\.addEventListener\('astro:before-swap', cleanupMermaidPage\)/);
  assert.match(source, /observer\?\.disconnect\(\)/);
  assert.match(source, /renderGen \+= 1/);
  assert.match(source, /MERMAID_TIMEOUT_MS\s*=\s*10_000/);
  assert.match(source, /script\.remove\(\)/);
});
