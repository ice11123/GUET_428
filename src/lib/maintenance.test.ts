import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseMaintenance } from './maintenance.ts';

test('维护公告兼容常用分隔符并按日期倒序返回', async () => {
  const entries = await parseMaintenance(`# 站点维护记录

## 2026-09-12 | 较早公告

- 较早内容

## 2026-09-14｜最新公告

- 最新内容
`);

  assert.deepEqual(entries.map(({ date, title }) => ({ date, title })), [
    { date: '2026-09-14', title: '最新公告' },
    { date: '2026-09-12', title: '较早公告' },
  ]);
  assert.match(entries[0].html, /最新内容/);
});

test('仓库维护记录包含已核实的近期公告', async () => {
  const maintenancePath = fileURLToPath(new URL('../content/maintenance.md', import.meta.url));
  const entries = await parseMaintenance(readFileSync(maintenancePath, 'utf8'));

  assert.deepEqual(entries.slice(0, 5).map((entry) => entry.title), [
    '文章总结与目录学习顺序调整',
    '新生教程与 TI 小车实战拆分',
    '小车组新生教程首批上线',
    '壁纸抽屉合成路径优化',
    '公共页面与信息密度精修',
  ]);
  assert.ok(entries.every((entry) => entry.html.includes('<li>')));
});
