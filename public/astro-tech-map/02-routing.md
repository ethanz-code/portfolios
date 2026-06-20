# 02. 文件路由与动态路由

## 相关文件

- `src/pages/index.astro`
- `src/pages/articles.astro`
- `src/pages/projects.astro`
- `src/pages/articles/[slug].astro`
- `src/pages/projects/[slug].astro`
- `src/components/ContentEntryDetail.astro`
- `src/pages/404.astro`

## 文件路由是什么

Astro 会根据 `src/pages/` 里的文件自动生成路由。

当前项目：

```text
src/pages/index.astro       -> /
src/pages/articles.astro    -> /articles
src/pages/projects.astro    -> /projects
src/pages/moments.astro     -> /moments
src/pages/contact.astro     -> /contact
src/pages/404.astro         -> /404
```

不用额外写路由表。创建页面文件，就创建了对应页面。

## `index.astro` 的规则

`index.astro` 表示当前目录的首页。

例如：

```text
src/pages/index.astro
-> /
```

如果有：

```text
src/pages/articles/index.astro
-> /articles
```

当前项目用的是 `src/pages/articles.astro`，效果也是 `/articles`。

## 动态路由是什么

文件名里的 `[slug]` 表示动态片段：

```text
src/pages/articles/[slug].astro
-> /articles/:slug

src/pages/projects/[slug].astro
-> /projects/:slug
```

但这个项目是静态站，不是在用户访问时临时查询数据。它需要在构建时把所有 slug 都列出来。

这就是 `getStaticPaths()` 的作用。

## 详情页怎么生成

文章和项目各自保留明确的路由入口，详情模板共用 `src/components/ContentEntryDetail.astro`。

`src/pages/articles/[slug].astro`：

```ts
import { getContentEntryRouteParams } from "../../lib/content-routes";

export async function getStaticPaths() {
  const articleEntries = await getCollection("articles");

  return articleEntries
    .filter((entry) => !entry.data.draft)
    .map((entry) => ({
      params: getContentEntryRouteParams(entry),
      props: { entry },
    }));
}
```

这里做了四件事：

1. 读取 `articles` 内容集合。
2. 过滤掉 `draft: true` 的文章。
3. 用统一的 `getContentEntryRouteParams(entry)` 生成 `[slug]` 路由参数。
4. 把整篇文章 entry 传给共享详情组件。

如果有文件：

```text
src/content/articles/start-here.md
```

构建后会生成：

```text
/articles/start-here/
```

## 项目详情页怎么生成

项目详情页也是同一个动态路由生成的，只是多了一个条件：

```ts
.filter((entry) => entry.data.detailPage)
```

含义是：

- `detailPage: true` 的项目生成详情页。
- 其他项目可以只在列表里展示，并跳到外部链接。

这适合项目作品集。不是每个项目都值得写完整复盘。

## `params` 和 `props` 的区别

```ts
{
  params: getContentEntryRouteParams(entry),
  props: { entry },
}
```

`params` 决定 URL：

```text
/articles/start-here/
```

`props` 决定页面里能拿到什么：

```ts
const { entry } = Astro.props;
```

可以理解为：

- `params` 给路由系统用。
- `props` 给页面模板用。

## 页面列表怎么跳到详情

`src/pages/articles.astro`：

```astro
<a href={getContentEntryPath("articles", article)}>
  ...
</a>
```

列表页和详情页靠同一个 `slug` 串起来。

这里的 `slug` 指的是 `articles/[slug].astro` 或 `projects/[slug].astro` 里的动态路由片段，不是额外的页面模板。

## 常见坑

### 1. 新增 Markdown 但页面没生成

检查：

- 文件是否放在 `src/content/articles/`。
- frontmatter 是否符合 schema。
- 是否写了 `draft: true`。
- `bun run build` 是否报错。

### 2. 中文文件名作为 URL

技术上可能可行，但不建议。这个项目更适合用稳定英文文件名：

```text
good:  start-here.md
good:  sxeasy-review.md
avoid: 从这里开始记录.md
```

中文标题放在 frontmatter 的 `title` 里。

### 3. 动态路由没有 `getStaticPaths()`

静态构建时，Astro 不知道要生成哪些动态页面，所以两个 `[slug].astro` 都必须提供 `getStaticPaths()`。

## 可以动手试的事

1. 新建 `src/content/articles/test-note.md`。
2. 写完整 frontmatter。
3. 执行 `bun run build`。
4. 看构建日志里是否出现 `/articles/test-note/index.html`。
5. 给文章加 `draft: true`，再构建一次，观察页面是否消失。

## 这一节要掌握的关键词

- `src/pages`
- 文件路由
- `index.astro`
- `[slug].astro`
- `getStaticPaths`
- `params`
- `props`
- `Astro.props`
