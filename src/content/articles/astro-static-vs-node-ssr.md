---
title: "Astro 静态部署 vs Node SSR：部署方案与 SEO 说明"
description: "说明 Astro 静态构建与 Node SSR 的部署差异，以及为什么静态 HTML 仍然 SEO 友好。"
publishedDate: "2026-05-23"
updatedDate: "2026-05-23"
tags:
  - "Astro"
  - "部署"
  - "SEO"
---

## 结论：当前项目用静态部署即可
- Astro 默认 `output: "static"`，构建产物是纯 HTML 文件，SEO 友好，不需要 Node runtime
- 搜索引擎拿到的是完整 HTML，不是空壳 SPA，静态预渲染对 SEO 反而更稳
- 静态部署：快、缓存好、服务器依赖少
## 切换到 Node SSR 的方法
```javascript
// astro.config.mjs
import node from "@astrojs/node";
export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
});
```
启动命令：
```bash
HOST=0.0.0.0 PORT=4321 node ./dist/server/entry.mjs
```
## 什么时候才需要 Node SSR
- 登录态、用户面板、个性化内容、实时数据库查询
- Astro API routes / Actions / Sessions 需在运行时执行
- 直接连数据库、处理表单、鉴权、写入数据
> ⚠️ 不一定要整站 SSR：动态能力可单独放后端 API / Serverless / Edge Function，作品集页面继续静态部署。只有你希望 Astro 自己同时承担页面 SSR 和 API 服务，才把项目切到 `@astrojs/node`。
## BUILDPLATFORM 说明
- 是 Docker BuildKit 自动注入的内置参数，**无需手动配置**
- 和 `TARGETPLATFORM` 一样，由 BuildKit/Buildx 自动传入
- 在 Dockerfile 里写 `FROM --platform=$BUILDPLATFORM oven/bun:1.3.10-alpine AS builder`
- 含义：构建阶段用 GitHub Runner 的原生架构跑 Bun，避免跨架构 QEMU 崩溃；最终镜像仍由 GitHub Action 的 `platforms: linux/amd64` 控制产出 amd64 镜像
## 参考
- [Astro output 配置文档](https://docs.astro.build/en/reference/configuration-reference/#output)
- [@astrojs/node adapter 文档](https://docs.astro.build/en/guides/integrations-guide/node/)
