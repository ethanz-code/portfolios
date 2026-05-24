# 04. Markdown 发文流程

## 相关文件

- `src/content/articles/`
- `src/pages/articles.astro`
- `src/pages/articles/[slug].astro`
- `src/content.config.ts`
- `src/components/ArticleThemeImage.astro`
- `astro.config.mjs`

## 最短发文流程

新增一篇文章，只需要在 `src/content/articles/` 里添加 Markdown 或 MDX 文件。

示例：

```text
src/content/articles/my-first-note.md
```

内容：

```md
---
title: "我的第一篇记录"
description: "记录一次具体判断，而不是写泛泛总结。"
publishedDate: "2026-05-21"
tags:
  - "记录"
  - "复盘"
---

今天想清楚了一件事。

先把事实写下来，再写判断，最后写下一步动作。
```

构建后地址是：

```text
/articles/my-first-note/
```

## frontmatter 是什么

Markdown 顶部的 `---` 区域叫 frontmatter：

```yaml
---
title: "我的第一篇记录"
description: "记录一次具体判断，而不是写泛泛总结。"
publishedDate: "2026-05-21"
---
```

它不是正文，而是文章元数据。

这个项目会把它用于：

- 文章列表标题。
- 文章摘要。
- 发布时间。
- 标签。
- SEO 描述。
- Open Graph 信息。

## 文件名和标题的关系

文件名决定 URL：

```text
my-first-note.md
-> /articles/my-first-note/
```

标题决定页面展示：

```yaml
title: "我的第一篇记录"
```

建议：

- 文件名用英文、数字和短横线。
- 标题用自然中文。
- 不要依赖中文标题生成 URL。

好例子：

```text
sxeasy-launch-review.md
weekly-training-note.md
astro-content-collections.md
```

不建议：

```text
实习轻松办上线复盘.md
今天随便想想.md
```

## 草稿机制

文章 schema 里有：

```ts
draft: z.boolean().default(false)
```

列表页和详情页都过滤了草稿：

```ts
.filter((article) => !article.data.draft)
```

如果暂时不想发布：

```yaml
draft: true
```

草稿不会出现在：

- `/articles`
- `/articles/slug/`
- 构建生成的静态页面

## 更新时间

如果文章后来修改，可以加：

```yaml
updatedDate: "2026-06-01"
```

详情页会显示：

```text
发布于 2026年5月21日 · 更新于 2026年6月1日
```

如果不写 `updatedDate`，就只显示发布时间。

## 标签怎么用

标签是数组：

```yaml
tags:
  - "Astro"
  - "复盘"
  - "独立开发"
```

当前项目只做展示，没有做标签聚合页。

以后可以扩展：

- `/articles/tags/astro/`
- 标签筛选。
- 标签云。
- RSS 分类。

## 头图怎么用

如果需要头图：

```yaml
heroImage: "/projects/sxeasy/home.webp"
```

图片放在 `public/` 下：

```text
public/projects/sxeasy/home.webp
-> /projects/sxeasy/home.webp
```

文章详情页会读取 `heroImage` 并展示。

## 正文怎么写

普通 Markdown 都可以：

```md
## 背景

这次问题来自一个真实需求。

## 做法

- 先判断是否值得做。
- 再跑通最短闭环。
- 最后看数据是否支持继续投入。

## 结论

短期看交付，长期看维护成本。
```

因为详情页用了 `prose` class，正文会自动获得较好的排版。项目还增强了 Markdown 管线：代码块、数学公式、Mermaid 流程图和标题锚点都优先在 `.md` 里完成。

## 正文里怎么引用本地图片

这个项目的文章是普通 Markdown，最稳妥的做法是把配图放在 `public/` 下，再用根路径引用。

例如放这里：

```text
public/articles/astro-routing.webp
```

正文里这样写：

```md
![Astro 路由示意图](/articles/astro-routing.webp)
```

如果是文章头图，继续写在 frontmatter 里：

```yaml
heroImage: "/articles/astro-routing.webp"
```

这样正文插图和头图都走同一套静态资源路径，后续维护最省事。

## 正文里怎么写亮暗模式图片

如果文章只需要普通图片，用 `.md` 足够。

如果正文里要插入亮暗模式图片、可复用组件或更复杂的展示块，用 `.mdx`：

```text
src/content/articles/sxeasy-image-note.mdx
```

正文里导入组件：

```mdx
import ArticleThemeImage from "../../components/ArticleThemeImage.astro";

<ArticleThemeImage
  light="/projects/sxeasy/home.webp"
  dark="/projects/sxeasy/home-dark.webp"
  alt="实习轻松办首页截图"
  caption="首页截图会跟随亮暗主题切换。"
/>
```

`ArticleThemeImage` 内部会复用项目图片表里的 `ImageMetadata`，能匹配到的图片走 Astro Image 优化；匹配不到时退回普通路径。

## 文章列表怎么读取文章

`src/pages/articles.astro`：

```ts
const articles = (await getCollection("articles"))
  .filter((article) => !article.data.draft)
  .sort((a, b) => b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf());
```

这表示：

- 读取所有文章。
- 排除草稿。
- 按发布时间倒序。

