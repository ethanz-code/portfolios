# 01. 项目配置与构建

## 相关文件

- `package.json`
- `astro.config.mjs`
- `tsconfig.json`
- `src/env.d.ts`

## 这个项目怎么启动

常用命令在 `package.json` 里：

```json
{
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  }
}
```

含义：

- `bun run dev`：本地开发，启动 Astro 开发服务器。
- `bun run build`：构建静态站点，输出到 `dist/`。
- `bun run preview`：预览构建后的静态产物。
- `bun run astro`：直接调用 Astro CLI。

## Astro 配置

当前 `astro.config.mjs`：

```js
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://astrofy-template.netlify.app",
  integrations: [tailwind()],
});
```

这里有两个重点：

- `site`：站点基础 URL。
- `integrations`：Astro 插件系统，这里接入了 Tailwind。

## `site` 有什么用

`site` 不只是备注。它会影响这些场景：

- 生成绝对 URL。
- 生成 canonical 链接。
- 生成 sitemap 或 RSS 时作为站点根地址。
- Open Graph 图片、文章链接等需要完整 URL 的地方。

当前项目里的 `BaseHead.astro` 使用了：

```astro
<meta property="og:url" content={Astro.url} />
<meta property="og:image" content={new URL(image, Astro.url)} />
```

如果以后正式部署到自己的域名，`site` 应该改成真实域名。

## 构建输出是什么

Astro 默认输出静态文件。构建后会看到：

```text
dist/
  index.html
  articles/index.html
  articles/start-here/index.html
  projects/index.html
  projects/sxeasy/index.html
  ...
```

这说明站点可以部署到静态托管平台：

- Netlify
- Vercel
- Cloudflare Pages
- Nginx 静态目录
- GitHub Pages

## 这个项目不是运行时应用

当前项目没有：

- 服务端数据库查询。
- 登录态。
- API 路由。
- SSR 页面请求时渲染。

它的主要逻辑发生在构建期：

1. 读取 `src/pages/`。
2. 读取 `src/content/`。
3. 渲染 `.astro` 和 Markdown。
4. 生成 `dist/` 静态文件。

## 可以动手试的事

1. 执行 `bun run build`。
2. 看构建日志里生成了哪些页面。
3. 打开 `dist/articles/start-here/index.html`。
4. 修改 `astro.config.mjs` 的 `site`，观察 `BaseHead` 生成的 URL 会怎么变。

## 这一节要掌握的关键词

- `astro dev`
- `astro build`
- `astro preview`
- `defineConfig`
- `integrations`
- `site`
- `dist/`
