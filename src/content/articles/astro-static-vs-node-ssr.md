---
title: "Astro 静态部署 vs Node SSR：部署方案与 SEO 说明"
description: "说明 Astro 静态构建与 Node SSR 的部署差异，以及为什么静态 HTML 仍然 SEO 友好。"
publishedDate: "2026-05-23"
updatedDate: "2026-06-09"
tags:
  - "Astro"
  - "部署"
  - "SEO"
---

<callout icon="📌" color="gray_bg">
	整理来源：[Astro 官方文档（docs.astro.build）](https://docs.astro.build)、Docker BuildKit 文档 — 2026 年 6 月
</callout>
# Astro 静态部署 vs Node SSR
<callout icon="💡" color="blue_bg">
	结论先行：当前项目用静态部署即可。Astro 默认 output: "static"，构建产物是纯 HTML 文件，SEO 友好，不需要 Node runtime。只有需要登录态、实时数据或 Astro 自身承担 API 服务时，才切换到 Node SSR。
</callout>
---
## 一、两种部署模式对比
<table header-row="true" header-column="false">
<tr>
<td>对比项</td>
<td>静态部署（output: 'static'）</td>
<td>Node SSR（output: 'server'）</td>
</tr>
<tr>
<td>构建产物</td>
<td>纯 HTML / CSS / JS 文件</td>
<td>Node.js 服务进程</td>
</tr>
<tr>
<td>运行时依赖</td>
<td>无，任何静态托管平台可用</td>
<td>需要 Node.js runtime</td>
</tr>
<tr>
<td>SEO</td>
<td>搜索引擎直接拿到完整 HTML，最稳定</td>
<td>服务端渲染返回完整 HTML，与静态等效</td>
</tr>
<tr>
<td>内容更新</td>
<td>需要重新构建部署</td>
<td>更新后立刻生效</td>
</tr>
<tr>
<td>个性化/登录态</td>
<td>不支持（需搭配独立 API）</td>
<td>原生支持</td>
</tr>
<tr>
<td>部署难度</td>
<td>低（CDN 托管）</td>
<td>高（需要容器/VPS）</td>
</tr>
</table>
---
## 二、切换到 Node SSR 的方法
官方文档：[@astrojs/node adapter](https://docs.astro.build/en/guides/integrations-guide/node/)
```javascript
// astro.config.mjs
import node from "@astrojs/node";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
});
```
构建并启动：
```bash
# 构建
npm run build

# 启动（standalone 模式）
HOST=0.0.0.0 PORT=4321 node ./dist/server/entry.mjs
```
---
## 三、什么时候才需要 Node SSR
- 登录态、用户面板、个性化内容、实时数据库查询
- Astro API routes / Actions / Sessions 需在运行时执行
- 直接连数据库、处理表单、鉴权、写入数据
<callout icon="⚠️" color="orange_bg">
	不一定要整站 SSR：动态能力可单独放后端 API / Serverless / Edge Function，作品集页面继续静态部署。只有你希望 Astro 自己同时承担页面 SSR 和 API 服务，才把项目切到 @astrojs/node。
</callout>
---
## 四、Astro output 配置详解
官方文档：[output 配置参考](https://docs.astro.build/en/reference/configuration-reference/#output)
<table header-row="true" header-column="false">
<tr>
<td>output 值</td>
<td>说明</td>
</tr>
<tr>
<td>'static'（默认）</td>
<td>全站静态生成，构建产物是 HTML 文件，无需 Node</td>
</tr>
<tr>
<td>'server'</td>
<td>全站 SSR，每次请求服务端渲染，需要 adapter</td>
</tr>
<tr>
<td>'hybrid'</td>
<td>混合模式：默认静态，单个页面可选择 SSR</td>
</tr>
</table>
---
## 五、Docker 多平台构建：BUILDPLATFORM 说明
官方文档：[Docker BuildKit 内置变量](https://docs.docker.com/build/building/variables/)
BUILDPLATFORM 是 Docker BuildKit 自动注入的内置参数，**无需手动配置**，由 BuildKit/Buildx 自动传入。
```plain text
# Dockerfile 示例
# 构建阶段用 GitHub Runner 的原生架构跑 Bun，避免跨架构 QEMU 崩溃
FROM --platform=$BUILDPLATFORM oven/bun:1.3.10-alpine AS builder

# 最终镜像仍由 GitHub Action 的 platforms: linux/amd64 控制
FROM --platform=$TARGETPLATFORM node:20-alpine AS runner
```
<table header-row="true" header-column="false">
<tr>
<td>变量</td>
<td>含义</td>
</tr>
<tr>
<td>\$BUILDPLATFORM</td>
<td>构建机器本身的架构（如 linux/amd64）</td>
</tr>
<tr>
<td>\$TARGETPLATFORM</td>
<td>最终镜像的目标架构（由 --platform 参数指定）</td>
</tr>
</table>
---
## 六、参考链接
- Astro output 配置文档：[docs.astro.build/en/reference/configuration-reference/#output](https://docs.astro.build/en/reference/configuration-reference/#output)
- @astrojs/node adapter 文档：[docs.astro.build/en/guides/integrations-guide/node/](https://docs.astro.build/en/guides/integrations-guide/node/)
- Docker BuildKit 内置变量：[docs.docker.com/build/building/variables/](https://docs.docker.com/build/building/variables/)
---
<callout icon="🗓️" color="gray_bg">
	文档整理时间：2026 年 6 月  \|  来源：[Astro 官方文档](https://docs.astro.build) / [Docker BuildKit 文档](https://docs.docker.com/build/buildkit/)
</callout>
