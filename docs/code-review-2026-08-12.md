# 代码审查记录（2026-08-12）

## 范围与结论

本次按当前 `HEAD`（`2bc4cc8 cleanup: remove duplicate demo article`）对仓库全量静态审查，重点覆盖：Astro 页面与客户端脚本、管理台状态、Cloudflare Worker OAuth/会话/发布链路、GitHub Pages 工作流、内容路径与 URL 处理。

本次只审查，没有修改业务代码。现有 `pnpm run check`、`pnpm run build` 和 `node --check worker/src/index.js` 均通过；这些命令不能覆盖真实 OAuth 回调、跨源预检、Cookie、GitHub API 写入、并发发布和远程删除。

Beads 检查结果：仓库当前没有活动 Beads workspace（`bd prime` 返回 `No active beads workspace found`），因此没有擅自初始化新的 Beads 数据库；本文件作为本次审查的仓库内持久记录。

## Findings

### P0 — 发布请求的 CORS 预检不允许 `Authorization`

- 证据：[worker/src/index.js:88](../worker/src/index.js:88) 的 `Access-Control-Allow-Headers` 只有 `Content-Type`。
- 前端在 [src/pages/admin/index.astro:208](../src/pages/admin/index.astro:208)、[src/pages/admin/index.astro:215](../src/pages/admin/index.astro:215)、[src/pages/admin/index.astro:270](../src/pages/admin/index.astro:270) 等位置发送 `Authorization: Bearer ...`。
- 管理台与 Worker 是跨源请求；带自定义 `Authorization` 的请求会触发 OPTIONS 预检，浏览器会因响应未声明 `Authorization` 而阻止真实请求。该问题可以直接表现为“授权成功但发布没有变化”。

建议：允许的请求头至少包含 `Content-Type, Authorization`，同时严格校验 `Origin`，不要把 CORS 当作 CSRF 防护。

### P0 — OAuth `returnTo` 是开放重定向，且把长期会话令牌放进 URL

- [worker/src/index.js:23](../worker/src/index.js:23) 接受任意 `returnTo`。
- [worker/src/index.js:46-50](../worker/src/index.js:46) 解码后直接 `new URL(returnTo)`，并把 7 天有效的 `sessionId` 写入 `admin_token` 查询参数。
- 前端在 [src/pages/admin/index.astro:299-302](../src/pages/admin/index.astro:299) 读取该参数并写入 `localStorage`。

攻击者可以构造外站 `returnTo`，诱导账号所有者完成授权后接收包含会话令牌的跳转 URL。令牌还会进入历史记录、日志、截图或 Referrer，拿到它即可调用发布接口。

建议：只允许固定的本站 `/blog_test1/admin/` 回跳；OAuth 回调设置 HttpOnly Cookie，或使用一次性、短时效 exchange code，禁止把 session ID 放到查询参数或 `localStorage`。

### P1 — 改名/迁移文章不是原子操作，失败会留下新旧版本

- [worker/src/index.js:71-75](../worker/src/index.js:71) 先 PUT 新路径，再单独 GET/DELETE `publishedPath` 旧路径。

删除失败、网络中断、GitHub Actions 在两个提交之间构建，都会造成新旧文章同时存在或前端显示失败但仓库已部分更新。并发设备发布同一文章时也没有锁或版本条件。

建议：使用 Git Trees + Commit API 在一个 commit 中完成新增/修改/删除；至少返回“新文件已写入、旧文件删除失败”的明确状态，并加入幂等请求 ID、并发版本校验和补偿清理。

### P1 — 目标路径碰撞会覆盖另一篇正式文章

- [worker/src/index.js:64-71](../worker/src/index.js:64) 根据目录和文件名生成 `filePath`，发现已有文件后直接带 `sha` PUT 覆盖。
- 没有验证目标文件的 `publishedPath` 是否属于当前文章，也没有检测另一篇文章是否已占用该路径。

用户把文章改名为另一篇文章的路径时，目标文章可能被覆盖，随后旧路径还会被删除，造成数据丢失。

