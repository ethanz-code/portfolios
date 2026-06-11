# SSR 改造 + 访问计数器

## 目标

1. 项目从纯静态改为 SSR（hybrid 模式）
2. 部署时间改为服务端启动时间，去掉 GitHub Action 注入
3. 新增访问计数器，用 SQLite 存储

## 步骤

### 1. 安装依赖

```bash
bun add @astrojs/node better-sqlite3
bun add -D @types/better-sqlite3
```

### 2. 修改 astro.config.mjs

- 加 `node` adapter
- 设置 `output: 'hybrid'`
- 去掉 `DEPLOYED_AT` 相关逻辑

```js
import node from "@astrojs/node";

export default defineConfig({
  output: 'hybrid',
  adapter: node({ mode: 'standalone' }),
  // ...其余不变
});
```

### 3. 创建 API 路由 `src/pages/api/visit.ts`

- `export const prerender = false`
- `POST /api/visit`：读取 SQLite 计数 +1，返回 `{ count }`
- `GET /api/visit`：读取当前计数，返回 `{ count }`
- SQLite 文件路径：`data/visits.db`（Docker 挂载持久化卷）
- 启动时自动建表：`CREATE TABLE IF NOT EXISTS visits (id INTEGER PRIMARY KEY, count INTEGER DEFAULT 0)`
- 单行设计：id=1，`UPDATE visits SET count = count + 1 RETURNING count`

### 4. 修改 Footer.astro

- 去掉 `process.env.DEPLOYED_AT` 逻辑
- 部署时间改为服务端启动时间 `const serverStartedAt = new Date()`
- 加入访问计数展示，拼在同一行：`deploy 2026-06-11 20:00 · 1234 次访问`
- 计数通过 `is:inline` 脚本 fetch `/api/visit` 异步获取，不阻塞首屏
- 请求失败静默降级，不显示计数

### 5. 修改 Dockerfile

从 Nginx 静态改为 Node.js 服务端：

```dockerfile
FROM --platform=$BUILDPLATFORM oven/bun:1.3.10-alpine AS builder

WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run check && bun run build

FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

RUN mkdir -p /app/data

EXPOSE 4321
CMD ["node", "dist/server/entry.mjs"]
```

### 6. 更新 docker-compose / 部署配置

- SQLite 数据目录挂载：`-v portfolio-data:/app/data`
- 端口映射：`4321:4321`
- Nginx 反代 `/api/*` 和 `/` 到 Node 服务

### 7. 更新 Nginx 配置

```nginx
server {
  listen 80;
  server_name _;

  location / {
    proxy_pass http://127.0.0.1:4321;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

## 涉及文件

- `astro.config.mjs` — 加 adapter、改 output
- `src/pages/api/visit.ts` — 新建 API 路由
- `src/components/Footer.astro` — 改部署时间 + 加计数展示
- `Dockerfile` — Nginx 改 Node.js
- `deploy/nginx.conf` — 改为反代模式
