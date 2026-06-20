# 08. 图片、public 静态资源与样式系统

## 相关文件

- `public/`
- `public/profile.jpg`
- `public/social_img.webp`
- `public/projects/sxeasy/home.webp`
- `src/assets/projects/sxeasy/`
- `src/assets/moments/`
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
- 需要稳定 URL 的文章正文配图和头图。
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

这个项目分两种图片来源：

- 组件和 MDX 里需要 Astro Image 优化的图片：从 `src/assets/` 直接 import。
- 普通 Markdown 正文图片、favicon、社交图：放在 `public/`，用根路径引用。

核心原则：`<Image />` 要拿到导入出来的图片对象，才能生成优化图片。字符串路径不会自动变成优化图片。

例如项目卡片直接导入截图：

```ts
import sxeasyHomeImage from "../assets/projects/sxeasy/home.webp";
import sxeasyHomeDarkImage from "../assets/projects/sxeasy/home-dark.webp";
```

## public 路径和 Astro Image 的关系

如果图片路径来自内容 frontmatter：

```yaml
heroImage: "/projects/sxeasy/home.webp"
```

组件拿到的是字符串：

```astro
<HorizontalCard img={project.data.heroImage} />
```

这类图片路径稳定，适合内容作者维护，但它只是字符串。

如果希望走 Astro Image 优化，就直接 import 图片对象，再传给组件：

```ts
import sxeasyHomeImage from "../assets/projects/sxeasy/home.webp";
```

`ThemeImageSource` 会判断 `src` 类型：导入图片对象走 `<Image />`，字符串路径退回普通 `<img>`。

## 项目截图的亮暗适配

项目卡片 frontmatter 可以写成对图片路径：

```yaml
heroImageLight: "/projects/sxeasy/home.webp"
heroImageDark: "/projects/sxeasy/home-dark.webp"
```

首页和项目列表会读取 `heroImageLight` / `heroImageDark`。如果页面代码直接导入了对应的 `src/assets` 图片对象，就走 Astro Image 优化；如果只传字符串路径，就按普通图片 URL 渲染。

项目详情页没有单独的 frontmatter 图集字段。正文截图写在 `.mdx` 里，直接导入图片对象并传给 `ArticleThemeImage`：

```mdx
import ArticleThemeImage from "../../components/ArticleThemeImage.astro";
import repositoryImage from "../../assets/projects/sxeasy/repository.webp";
import repositoryDarkImage from "../../assets/projects/sxeasy/repository-dark.webp";

<ArticleThemeImage
  light={repositoryImage}
  dark={repositoryDarkImage}
  alt="实习轻松办仓库概览截图"
/>
```

真正切换由 `ThemeImage.astro` 和全局 CSS 完成：

```css
[data-theme="light"] .theme-image-variant--dark,
[data-theme="black"] .theme-image-variant--light {
  display: none;
}
```

这意味着 light 和 dark 两张图都会输出到页面里，当前主题只显示其中一张。

当前 `sxeasy` 的图片分工：

- `home.webp` / `home-dark.webp`：首页卡片和项目列表卡片；`public/` 同名文件用于 frontmatter 稳定路径。
- `repository.webp` / `repository-dark.webp`：项目详情正文截图。
- `repository-commit.webp` / `repository-commit-dark.webp`：项目详情正文截图。

这些图片在页面或 MDX 里直接从 `src/assets/projects/sxeasy/` 导入，所以会生成 `_astro/` 优化产物。

## ImageMetadata 是谁提供的

在 Astro 组件或普通 TypeScript 模块里直接导入图片：

```ts
import homeImage from "./projects/sxeasy/home.webp";
```

拿到的不是字符串，而是 Astro/Vite 在构建期生成的图片元数据对象。它包含图片路径、宽高、格式等信息，类型可以直接写作 `ImageMetadata`。

注意：当前项目不从 `"astro"` 导入 `ImageMetadata`。Astro 类型环境会提供这个全局类型。

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

当前项目里，项目截图放 `src/assets/projects/` 并在使用处直接导入。图集源图片放 `src/assets/moments/`，让 Astro 在构建时自动处理。文章正文配图仍优先放 `public/articles/`，因为普通 `.md` 正文里的图片不会直接获得 `ImageMetadata`。

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
