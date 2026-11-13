# demo-ui

质衡（QualiTest）演示环境**管理端**前端：Vue 3 + Element Plus + Vite。

商城 C 端 H5 在同仓 [`demo-uni/`](../demo-uni/)；生产由同一 Nginx 托管为 `/h5/`。登录页与登录后头像菜单可通过 `VITE_H5_URL` 跳转商城 H5（不共享登录态）。

## 前端运行

```bash
# 进入项目目录
cd demo-ui

# 安装依赖
pnpm install

# 启动服务（默认 5181）
pnpm dev

# 构建生产环境
pnpm build:prod
```

建议使用开发构建，预览生产构建可用 `pnpm preview`。