## 文章详情怎么渲染正文

`src/pages/articles/[slug].astro`：

```ts
import { render } from "astro:content";

const { Content } = await render(entry);
```

模板里：

```astro
<Content />
```

这里的 `Content` 就是 Markdown 正文渲染后的组件。

## Markdown 渲染管线

普通文章优先继续用 `.md`。当前 `astro.config.mjs` 做了这些增强：

```js
export default defineConfig({
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      rehypeMermaidBlocks,
      rehypeKatex,
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "append" }],
    ],
  },
  integrations: [expressiveCode(), mdx(), tailwind()],
});
```

对应能力：

- 数学公式：`remark-math` + `rehype-katex`。
- 代码块增强：`astro-expressive-code`。
- Mermaid 流程图：客户端 Mermaid 渲染。
- 标题锚点：`rehype-slug` + `rehype-autolink-headings`。

渲染顺序可以这样理解：

1. Markdown 先被解析成语法树。
2. `remark-math` 识别 `$...$` 和 `$$...$$`。
3. `rehypeMermaidBlocks` 把 `mermaid` 代码块改成图表容器。
4. `rehype-katex` 把数学公式转成 KaTeX HTML。
5. `astro-expressive-code` 接管普通代码块，输出高亮、复制按钮和代码框样式。
6. 页面加载后，`MermaidRenderer` 找到图表容器，再把 Mermaid 源码渲染成 SVG。

### 数学公式

行内公式：

```md
欧拉公式是 $e^{i\pi} + 1 = 0$。
```

块级公式：

```md
$$
L = \frac{1}{2} \rho v^2 S C_L
$$
```

KaTeX 在构建期生成公式 HTML，页面不需要额外客户端公式脚本。

### Mermaid 流程图

正文里写普通 Mermaid 代码块：

````md
```mermaid
sequenceDiagram
    participant U as 用户
    participant App as 应用
    U->>App: 发起请求
    App-->>U: 返回结果
```
````

构建时会先把 `mermaid` 代码块转换成图表容器，浏览器端再用 Mermaid 渲染 SVG。这样不影响普通代码块交给 Expressive Code 渲染。

为什么 Mermaid 不是只装一个代码块插件：

- 普通代码块的目标是展示源码，所以交给 `astro-expressive-code`。
- Mermaid 的目标是把源码变成图，所以要先从普通代码块里“摘出来”。
- 摘出来以后，页面端的 `MermaidRenderer` 才能按当前主题渲染 SVG。

当前实现里，只有正文出现 ` ```mermaid` 时才加载 Mermaid 脚本。普通文章不会额外加载 Mermaid。

### 代码块主题

代码块由 `astro-expressive-code` 渲染。当前主题配置跟随站点的 DaisyUI 主题：

```js
expressiveCode({
  themes: ["github-light", "github-dark-dimmed"],
  useDarkModeMediaQuery: false,
  themeCssSelector: (theme) =>
    theme.type === "dark" ? "[data-theme='black']" : "[data-theme='light']",
});
```

这表示：

- 亮色站点用 `github-light`。
- 暗色站点用 `github-dark-dimmed`。
- 主题切换由 HTML 上的 `data-theme="light"` / `data-theme="black"` 控制，而不是只跟随系统偏好。

### 标题锚点

文章里的 `##`、`###` 会自动生成 `id`，标题右侧会出现 `#` 锚点。读者可以复制到某一节的直达链接。

## MDX 的边界

当前文章集合支持 `.md` 和 `.mdx`。普通文章继续用 `.md`，需要组件能力时再用 `.mdx`。

这意味着：

- frontmatter 负责标题、摘要、日期、标签和头图。
- Markdown / MDX 正文通过 `render(entry)` 变成 `<Content />`。
- `prose` 负责基础正文排版。
- Markdown 管线负责代码块、公式、Mermaid 和标题锚点。
- 普通 Markdown 里的 `<img>` 和 `![图片]()` 不会自动走 Astro Image 优化。
- MDX 可以直接插入 `ArticleThemeImage` 这类 Astro 组件。

如果正文需要直接插入 Astro 组件，把文章从 `.md` 改成 `.mdx`。

## 建议的文章类型

这个站点适合写这些内容：

- 项目复盘：为什么做、做了什么、结果如何。
- 技术记录：某个问题怎么定位、怎么修。
- 学习笔记：围绕一个技术点拆清楚。
- 生活训练：健身、英语、数据分析等阶段性记录。
- 判断备忘：当时为什么做某个取舍。

尽量少写：

- 空泛年度总结。
- 没有事实支撑的观点。
- 只有情绪没有结论的碎碎念。

## 可以动手试的事

1. 新建 `src/content/articles/astro-routing-note.md`。
2. 写一篇 300 字笔记。
3. 加两个标签。
4. 执行 `bun run build`。
5. 打开 `/articles/astro-routing-note/`。

## 这一节要掌握的关键词

- Markdown
- frontmatter
- `draft`
- `publishedDate`
- `updatedDate`
- `tags`
- `heroImage`
- `Content`
- `remark-math`
- `rehype-katex`
- `astro-expressive-code`
- Mermaid
- MDX
