---
title: "通过 GitHub 发布实验室文章：协作者操作指南"
description: "从接受协作邀请到网页编辑 Markdown、提交文章、检查自动部署，介绍 GUET_428 的完整发文流程。"
pubDate: 2026-10-11T13:00:00+08:00
dir1: "其他"
dir2: "站点指南"
tags: ["站点指南", "GitHub", "文章发布"]
---

实验室网站的文章保存在 GitHub 仓库中。发布一篇文章，就是新增一个 Markdown 文件并将它提交到仓库的 `main` 分支。GitHub Actions 会自动检查内容、构建网站并部署到 GitHub Pages，无需登录网站管理台或手动上传网页。

本指南适用于 `ice11123/GUET_428` 的协作者。只使用 GitHub 网页即可完成日常发文，不必安装开发软件。

- 仓库：[ice11123/GUET_428](https://github.com/ice11123/GUET_428)
- 网站：[428 强弱电综合实验室](https://ice11123.github.io/GUET_428/)
- 发布进度：[GitHub Actions](https://github.com/ice11123/GUET_428/actions)
- [查看本指南的 Markdown 源文件](https://github.com/ice11123/GUET_428/blob/main/src/content/blog/其他/站点指南/github-publishing-guide.md)
- [下载 Markdown 原文](https://raw.githubusercontent.com/ice11123/GUET_428/main/src/content/blog/其他/站点指南/github-publishing-guide.md)：打开后，使用浏览器“另存为”，保存为 `.md` 文件。

## 1. 接受仓库协作邀请

使用受邀账号登录 GitHub。本次受邀账号为 `kirisauce`。

1. 打开 GitHub 的通知或邀请邮件，找到 `ice11123/GUET_428` 的协作邀请。
2. 也可以登录后直接访问[仓库邀请页](https://github.com/ice11123/GUET_428/invitations)。
3. 选择 **Accept invitation**，接受邀请。
4. 返回仓库，确认可以在文件页看到编辑按钮，或者在目录中使用 **Add file** 创建文件。

邀请发出和权限生效是两件事：只有受邀账号接受后，才能以协作者身份提交文章。找不到邀请时，先确认登录账号，再请仓库所有者检查邀请状态。

协作者拥有仓库写入权限，权限范围包括文章和站点代码。日常发文主要操作 `src/content/blog/`；无需改动发布工作流、依赖或站点配置。多人共同修改文章时，建议采用后文的分支与 Pull Request 流程。

## 2. 选择文章所属栏目

文章统一放在 `src/content/blog/` 中。一级栏目固定为以下四个名称，必须保持完全一致：

| 一级栏目 | 适合的内容 | 路径示例 |
| --- | --- | --- |
| 电源组 | 电源、电力电子、供电与保护 | `src/content/blog/电源组/电源基础/01-power-basics.md` |
| 飞控组 | 飞行控制、姿态估计、航电系统 | `src/content/blog/飞控组/姿态估计/01-attitude-basics.md` |
| 小车组 | 电机、编码器、循迹、任务调度与整车控制 | `src/content/blog/小车组/电机驱动/01-tb6612-basics.md` |
| 其他 | 站点说明、公共资料和跨组内容 | `src/content/blog/其他/站点指南/github-publishing-guide.md` |

二级栏目表示一个专题，例如“小车组 → 电机驱动”。可以使用已有专题，也可以建立新的二级栏目。首次发文推荐复制同栏目已有文章的结构，减少分类名称不一致的问题。

文章的分类以文件开头的 `dir1` 为准，`dir2` 可显式填写；未填写 `dir2` 时，站点会尝试从目录层级推导。建议让磁盘目录、`dir1` 和 `dir2` 保持一致，便于维护。

文件名推荐使用小写英文、数字和连字符，例如 `01-tb6612-basics.md`。系列文章可使用 `01`、`02`、`03` 编号；目前专题文章列表按 `pubDate` 从早到晚展示，因此还需要按学习顺序安排发布时间。编号本身不会改变排序。

## 3. 在 GitHub 网页新建文章

以发布一篇电机驱动入门文章为例：

1. 打开[文章目录](https://github.com/ice11123/GUET_428/tree/main/src/content/blog)，确认左上角分支为 `main`。
2. 选择 **Add file → Create new file**。
3. 如果当前位于 `src/content/blog/`，文件名输入 `小车组/电机驱动/01-tb6612-basics.md`。GitHub 会同时创建缺少的目录。
4. 将下面的模板复制到编辑区，替换标题、简介、日期、作者及正文。
5. 使用 **Preview** 查看 Markdown 的标题、列表、表格和代码块。

GitHub 预览用于检查文字结构；最终样式、数学公式和文章目录以网站构建后的页面为准。

````markdown
---
title: "01｜TB6612 电机驱动入门"
description: "认识电机驱动器的作用，理解方向控制与 PWM 调速，并完成一次安全的电机调试。"
pubDate: 2026-10-11T14:00:00+08:00
author: "kirisauce"
dir1: "小车组"
dir2: "电机驱动"
tags: ["电机驱动", "TB6612", "PWM"]
---

电机需要的电流通常超过单片机引脚的驱动能力，因此控制器与电机之间需要驱动电路。本文从驱动器的作用出发，介绍方向控制和 PWM 调速的基本方法。

## 电机驱动器解决什么问题

说明控制信号与电机供电的区别，再介绍驱动器在系统中的位置。

## 工作原理

结合实际电路说明方向、使能和 PWM 信号。电压、电流及引脚连接应依据所用模块的数据手册和实物确认。

## 程序实现

在这里给出真实驱动代码，逐步说明输入、输出、调用条件和异常处理。

## 调试与常见问题

说明首次上电的步骤、预期现象和故障排查方法。

## 本篇总结

概括驱动器的作用、关键控制信号和调试方法。
````

模板中的正文是写作提纲，发布前应换成实际教学内容。讲解代码时，先交代要解决的问题，再解释数据流和关键语句；需要硬件验证的结论应附上测试条件。

### 文件开头的字段怎么填写

文件开头两行 `---` 之间的内容称为 frontmatter，用来描述文章信息。不要删除这两行。

| 字段 | 是否必填 | 填写方法 |
| --- | --- | --- |
| `title` | 是 | 页面显示的文章标题，建议加双引号 |
| `description` | 是 | 一两句话介绍主题和学习收获 |
| `pubDate` | 是 | 首次发布日期，推荐 `2026-10-11T14:00:00+08:00` 格式 |
| `dir1` | 是 | 只能填写 `电源组`、`飞控组`、`小车组`、`其他` 中的一项 |
| `dir2` | 否 | 二级专题名称，推荐显式填写 |
| `author` | 否 | 作者显示名称；省略时显示实验室名称 |
| `updatedDate` | 否 | 修改旧文时填写新的更新时间，格式同 `pubDate` |
| `tags` | 否 | 如 `["电机驱动", "PWM"]`，便于检索 |
| `sourceUrl` | 否 | 真实源码的 GitHub HTTPS 链接；暂时没有源码链接时省略 |
| `heroImage` | 否 | 已存在的本地封面图相对路径；没有封面时省略 |

YAML 字段之间使用半角冒号，冒号后留一个空格。不要使用中文引号代替代码中的 `"`，也不要将不存在的图片路径或未替换的占位地址填进字段。

`pubDate` 当前只是展示与排序字段，不提供定时发布功能。即使填写未来日期，文章提交到 `main` 并部署成功后也会公开显示。尚未完成的内容应保存在分支中。

## 4. 编写正文和插入图片

文章页已经显示 frontmatter 中的标题，正文通常从介绍段落开始，以 `##` 组织章节，以 `###` 划分小节。网站会根据章节标题生成右侧目录，不必再在正文中重复一个 `#` 大标题。

代码块需要标注语言，例如：

````markdown
```c
uint32_t period_ms = 10;
```
````

图片推荐与文章放在同一目录。例如：

```text
src/content/blog/小车组/电机驱动/
├── 01-tb6612-basics.md
└── tb6612-wiring.png
```

先在该目录选择 **Add file → Upload files** 上传图片，再在正文引用：

```markdown
![TB6612 与控制器连接示意图](./tb6612-wiring.png)
```

文件名必须与上传后的名称一致，尤其注意英文大小写；Windows 本地可能忽略大小写，GitHub 上的构建环境会严格区分。用真实图片文件，避免引用电脑的 `D:\` 路径、临时截图路径或需要登录才能查看的外部链接。

图片和 Markdown 都进入 `main` 后，文章才能正常构建。若涉及多张图片，建议将整篇文章和图片放在同一分支，确认齐全后一次合并，避免构建时引用尚未上传的文件。

## 5. 提交文章并自动部署

文章完成后，点击 **Commit changes**：

1. 提交说明填写清晰的动作，例如 `docs: 新增 TB6612 电机驱动入门`。
2. 日常单篇发文可以选择 **Commit directly to the main branch**。
3. 确认提交。
4. 打开[Actions 页面](https://github.com/ice11123/GUET_428/actions)，找到工作流 **Deploy Astro to GitHub Pages** 中对应的提交。

这次提交会依次经过：

```text
提交到 main → 安装依赖 → 类型检查 → 自动测试 → 构建网站 → 部署 GitHub Pages
```

工作流的 `build` 和 `deploy` 都成功后，再打开[线上网站](https://ice11123.github.io/GUET_428/)，进入对应分组与专题查收文章。运行时长取决于依赖安装和构建情况，以 Actions 状态为准。

文章发布提交不要包含 `[skip ci]` 或 `[ci skip]`，否则可能跳过工作流，出现“文件已经更新，但网站没有更新”的情况。

文章页面地址由内容文件的路径生成，英文片段可能被规范化为小写。发布后应从站点目录打开文章并复制真实地址，避免根据磁盘路径猜测链接。长期发布的文章尽量保持文件名和路径稳定，防止已有链接失效。

### 多人协作：使用分支与 Pull Request

需要审阅或同时提交图片时，在 **Commit changes** 中选择 **Create a new branch for this commit and start a pull request**，使用明确的分支名，例如 `article/tb6612-basics`。图片也上传到同一分支。

将 Pull Request 的目标分支设为 `main`，说明新增文章的位置与主题，请维护者检查并合并。当前自动发布工作流只监听 `main` 的提交；文章停留在分支或未合并的 Pull Request 中时，不会进入正式网站。

当前工作流没有配置 Pull Request 触发器，因此不能把“PR 中没有检查结果”理解为文章已经通过检查。有本地开发环境时可以先运行后文的校验命令；正式部署检查仍会在合并到 `main` 后执行。

## 6. 修改已有文章

1. 在仓库中打开对应 `.md` 文件，点击铅笔图标编辑。
2. 修改正文或简介。
3. 保留原 `pubDate`，新增或更新 `updatedDate`。
4. 提交到 `main`，或者通过分支与 Pull Request 合并。
5. 等待同一个 Pages 工作流成功，再核对线上内容。

保留 `pubDate` 可以保持专题的学习顺序；`updatedDate` 用于告诉读者内容何时修订。

需要撤回有问题的内容时，优先提交一份修正，或通过 GitHub 恢复到已确认正确的内容。修改后仍需等待新的部署成功，不要通过删除工作流或改动部署配置来处理文章错误。

## 7. 网站没有更新时怎么排查

| 现象 | 优先检查 |
| --- | --- |
| 没有编辑或提交权限 | 是否登录受邀账号、是否已经接受邀请 |
| 找不到此次工作流 | 是否提交到 `main`，提交说明是否含跳过 CI 的标记 |
| `Check project` 或构建失败 | 点开第一个失败步骤，检查字段名称、日期、一级栏目和图片路径 |
| `Test project` 失败 | 查看错误是否与文章内容有关；无法判断时将运行链接发给维护者 |
| 文章列表没有出现 | 是否位于 `src/content/blog/`，扩展名是否为 `.md` 或 `.mdx`，栏目字段是否正确 |
| 页面 404 | 从网站目录重新打开，检查部署是否完成，不要猜测大小写或旧路径 |
| 网站仍显示旧内容 | 核对成功运行对应的提交，再强制刷新；必要时用无痕窗口检查 |
| 图片不显示 | 确认图片已提交到同一分支，核对相对路径、文件名和大小写 |

需要重新运行部署时，有权限的协作者可以打开失败运行，选择 **Re-run jobs**；修正文章内容后直接提交也会触发新运行。工作流同时支持 **Run workflow**，手动触发时选择 `main`。不要在上一轮尚未结束时连续反复触发发布。

网站管理台目前没有启用云端写入。GitHub 协作权限用于仓库操作，不能直接解锁管理台的云端发布功能；本指南的发文方式以 GitHub 提交为入口。

## 8. 可选：本地预览与检查

需要反复调整长文、公式或图片时，可使用本地环境。准备 Git、Node.js 22.12 或更高版本，以及 pnpm 11，然后执行：

```bash
git clone https://github.com/ice11123/GUET_428.git
cd GUET_428
pnpm install --frozen-lockfile
pnpm run dev
```

根据终端提示打开本地地址；预览结束后按 `Ctrl+C` 停止服务。提交前运行：

```bash
pnpm run check
pnpm test
pnpm run build
```

检查通过后，将文章和图片提交并推送到 `main` 或文章分支。无需上传 `dist/`，Pages 工作流会自行生成并部署它。

## 9. GitHub Pages 与 Sites 镜像

正式发文入口是 GitHub 仓库，自动上线地址是 `https://ice11123.github.io/GUET_428/`。

现有 [Sites 镜像](https://guet-428.passonmartirano.chatgpt.site) 使用独立的发布流程。当前 Pages 工作流不会同步发布 Sites；需要镜像更新时，由具备该 Sites 项目权限的维护者同步仓库提交并发布。GitHub 协作者权限不会自动授予 Sites 项目的访问或发布权限。

## 本篇总结

接受邀请后，在 `src/content/blog/` 中新增 Markdown 文件，填写文章信息并完成正文。提交到 `main` 会触发检查、构建与部署；两项作业成功后，从网站目录打开真实文章地址验收。修改旧文保留发布日期、更新修订时间；需要共同审阅时使用分支和 Pull Request。

权限邀请流程可参考 [GitHub 官方协作者说明](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/inviting-collaborators-to-a-personal-repository)。本文的字段与发布步骤依据本仓库的 `src/content.config.ts` 和 `.github/workflows/` 编写。
