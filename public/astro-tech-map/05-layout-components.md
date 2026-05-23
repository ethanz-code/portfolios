# 05. Layout、组件与 slot

## 相关文件

- `src/layouts/BaseLayout.astro`
- `src/components/BaseHead.astro`
- `src/components/Header.astro`
- `src/components/SideBar.astro`
- `src/components/SideBarMenu.astro`
- `src/data/navigation.ts`
- `src/components/Footer.astro`
- `src/components/HorizontalCard.astro`
- `src/components/ThemeToggle.astro`

## Astro 组件长什么样

`.astro` 文件通常分两部分：

```astro
---
const { title } = Astro.props;
---

<h1>{title}</h1>
```

上面 `---` 之间是组件脚本。下面是模板。

组件脚本里可以：

- import 组件。
- import 数据。
- 读取 `Astro.props`。
- 处理数组、日期、字符串。
- await 异步数据。

模板里可以：

- 写 HTML。
- 使用组件。
- 插入变量。
- 用 `{condition && ...}` 条件渲染。
- 用 `{items.map(...)}` 循环渲染。

## BaseLayout 的责任

`src/layouts/BaseLayout.astro` 是全站基础布局。

它负责：

- HTML 文档结构。
- `<head>` 元信息。
- Header。
- Sidebar。
- Footer。
- 主内容容器。
- 主题切换。
- View Transitions。

页面只需要把自己的内容放进去：

```astro
<BaseLayout title="文章" description="张永鑫的文章、复盘和随手记录。">
  <section>文章列表</section>
</BaseLayout>
```

## slot 是什么

`BaseLayout` 里有：

```astro
<main class="mx-auto w-full max-w-5xl px-6 pb-12 pt-10 lg:px-12 lg:pb-16 lg:pt-16">
  <slot />
</main>
```

`<slot />` 表示接收页面传进来的内容。

也就是说：

```astro
<BaseLayout>
  <div>这里是页面内容</div>
</BaseLayout>
```

会被放进 layout 的 `<slot />` 位置。

## Astro.props 怎么用

`BaseLayout` 接收这些参数：

```ts
const {
  image,
  title = SITE_TITLE,
  description = SITE_DESCRIPTION,
  includeSidebar = true,
  sideBarActiveItemID,
  ogType,
} = Astro.props;
```

页面可以传：

```astro
<BaseLayout
  title={article.title}
  description={article.description}
  image={article.heroImage}
  sideBarActiveItemID="articles"
  ogType="article"
>
```

作用：

- `title`：页面标题。
- `description`：页面描述。
- `image`：分享图。
- `sideBarActiveItemID`：侧边栏高亮。
- `ogType`：Open Graph 类型。
- `includeSidebar`：是否显示侧边栏。

## 侧边栏高亮怎么做

导航数据定义在 `src/data/navigation.ts`：

```ts
export const primaryNavItems = [
  { id: "home", label: "首页", href: "/" },
  { id: "projects", label: "项目", href: "/projects" },
  { id: "articles", label: "文章", href: "/articles" },
];
```

页面传：

```astro
<BaseLayout sideBarActiveItemID="articles">
```

`SideBarMenu.astro` 里根据 `item.id === sideBarActiveItemID` 加 active class：

```astro
<a class:list={["py-3 text-base", item.id === sideBarActiveItemID && activeClass]} href={item.href}>
  {item.label}
</a>
```

这是一个简单直接的当前菜单高亮方式：导航项和页面高亮 id 分开维护，但都走同一份数据结构。

## Header 和 Sidebar 的关系

移动端：

- 使用顶部 `Header`。
- 左侧菜单通过 drawer 打开。
- 主题切换按钮在 Header 右侧。

桌面端：

- Sidebar 常驻左侧。
- Header 隐藏。
- 主题切换固定在右上角。

这些都在 `BaseLayout` 和相关组件里通过 Tailwind/DaisyUI class 实现。

## HorizontalCard 的复用

`HorizontalCard.astro` 用于项目、服务等横向卡片。

它接收：

```ts
const { title, img, desc, url, badge, tags, target = "_blank" } = Astro.props;
```

好处：

- 项目页不用重复写卡片结构。
- 首页和项目页可以复用。
- 后续调整卡片样式，只改一个组件。

## 什么时候拆组件

适合拆组件：

- 多个页面重复使用。
- 结构较长，影响页面阅读。
- 有明确输入参数。
- 未来可能统一调整。

不必拆组件：

- 只出现一次。
- 拆出去反而让阅读跳转变多。
- 没有清晰边界。

这个项目当前拆得比较克制。页面内容仍然留在页面文件里，导航、卡片、布局、页脚这些高复用结构才拆成组件。

## 可以动手试的事

1. 在 `src/data/navigation.ts` 增加一个导航项。
2. 给对应页面传 `sideBarActiveItemID`。
3. 在 `HorizontalCard.astro` 增加一个可选字段。
4. 看首页和项目页是否都能复用新字段。

## 这一节要掌握的关键词

- `.astro` 组件
- component script
- template
- `Astro.props`
- `<slot />`
- layout
- props 默认值
- 组件复用