建议：发布前检查目标路径与当前 `publishedPath` 的关系；如果目标已存在且不是当前文章，拒绝发布并提示冲突，或要求显式确认覆盖。

### P1 — `publishedPath` 校验允许 `..` 路径段

- [worker/src/index.js:67](../worker/src/index.js:67) 和 [worker/src/index.js:84](../worker/src/index.js:84) 使用正则校验旧路径。
- 正则中的 `[^/]+` 会接受 `.`、`..`，例如 `src/content/blog/../README.md` 会匹配。

这使旧文件 GET/DELETE 的目标不再是规范化的 `src/content/blog` 子树；在令牌泄露或客户端数据被篡改时，可能误删仓库内其它 Markdown 文件。

建议：逐段拒绝 `.`、`..` 和空段，并对路径做 canonical normalize 后再确认前缀必须严格为 `src/content/blog/`。

### P1 — 管理台“删除”只删除浏览器草稿，不删除正式文章

- [src/pages/admin/index.astro:259](../src/pages/admin/index.astro:259) 只调用本地 `removeDraft`。
- Worker 只有 `/api/sync`，没有受保护的远程 DELETE 接口。

已发布文章在管理台删除后仍会保留在线，和“管理台与正式文章一一对应”的目标不一致；之后重置本地草稿还可能再次看到仓库文章。

建议：增加单独的远程删除接口，服务端只接受 `publishedPath` 并强制限制在内容目录内；删除前二次确认，返回 commit SHA 和部署状态。

### P1 — 旧 `localStorage` 草稿完全覆盖仓库初始文章

- [src/pages/admin/index.astro:166-174](../src/pages/admin/index.astro:166) 只要存在本地 JSON，就完全使用它，不与构建时 `initialDrafts` 合并。
- 同样的存储逻辑在 [src/lib/adminDrafts.ts:37-47](../src/lib/adminDrafts.ts:37) 中存在。

远程删除、其它设备发布、新增文章或路径迁移后，旧设备仍可能显示孤立草稿；再次发布会重新创建旧文章或旧路径，重新引入重复版本。

建议：给草稿记录仓库 commit/版本，初始化时按 `publishedPath` 合并 canonical 文章；标记并清理远程不存在的孤立草稿，提供“重新同步仓库状态”操作。

### P1 — OAuth 权限范围过宽，会话中的 GitHub Token 明文保存

- [worker/src/index.js:27](../worker/src/index.js:27) 使用 `public_repo`，可写该账号所有公开仓库，不限于目标仓库。
- [worker/src/index.js:45](../worker/src/index.js:45) 将 OAuth Token 明文写入 KV；前端还会把 session bearer 保存到 `localStorage`（[src/pages/admin/index.astro:207-208](../src/pages/admin/index.astro:207)）。

任意同源 XSS、恶意浏览器扩展或令牌泄露都会扩大影响范围。`SESSION_SECRET` 当前只被配置检查使用，并未用于签名或加密会话。

建议：改用 GitHub App 的最小 `Contents: Read and write` 权限；若暂时保留 OAuth，缩短会话 TTL、加密/轮换令牌并提供 logout/revoke。

### P2 — OAuth 回跳后的 pending 发布顺序存在竞态

- [src/pages/admin/index.astro:287-308](../src/pages/admin/index.astro:287) 先读取 pending 草稿并请求 `/auth/me`，后面才处理 URL 中的 `admin_token`。

授权回跳初次加载时 `/auth/me` 可能先以未授权状态返回，代码会删除 pending 草稿；之后才保存 token，导致授权成功但文章不再自动提交。

建议：先解析并保存回跳凭据，再检查会话，最后恢复 pending 草稿；迁移到 HttpOnly Cookie 后删除这段 URL token 恢复逻辑。

### P2 — 日期、字段长度和请求体校验不足，可能破坏 frontmatter 或构建

- [worker/src/index.js:61-62](../worker/src/index.js:61) 直接 `request.json()`，没有明确请求体上限和 400 错误处理。
- [worker/src/index.js:81-82](../worker/src/index.js:81) 只检查少数字段为字符串，并把 `pubDate`/`updatedDate` 原样插入 frontmatter；没有严格日期格式、标题/目录/标签单项长度和 `id` 类型校验。

