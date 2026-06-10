---
title: "Cloudflare Workers：运行环境与 Response 对象"
description: "记录 Cloudflare Workers 的 Web 标准运行时，以及 Response 对象为什么不需要 import。"
publishedDate: "2026-05-23"
updatedDate: "2026-06-09"
tags:
  - "Cloudflare"
  - "Workers"
  - "Web API"
---

<callout icon="📌" color="gray_bg">
	整理来源：[Cloudflare Workers 官方文档（developers.cloudflare.com/workers）](https://developers.cloudflare.com/workers/)、[WinterCG 规范（wintercg.org）](https://wintercg.org/) — 2026 年 6 月
</callout>
# Cloudflare Workers：运行环境与 Response 对象
---
## 一、Response 从哪里来
官方文档：[Cloudflare Workers Runtime APIs — Response](https://developers.cloudflare.com/workers/runtime-apis/response/)
`Response` 是 **Web 标准 Fetch API** 的一部分（[fetch.spec.whatwg.org](https://fetch.spec.whatwg.org/#response-class)），在浏览器和 Cloudflare Workers 的运行时环境中都是全局内置的，**不需要 import，直接用就行**。
---
## 二、必须用 new Response 吗
Cloudflare Workers 的 `fetch` 处理函数必须返回一个 `Response` 对象（或 `Promise<Response>`），否则会报错。但不一定非得用 `new Response`，有几种等效写法：
```javascript
// ✅ 1. 最常用：new Response
return new Response("Hello World!");

// ✅ 2. 带状态码和 headers
return new Response("Not Found", { status: 404 });

// ✅ 3. 返回 JSON（静态方法，自动设置 Content-Type: application/json）
return Response.json({ ok: true });

// ✅ 4. 重定向
return Response.redirect("https://example.com", 301);

// ✅ 5. 转发别的请求的响应
const res = await fetch("https://api.example.com/data");
return res;  // fetch() 返回的本身就是 Response

// ❌ 不行：返回普通字符串
return "Hello";  // 报错
```
---
## 三、Cloudflare Workers ≠ Node.js
官方文档：[Workers Runtime 说明](https://developers.cloudflare.com/workers/reference/runtime/)
Cloudflare Workers 运行在自己的 Runtime，叫做 `workerd`，它基于 V8 引擎（和 Chrome/Node 一样），但模拟的是**浏览器环境**，而不是 Node 环境。
```plain text
Chrome 浏览器       →  V8 + Web APIs (fetch, Response, Request...)
Node.js             →  V8 + Node APIs (fs, path, http, Buffer...)
Cloudflare Workers  →  V8 + Web APIs (和浏览器更像)
```
---
## 四、在 Workers 里有什么、没什么
<table header-row="true" header-column="false">
<tr>
<td>✅ 有（浏览器标准 API）</td>
<td>❌ 没有（Node.js 专属）</td>
</tr>
<tr>
<td>fetch()、Request、Response</td>
<td>fs（文件系统）</td>
</tr>
<tr>
<td>URL、URLSearchParams</td>
<td>path</td>
</tr>
<tr>
<td>crypto（Web Crypto API）</td>
<td>process.env（用 env 参数代替）</td>
</tr>
<tr>
<td>TextEncoder / TextDecoder</td>
<td>require()（用 ESM import 代替）</td>
</tr>
<tr>
<td>setTimeout（有限制）</td>
<td>http / net / stream 等 Node 核心模块</td>
</tr>
</table>
官方兼容性说明：[Workers 与 Node.js 兼容性文档](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)
---
## 五、为什么这样设计：WinterCG 标准
官方文档：[WinterCG 规范（wintercg.org）](https://wintercg.org/)
Cloudflare Workers 跑在边缘节点（全球 300+ 个数据中心），追求极致冷启动速度。Node.js 太重，浏览器 Web API 更轻量、标准化，所以选择对齐浏览器标准。
这个标准现在也叫 WinterCG（Web-interoperable Runtimes Community Group），Deno、Bun 也在往这个方向靠拢。
<table header-row="true" header-column="false">
<tr>
<td>Runtime</td>
<td>标准对齐方向</td>
</tr>
<tr>
<td>Cloudflare Workers（workerd）</td>
<td>Web APIs（WinterCG）</td>
</tr>
<tr>
<td>Deno</td>
<td>Web APIs（WinterCG）</td>
</tr>
<tr>
<td>Bun</td>
<td>Web APIs + Node.js 兼容层</td>
</tr>
<tr>
<td>Node.js</td>
<td>Node.js APIs（非 WinterCG）</td>
</tr>
</table>
---
## 六、常见开发注意事项
完整 API 参考：[Cloudflare Workers Runtime APIs](https://developers.cloudflare.com/workers/runtime-apis/)
- 环境变量：不用 `process.env`，而是通过 `export default { fetch(request, env) {} }` 的 `env` 参数访问，在 `wrangler.toml` 中配置
- KV 存储：[Workers KV 文档](https://developers.cloudflare.com/kv/)（全局低延迟键值存储，替代部分数据库需求）
- Durable Objects：[Durable Objects 文档](https://developers.cloudflare.com/durable-objects/)（有状态的边缘计算，适合需要一致性的场景）
- 限制：单个 Worker 请求 CPU 时间上限 **50ms（免费）/ 30s（付费）**，不适合长时间计算任务
---
<callout icon="🗓️" color="gray_bg">
	文档整理时间：2026 年 6 月  \|  来源：[Cloudflare Workers 官方文档](https://developers.cloudflare.com/workers/) / [WinterCG 规范](https://wintercg.org/)
</callout>
