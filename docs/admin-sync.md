# GUET_428 管理同步边界

GUET_428 尚未配置独立 Worker、KV 或 GitHub OAuth App，因此管理台只支持本地草稿、实时预览和文件导出。

## 启用前置条件

- 独立 Worker 地址
- GUET_428 专用 KV namespace
- 回调地址为 `https://ice11123.github.io/GUET_428/admin/` 的 GitHub OAuth App
- 写入目标固定为 `ice11123/GUET_428/main`
- 独立会话密钥与最小权限 GitHub 凭据

缺少任一条件时，不得设置 `PUBLIC_CLOUD_PUBLISH_ENABLED=true`，也不得复用其他博客的 Worker、KV 或 OAuth 配置。
