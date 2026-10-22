# 428强弱电综合实验室

428强弱电综合实验室博客，专业方向为电气工程及其自动化，基于 Astro 构建并通过 GitHub Pages 自动部署：

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

在 `src/content/blog/` 下创建 Markdown 或 MDX 文件。`dir1` 必须为电源组、飞控组、小车组或其他；推荐显式填写 `dir2` 并让目录层级与分类一致。

网页发文、图片上传与自动部署步骤见 [GitHub 发文指南](src/content/blog/其他/站点指南/github-publishing-guide.md)，也可下载该 Markdown 文件交给协作者。

文章 frontmatter 可填写 `author` 与 `sourceUrl`。现有文章作者统一为“离子怪”，文章页作者名会链接到其个人博客；未填写作者时继续使用实验室名称。

文章内插入视频使用独立一行的 `::video[相对路径]`，路径相对文章文件本身，视频随构建打包并自动带上站点子路径：

```markdown
::video[vid1.mp4]
::video[vid1.mp4]{poster=封面.webp, loop, muted, class=hero-video}
```

布尔属性为 `loop`、`muted`、`autoplay`、`controls`、`playsinline`，键值属性为 `poster`、`title`、`class`、`width`、`height`、`preload`；视频扩展名限 `.mp4`、`.webm`、`.ogg`、`.mov`。文件缺失或属性写错会直接中断构建。

## 站点结构

- `src/consts.ts`：实验室名称、站点地址和仓库配置
- `src/styles/themes/`：亮色红金蓝主题与深色主题
- `src/content/blog/`：实验室文章
- `src/content/maintenance.md`：站点维护记录
- `astro.config.mjs`：站点与 GitHub Pages 子路径

## 发布

推送 `main` 分支后，GitHub Actions 会执行检查、测试、构建并部署 GitHub Pages。

`SITE_URL` 与 `SITE_BASE` 可在其他托管环境覆盖；未设置时默认使用 GitHub Pages 地址和 `/GUET_428` 子路径。

管理台云端写入保持禁用；部署工作流已配置只读状态服务。协作者通过 GitHub 提交文章，不需要管理台发布权限。

## 源码说明

本站从已有博客代码结构建立，但使用独立 Git 仓库、独立站点身份和独立发布路径。旧站的 Git 历史、Beads 数据、缓存和构建产物未迁移。
