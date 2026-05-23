# 08. 图片、public 静态资源与样式系统

## 相关文件

- `public/`
- `public/profile.jpg`
- `public/social_img.webp`
- `public/projects/sxeasy/home.webp`
- `src/assets/projects/sxeasy/`
- `src/assets/moments/`
- `src/assets/images.ts`
- `src/components/HorizontalCard.astro`
- `src/components/ThemeImage.astro`
- `src/components/ThemeImageSource.astro`
- `src/components/SideBar.astro`
- `src/styles/global.css`
- `tailwind.config.cjs`
- `astro.config.mjs`

## public 目录的规则

`public/` 下的文件会原样复制到站点根路径。

例如：

```text
public/profile.jpg
-> /profile.jpg

public/social_img.webp
-> /social_img.webp

public/projects/sxeasy/home.webp
-> /projects/sxeasy/home.webp
```

适合放：

- favicon。
- 头像。
- 社交分享图。
- 项目截图。
- 文章正文配图和头图。
- 不需要经过打包处理的静态文档。

这组学习文档也放在 `public/astro-tech-map/`，构建后可通过：

```text
/astro-tech-map/README.md
```

访问。

## Astro Image 怎么用

项目里用到了：

```astro
import { Image } from "astro:assets";
```

例如 `HorizontalCard.astro`：

```astro
<Image
  src={img}
  width={750}
  height={422}
  format="webp"
  alt={title}
  class="aspect-video w-full rounded-lg object-cover object-left-top md:w-[13rem]"
/>
```

作用：

- 明确图片尺寸。
- 输出优化后的图片。
- 保留 alt 文本。
- 配合 Tailwind 控制展示比例和裁剪。

## 当前项目的图片管线

这个项目同时保留两种路径：

- 内容里写稳定路径，例如 `/projects/sxeasy/home.webp`。
- 代码里把稳定路径映射到 `src/assets` 导入对象。

这样内容作者不用关心打包产物，页面组件仍然可以拿到 Astro Image 需要的 `ImageMetadata`。

核心入口是 `src/assets/images.ts`：

```ts
import sxeasyHomeImage from "./projects/sxeasy/home.webp";

const mappedImageSources = {
  "/projects/sxeasy/home.webp": sxeasyHomeImage,
} as const;

export const resolveImageSource = (src) => {
  if (!src) return undefined;
  if (typeof src !== "string") return src;
  return mappedImageSources[src] ?? src;
};
```

页面先调用 `resolveImageSource()`。如果命中映射，返回 `ImageMetadata`，走 `<Image />` 优化；如果没有命中，仍然按普通字符串路径输出 `<img>`。

## public 路径和 Astro Image 的关系

如果图片路径来自内容 frontmatter：

```yaml
coverImage: "/projects/sxeasy/home.webp"
```

组件拿到的是字符串：

```astro
<HorizontalCard img={project.data.coverImage} />
```

这类图片路径稳定，适合内容作者维护。

如果希望稳定路径也走 Astro Image 优化，需要同时放一份到 `src/assets`，并在 `src/assets/images.ts` 建一层映射：

```ts
import sxeasyHomeImage from "./projects/sxeasy/home.webp";

const mappedImageSources = {
  "/projects/sxeasy/home.webp": sxeasyHomeImage,
} as const;
```

页面仍然写 `/projects/sxeasy/home.webp`，组件渲染前先调用 `resolveImageSource()`。如果路径被映射到 `src/assets` 导入对象，`ThemeImageSource` 会使用 Astro 的 `<Image />`；如果没有映射，就退回普通 `<img>`。

## 项目截图的亮暗适配

项目内容支持成对图片：

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

首页和项目列表使用 `coverImageLight` / `coverImageDark`，项目详情页顶部使用 `heroImageLight` / `heroImageDark`，详情页正文截图使用 `images`。

真正切换由 `ThemeImage.astro` 和全局 CSS 完成：

```css
[data-theme="light"] .theme-image-variant--dark,
[data-theme="black"] .theme-image-variant--light {
  display: none;
}
```

这意味着 light 和 dark 两张图都会输出到页面里，当前主题只显示其中一张。

当前 `sxeasy` 的图片分工：

- `home.webp` / `home-dark.webp`：首页卡片、项目列表卡片、项目详情顶部截图。
- `dashboard.webp` / `dashboard-dark.webp`：项目详情页正文后的运行截图。

这些路径都已经映射到 `src/assets/projects/sxeasy/`，所以会生成 `_astro/` 优化产物。

## ImageMetadata 是谁提供的

