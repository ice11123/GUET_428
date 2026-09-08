# GUET_428 管理同步 Worker

此 Worker 已作为 GUET_428 独立服务部署：

`https://guet-428-admin-api.2799587522.workers.dev`

它已绑定独立 KV，健康检查和公开仓库/部署状态可用；OAuth 写入在下列密钥配置完成前保持关闭。

正式启用前必须单独完成以下配置：

1. 创建独立 GitHub OAuth App，回调路径固定为 `https://guet-428-admin-api.2799587522.workers.dev/auth/callback`。
2. 配置 `GITHUB_OAUTH_CLIENT_ID` 和 `GITHUB_OAUTH_CLIENT_SECRET`；`SESSION_SECRET` 已独立生成。
3. 验证写入目标仅为 `ice11123/GUET_428` 的 `main` 分支。

在这些条件全部满足前，主站必须保持 `PUBLIC_CLOUD_PUBLISH_ENABLED=false`，管理台只使用本地草稿和文件导出。
