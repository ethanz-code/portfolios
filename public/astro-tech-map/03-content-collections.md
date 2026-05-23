# 03. Content Collections 内容集合

## 相关文件

- `src/content/config.ts`
- `src/content/articles/start-here.md`
- `src/content/projects/sxeasy.md`
- `src/pages/articles.astro`
- `src/pages/articles/[slug].astro`
- `src/pages/projects.astro`
- `src/pages/projects/[slug].astro`

## 这个项目为什么用 Content Collections

文章和项目不是普通页面。它们有共同字段：

- 标题
- 摘要
- 日期
- 标签
- 封面图
- 亮暗主题截图
- 是否草稿
- 是否生成详情页

如果每篇都手写页面，后期很难维护。

Content Collections 的作用是：

1. 把 Markdown 内容组织成集合。
2. 给 frontmatter 加类型校验。
3. 让页面可以用 `getCollection()` 读取内容。
4. 构建时发现字段错误。

## 当前有哪些集合

`src/content/config.ts`：

```ts
export const collections = {
  projects: projectCollection,
  articles: articleCollection,
};
```

对应目录：

```text
src/content/articles/
src/content/projects/
```

集合名必须和目录名对应。

## 文章集合 schema

```ts
const articleSchema = z.object({
  title: z.string(),
  description: z.string(),
  publishedDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string()).optional(),
  heroImage: z.string().optional(),
  draft: z.boolean().default(false),
});
```

字段说明：

- `title`：文章标题，列表页和详情页都会展示。
- `description`：一句话摘要，也会进入 meta description。
- `publishedDate`：发布时间，必填。
- `updatedDate`：更新时间，可选。
- `tags`：标签，可选。
- `heroImage`：头图，可选，路径一般来自 `public/`。
- `draft`：是否草稿，默认 `false`。

## 项目集合 schema

```ts
const projectImageSchema = z.object({
  light: z.string(),
  dark: z.string().optional(),
  alt: z.string(),
  caption: z.string().optional(),
});

const projectSchema = z.object({
  title: z.string(),
  description: z.string(),
  badge: z.string(),
  updatedDate: z.coerce.date(),
  category: z.enum(["featured", "content"]),
  order: z.number(),
  heroImage: z.string().optional(),
  heroImageLight: z.string().optional(),
  heroImageDark: z.string().optional(),
  coverImage: z.string().optional(),
  coverImageLight: z.string().optional(),
  coverImageDark: z.string().optional(),
  externalUrl: z.string().optional(),
  detailPage: z.boolean().default(false),
  links: z.array(projectLinkSchema).optional(),
  images: z.array(projectImageSchema).optional(),
  tags: z.array(z.string()).optional(),
});
```

字段说明：

- `category`：项目分组，目前是重点项目和内容类项目。
- `order`：列表排序。
- `heroImageLight` / `heroImageDark`：项目详情页顶部截图，支持亮暗主题。
- `coverImageLight` / `coverImageDark`：首页和项目列表卡片截图，支持亮暗主题。
- `externalUrl`：没有详情页时跳外链。
- `detailPage`：是否生成 `/projects/slug/` 详情页。
- `links`：项目相关链接。
- `images`：项目详情正文后的截图数组，可写多张亮暗成对截图。
- `tags`：项目标签。

项目截图推荐写在 frontmatter，而不是在 Markdown 正文里手写 `<img>`。这样页面模板可以统一走 `ThemeImage` 和 Astro Image 优化。

示例：

```yaml
heroImageLight: "/projects/sxeasy/home.webp"
heroImageDark: "/projects/sxeasy/home-dark.webp"
coverImageLight: "/projects/sxeasy/home.webp"
coverImageDark: "/projects/sxeasy/home-dark.webp"
images:
  - light: "/projects/sxeasy/dashboard.webp"
    dark: "/projects/sxeasy/dashboard-dark.webp"
    alt: "实习轻松办用户端运行截图"
    caption: "用户端：签到、周报、进度和业务入口"
```

## 为什么用 `z.coerce.date()`

Markdown frontmatter 里的日期通常是字符串：

```yaml
publishedDate: "2026-05-21"
```

`z.coerce.date()` 会把它转成 Date 对象，这样页面里可以直接排序：

```ts
.sort((a, b) => b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf())
```

如果用 `z.string()`，排序前还要自己转换。

## 为什么导出类型

```ts
export type ProjectSchema = z.infer<typeof projectSchema>;
export type ArticleSchema = z.infer<typeof articleSchema>;
```

详情页里使用：

```ts
const article: ArticleSchema = entry.data;
```

好处：

- 页面里有类型提示。
- 字段改名后更容易发现引用错误。
- 读代码时知道数据结构来自 schema。

## 读取集合内容

列表页：

```ts
const articles = (await getCollection("articles"))
  .filter((article) => !article.data.draft)
  .sort((a, b) => b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf());
```

详情页：

```ts
const articleEntries = await getCollection("articles");
```

`getCollection()` 返回的 entry 包含：

- `entry.data`：frontmatter。
- `entry.slug`：文件名生成的 slug。
- `entry.render()`：渲染 Markdown 正文。

## 渲染 Markdown 正文

详情页：

```ts
const { Content } = await entry.render();
```

模板里：

```astro
<Content />
```

这样 Markdown 正文就会被渲染到页面里。

## schema 带来的错误提醒

如果文章缺少 `description`：

```md
---
title: "标题"
publishedDate: "2026-05-21"
---
```

构建时会报错。这个错误比上线后页面空白更早暴露。

如果 `tags` 写成字符串：

```yaml
tags: "复盘"
```

也会报错，因为 schema 要求的是字符串数组。

正确写法：

```yaml
tags:
  - "复盘"
```

## 可以动手试的事

1. 故意删掉一篇文章的 `description`。
2. 执行 `bun run build`。
3. 看 Astro 如何提示内容字段错误。
4. 修复字段，再构建一次。

## 这一节要掌握的关键词

- Content Collections
- `src/content/config.ts`
- `defineCollection`
- `zod`
- `getCollection`
- `entry.data`
- `entry.slug`
- `entry.render`