在 Astro 组件或普通 TypeScript 模块里直接导入图片：

```ts
import homeImage from "./projects/sxeasy/home.webp";
```

拿到的不是字符串，而是 Astro/Vite 在构建期生成的图片元数据对象。它包含图片路径、宽高、格式等信息，类型通常写作 `ImageMetadata`。

`<Image />` 收到这个对象后，才能生成带指纹、尺寸、`srcset` 和格式处理的优化图片。普通 Markdown 里的 `![图](/path.webp)` 或 HTML `<img src="/path.webp">` 不会自动获得这层优化。

## Tailwind 怎么接入 Astro

`astro.config.mjs`：

```js
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  integrations: [tailwind()],
});
```

页面里直接写 class：

```astro
<main class="mx-auto w-full max-w-5xl px-6 pb-12 pt-10 lg:px-12">
```

Astro 构建时会处理这些样式。

## DaisyUI 在项目里的角色

项目使用 DaisyUI 的组件 class：

```astro
<a class="btn btn-outline btn-sm">返回文章</a>
<span class="badge badge-outline">复盘</span>
<div class="drawer lg:drawer-open">...</div>
<div class="navbar">...</div>
```

DaisyUI 提供的是一套基于 Tailwind 的组件语义。

好处：

- 按钮、徽章、导航、抽屉不用从零写。
- 主题变量可以统一影响组件。
- 保持当前项目已有视觉语言。

## Typography 插件为什么重要

文章详情页和项目详情页用了：

```astro
<article class="prose prose-lg max-w-none">
```

`prose` 来自 `@tailwindcss/typography`。

它负责 Markdown 正文排版：

- 标题间距。
- 段落行高。
- 列表样式。
- 图片样式。
- 代码块基础样式。

没有它，Markdown 正文会更像裸 HTML。

## global.css 做了什么

`src/styles/global.css` 里定义了：

- 中文字体栈。
- 字体渲染优化。
- DaisyUI 圆角变量。
- 时间线最后一段线条隐藏。

例如：

```css
[data-theme="light"],
[data-theme="black"] {
  --rounded-box: 0;
  --rounded-btn: 0.2rem;
  --rounded-badge: 0;
  --tab-radius: 0;
}
```

这比逐个按钮改 class 更适合全站统一。

## 什么时候放 public，什么时候放 src

放 `public/`：

- 内容图片路径需要稳定。
- Markdown frontmatter 要直接引用。
- favicon、头像、社交图。
- 静态下载文件或文档。

放 `src/`：

- 组件私有资产。
- 希望被构建工具分析、压缩、指纹化。
- 和组件强绑定的图片或资源。
- 希望在构建时自动扫描的图片目录。

当前项目里，项目截图采用“内容稳定路径 + `src/assets` 映射”的方式。图集源图片放 `src/assets/moments/`，让 Astro 在构建时自动处理。文章正文配图仍优先放 `public/articles/`，因为普通 `.md` 正文里的图片不会直接获得 `ImageMetadata`。

## 当前项目的图集目录怎么组织

图集页面读取的是 `src/assets/moments/`：

```text
src/assets/moments/
  recent/
    01.jpg
    02.webp
  trip-2026-05/
    cover.jpg
```

规则很简单：

- 每个子文件夹就是一组图片。
- 支持 `jpg`、`jpeg`、`png`、`webp`、`avif`。
- 分组标题、日期、说明、排序写在 `src/data/moments.ts` 的 `momentGroupInfo`。

如果只加图片不加组信息，页面也能显示，只是会直接用文件夹名生成标题。

`public/moments/` 现在只保留说明文件，不再作为页面图片来源。

## 文章正文里的本地图片怎么引用

正文配图同样建议放在 `public/` 下，例如：

```text
public/articles/demo.webp
```

在 Markdown 里直接写：

```md
![示意图](/articles/demo.webp)
```

这和 frontmatter 里的 `heroImage: "/articles/demo.webp"` 是同一套路径规则。

## 可以动手试的事

1. 放一张图片到 `public/articles/demo.webp`。
2. 在文章 frontmatter 加 `heroImage: "/articles/demo.webp"`。
3. 构建并打开文章详情页。
4. 修改 `--rounded-btn`，观察所有按钮圆角变化。
5. 移除 `prose` class，观察 Markdown 正文排版变化。

## 这一节要掌握的关键词

- `public/`
- `astro:assets`
- `Image`
- Tailwind integration
- DaisyUI
- `prose`
- `@tailwindcss/typography`
- `global.css`
- CSS variables