换行或超长值可能注入额外 YAML 字段、导致 Astro 构建失败或消耗过多 Worker 资源。

建议：采用统一 schema；日期限定 `YYYY-MM-DD` 并校验真实日期，限制各字段长度/标签数量/总请求体大小；JSON 解析和校验失败返回 400，不把内部异常原文返回客户端。

### P2 — GET Contents 的 `branch` 参数实际上没有生效

- [worker/src/index.js:69](../worker/src/index.js:69)、[worker/src/index.js:73](../worker/src/index.js:73) 把 `{ branch: env.GITHUB_BRANCH }` 传入 `githubFetch`。
- [worker/src/index.js:80](../worker/src/index.js:80) 没有把该值转换为 URL 的 `?ref=...`，`branch` 不是标准 `RequestInit` 字段，会被忽略。

当前 `main` 恰好通常是默认分支，所以问题不一定立即出现；一旦配置非默认分支，读取 SHA 会错。

建议：对 GET 请求显式拼接并 URL 编码 `ref`，并为分支配置增加集成测试。

### P2 — 管理台预览与正式 MDX 构建不等价

- [src/pages/admin/index.astro:195-203](../src/pages/admin/index.astro:195) 使用 `marked`，并把 MDX 组件替换为占位文本。

预览正常不代表 Astro MDX、KaTeX、Mermaid 或自定义组件能成功构建；发布失败只能在 GitHub Actions 后才暴露。

建议：发布接口触发并返回 Actions run ID，管理台轮询构建结果并提供日志链接；或限制可用 MDX 语法并在服务端做构建前校验。

### P2 — 预览允许危险 URL 协议

`marked` 默认会生成 `javascript:` 链接/图片，而预览通过 `innerHTML` 写入 [src/pages/admin/index.astro:244](../src/pages/admin/index.astro:244)。测试确认 `[x](javascript:alert(1))` 会生成带 `javascript:` 的 `<a>`。

建议：对链接和图片协议只允许 `http:`、`https:`、相对路径和必要的 `mailto:`；更稳妥的是使用 DOMPurify 或 AST 渲染，而不是直接设置 `innerHTML`。

## 优化项（非阻断）

- 将 Worker 的单行压缩函数拆分为可测试的模块，统一错误类型和响应格式，减少维护成本。
- 为前端发布、OAuth 回调、旧路径删除、冲突检测和草稿合并增加自动化测试；当前 `astro check` 不会覆盖这些运行时路径。
- `astro.config.mjs` 当前仍使用已被 Astro 提示弃用的顶层 `markdown.remarkPlugins`/`rehypePlugins` 配置，应迁移到 `unified({...})` 配置，消除构建警告。
- GitHub Languages 组件会逐仓库串行请求 GitHub API（[src/components/github/GitHubLanguages.astro:197-217](../src/components/github/GitHubLanguages.astro:197)），仓库数量增加后容易触发 API 限流；可并发限量、缓存并只请求必要仓库。
- Header、管理台和部分文档存在历史编码乱码；不一定影响构建，但会损害可读性、SEO 和错误提示质量，应统一 UTF-8 并做一次全仓扫描。
- `worker/README.md` 仍包含过时的 `YOUR_KV_NAMESPACE_ID_HERE` 说明，而 `worker/wrangler.toml` 已有实际 KV ID；文档应与部署状态一致。
- 管理页提示仍有“没有 GitHub 写入权限”的旧文案，但当前已配置云端发布，容易误导使用者；应明确区分“前端门槛不安全”和“云端发布需要 GitHub OAuth”。

## 验证记录

已执行并通过：

```text
pnpm run check
pnpm run build
node --check worker/src/index.js
```

未执行：真实 OAuth 授权、跨源 OPTIONS 预检、Cookie 属性验证、GitHub Contents API 写入/删除、并发发布、Actions 构建失败回传和移动端浏览器交互测试。
