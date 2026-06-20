# 09. 动手练习路线

这份路线不是泛泛学 Astro，而是围绕当前项目练。

## 练习 1：新增一篇文章

目标：掌握 Markdown 发文和 Content Collections。

步骤：

1. 新建文件：

```text
src/content/articles/astro-routing-note.md
```

2. 写入：

```md
---
title: "Astro 文件路由笔记"
description: "用当前作品集项目理解 Astro 文件路由和动态路由。"
publishedDate: "2026-05-21"
tags:
  - "Astro"
  - "学习"
---

Astro 的路由来自文件结构。

这让我维护个人站时不用单独维护路由表。
```

3. 执行：

```bash
bun run build
```

4. 检查构建日志是否生成：

```text
/articles/astro-routing-note/index.html
```

掌握点：

- 文件名和 URL 的关系。
- frontmatter 和页面展示的关系。
- `getCollection()` 如何读取内容。

## 练习 2：让文章暂不发布

目标：理解草稿过滤。

步骤：

1. 给文章加：

```yaml
draft: true
```

2. 执行：

```bash
bun run build
```

3. 确认构建日志里没有这篇文章详情页。

掌握点：

- schema 默认值。
- 列表页过滤。
- 详情页生成过滤。

## 练习 3：新增一个静态页面

目标：掌握文件路由。

步骤：

1. 新建：

```text
src/pages/uses.astro
```

2. 写入：

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
---

<BaseLayout title="工具" description="我常用的开发和学习工具。">
  <h1 class="text-4xl font-bold">工具</h1>
  <p class="mt-4 leading-8 opacity-80">这里记录我正在使用的工具。</p>
</BaseLayout>
```

3. 打开：

```text
/uses
```

掌握点：

- 新增页面不需要写路由配置。
- 页面可以直接复用 `BaseLayout`。

## 练习 4：把新页面加入侧边栏

目标：理解组件和 props。

步骤：

1. 修改 `src/data/navigation.ts`：

```ts
primaryNavItems.push({
  id: "uses",
  label: "工具",
  href: "/uses",
});
```

2. 修改 `src/pages/uses.astro`：

```astro
<BaseLayout title="工具" description="我常用的开发和学习工具。" sideBarActiveItemID="uses">
```

掌握点：

- 导航是组件。
- 当前菜单高亮依赖 `sideBarActiveItemID`。
- 页面通过 props 影响 layout 和组件行为。

## 练习 5：给文章加头图

目标：理解 public 静态资源和 Open Graph 图片。

步骤：

1. 放图片：

```text
public/articles/astro-routing.webp
```

2. 修改文章 frontmatter：

```yaml
heroImage: "/articles/astro-routing.webp"
```

3. 打开文章详情页，检查页面 `<head>` 里的 Open Graph 图片。

掌握点：

- `public/` 文件映射到根路径。
- frontmatter 可以保存图片路径。
- 详情页把 `heroImage` 用于 SEO 和分享卡片，不额外渲染可见头图。

## 练习 6：故意写错 schema

目标：理解构建期校验。

步骤：

1. 把 `tags` 改成错误格式：

```yaml
tags: "Astro"
```

2. 执行：

```bash
bun run build
```

3. 看 Astro 报错。

4. 改回正确格式：

```yaml
tags:
  - "Astro"
```

掌握点：

- Content Collections 会校验 frontmatter。
- 构建错误比线上错误更早暴露。

## 练习 7：新增项目详情页

目标：理解项目集合和动态路由。

步骤：

1. 新建：

```text
src/content/projects/demo-project.md
```

2. 写入：

```md
---
title: "Demo 项目"
description: "用来练习项目详情页生成的示例项目。"
badge: "练习"
updatedDate: "2026-05-21"
category: "featured"
order: 99
detailPage: true
tags:
  - "Astro"
---

这是一个练习项目。
```

3. 执行构建，确认生成：

```text
/projects/demo-project/
```

掌握点：

- `detailPage: true` 才生成项目详情页。
- `order` 控制列表排序。
- `category` 控制分组。

## 练习 8：关闭页面过渡

目标：理解配置开关和 ClientRouter。

步骤：

1. 修改 `src/config.ts`：

```ts
export const TRANSITION_API = false;
```

2. 启动开发服务：

```bash
bun run dev
```

3. 切换页面，观察页面过渡变化。

掌握点：

- 配置可以影响 layout 行为。
- ClientRouter 是增强体验，不是页面内容的必要条件。

## 练习 9：调整全站按钮圆角

目标：理解 DaisyUI 主题变量。

步骤：

1. 修改 `src/styles/global.css`：

```css
--rounded-btn: 0.5rem;
```

2. 刷新页面。

3. 观察所有按钮变化。

掌握点：

- 全局变量比逐个 class 更适合统一风格。
- DaisyUI 组件受主题变量影响。

## 练习 10：检查 SEO 输出

目标：理解 `BaseHead`。

步骤：

1. 执行：

```bash
bun run build
```

2. 打开：

```text
dist/articles/start-here/index.html
```

3. 搜索：

```text
og:title
og:description
og:image
```

掌握点：

- 页面 props 会进入 head。
- frontmatter 不只服务正文，也服务 SEO 和分享。

## 建议学习节奏

第一轮只跑通：

1. 新增文章。
2. 新增页面。
3. 新增项目详情。

第二轮再看：

1. Content Collections schema。
2. BaseLayout。
3. BaseHead。

第三轮再改：

1. 主题切换。
2. ClientRouter。
3. 样式系统。

不要一开始就追完所有 Astro API。先把这个项目从“能维护”变成“能解释”，再考虑扩展 RSS、标签页、搜索或 MDX。
