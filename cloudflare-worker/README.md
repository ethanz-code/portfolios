# newtab-meta-proxy

new-tab 页面的元数据代理，部署在 Cloudflare Workers，自定义域 `meta.itcox.cn`。

## 作用

给 `src/pages/new-tab.astro` 的快捷方式功能做 CORS 转发：

- 抓取站点 HTML，解析标题、描述、图标候选；
- 转发站点图标等静态资源。

用法：`GET https://meta.itcox.cn/?url=<encodeURIComponent(目标地址)>`

## 防护

仅 GET、仅 http/https、拦截内网/环回地址（SSRF）、上游 9 秒超时、响应带 CORS 头与 1 小时边缘缓存。

## 部署

```sh
cd cloudflare-worker && wrangler deploy
```

依赖 `wrangler login` 的 OAuth 登录（当前为 hi@itcox.cn）。源码见 `newtab-meta-proxy.js`，路由配置见 `wrangler.toml`；2026-10-09 首次部署，替换原先使用的免费公共代理 proxy.scalar.com。
