# GUET_428 管理同步 Worker

此 Worker 目前只保留代码骨架，尚未部署，也没有可复用的线上地址。

正式启用前必须单独完成以下配置：

1. 为 GUET_428 创建独立 KV namespace，并替换 `wrangler.toml` 中的占位符。
2. 创建独立 GitHub OAuth App，回调路径固定为 `https://ice11123.github.io/GUET_428/admin/`。
3. 配置 `GITHUB_OAUTH_CLIENT_ID`、`GITHUB_OAUTH_CLIENT_SECRET` 和 `SESSION_SECRET`。
4. 验证写入目标仅为 `ice11123/GUET_428` 的 `main` 分支。

在这些条件全部满足前，主站必须保持 `PUBLIC_CLOUD_PUBLISH_ENABLED=false`，管理台只使用本地草稿和文件导出。
