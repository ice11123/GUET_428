# 428强弱电综合实验室

桂林电子科技大学电气工程及其自动化专业实验室博客，基于 Astro 构建并通过 GitHub Pages 自动部署：

<https://ice11123.github.io/GUET_428/>

## 本地开发

环境要求：Node.js 22.12 或更高版本、pnpm 11。

```bash
pnpm install
pnpm run dev
pnpm run check
pnpm test
pnpm run build
```

## 添加文章

在 `src/content/blog/` 下创建 Markdown 或 MDX 文件。目录层级会自动成为文章分类。

## 站点结构

- `src/consts.ts`：实验室名称、站点地址和仓库配置
- `src/styles/themes/`：亮色红金蓝主题与深色主题
- `src/content/blog/`：实验室文章
- `src/content/maintenance.md`：站点维护记录
- `astro.config.mjs`：站点与 GitHub Pages 子路径

## 发布

推送 `main` 分支后，GitHub Actions 会执行检查、测试、构建并部署 GitHub Pages。

管理台当前只支持本地草稿与文件导出。GUET_428 尚未配置独立 Worker、KV 或 GitHub OAuth，因此云端写入保持禁用。

## 源码说明

本站从已有博客代码结构建立，但使用独立 Git 仓库、独立站点身份和独立发布路径。旧站的 Git 历史、Beads 数据、缓存和构建产物未迁移。
