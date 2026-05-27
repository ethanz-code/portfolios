---
title: "Cloudflare Workers：运行环境与 Response 对象"
description: "记录 Cloudflare Workers 的 Web 标准运行时，以及 Response 对象为什么不需要 import。"
publishedDate: "2026-05-23"
updatedDate: "2026-05-23"
tags:
  - "Cloudflare"
  - "Workers"
  - "Web API"
---

## Response 从哪里来？

`Response` 是 **Web 标准 API**（Fetch API）的一部分，在浏览器和 Cloudflare Workers 的运行时环境中都是**全局内置的**，不需要 import，直接用就行。

---

## 必须用 `new Response` 吗？

Cloudflare Workers 的 `fetch` 处理函数必须返回一个 `Response` 对象（或 `Promise<Response>`），否则会报错。但不一定非得用 `new Response`，有几种方式：

```javascript
// ✅ 1. 最常用：new Response
return new Response('Hello World!');

// ✅ 2. 带状态码和 headers
return new Response('Not Found', { status: 404 });

// ✅ 3. 返回 JSON
return Response.json({ ok: true });  // 静态方法，自动设置 Content-Type

// ✅ 4. 重定向
return Response.redirect('https://example.com', 301);

// ✅ 5. 转发别的请求的响应
const res = await fetch('https://api.example.com/data');
return res;  // fetch() 返回的本身就是 Response

// ❌ 不行：返回普通字符串
return 'Hello';  // 报错
```

---

## Cloudflare Workers ≠ Node.js

Cloudflare Workers 运行在自己的 Runtime，叫做 **workerd**，它是基于 **V8 引擎**（和 Chrome/Node 一样），但模拟的是**浏览器环境**，而不是 Node 环境。

```javascript
Chrome 浏览器       →  V8 + Web APIs (fetch, Response, Request...)
Node.js             →  V8 + Node APIs (fs, path, http, Buffer...)
Cloudflare Workers  →  V8 + Web APIs (和浏览器更像)
```

### 在 Workers 里有什么、没什么

**✅ 有（浏览器标准 API）：**

- `fetch()`、`Request`、`Response`
- `URL`、`URLSearchParams`
- `crypto`（Web Crypto API）
- `TextEncoder` / `TextDecoder`
- `setTimeout`（有限制）

**❌ 没有（Node.js 专属）：**

- `fs`（文件系统）
- `path`
- `process.env`（用 `env` 参数代替）
- `require()`（用 ESM `import` 代替）

---

## 为什么这样设计？

Cloudflare Workers 跑在**边缘节点**（全球 300+ 个数据中心），追求极致启动速度。Node.js 太重，浏览器 Web API 更轻量、标准化，所以选择对齐浏览器标准。

这个标准现在也叫 **WinterCG**，Deno、Bun 也在往这个方向靠拢。
