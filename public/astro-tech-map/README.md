# Astro 技术学习地图

这组文档只围绕当前项目展开。先知道这个站点用了 Astro 的哪些能力，再回到源码里逐个对照。

如果你是第一次接手这个仓库，先看 `README.md`，再回来按这里的顺序往下读。

## 推荐阅读顺序

1. [项目配置与构建](01-project-config.md)
2. [文件路由与动态路由](02-routing.md)
3. [Content Collections 内容集合](03-content-collections.md)
4. [Markdown 发文流程](04-markdown-publishing.md)
5. [Layout、组件与 slot](05-layout-components.md)
6. [Head、SEO 与站点元信息](06-head-seo.md)
7. [ClientRouter 与客户端脚本](07-transitions-client-scripts.md)
8. [图片、public 静态资源与样式系统](08-assets-styles.md)
9. [动手练习路线](09-practice-path.md)

## 3 分钟上手

如果只是想尽快改站点，先记这几个入口：

- 改页面：`src/pages/`
- 改站点信息：`src/config.ts`
- 改导航：`src/data/navigation.ts`
- 发文章：`src/content/articles/`
- 加项目：`src/content/projects/`
- 加图集图片：`src/assets/moments/`
- 加项目亮暗截图：`src/content/projects/*.md` 的 `heroImageLight` / `heroImageDark` / `images`
- 改图集分组说明：`src/data/moments.ts`
- 跑检查：`bun run check`
- 跑构建：`bun run build`

## 当前项目的核心模式

一句话概括：

> 用 Astro 做静态站点，用 Content Collections 管理文章和项目，用 Layout 统一页面结构，用 Tailwind/DaisyUI 管理视觉系统，用 `src/assets` 映射让内容图片也走 Astro Image 优化。

这套模式适合个人站、作品集、技术文章、项目复盘和轻量内容档案。

## 源码入口

- 页面：`src/pages/`
- 内容：`src/content/`
- 布局：`src/layouts/BaseLayout.astro`
- 组件：`src/components/`
- 导航数据：`src/data/navigation.ts`
- 图集数据：`src/data/moments.ts`
- 全站配置：`src/config.ts`
- Astro 配置：`astro.config.mjs`
- Tailwind 配置：`tailwind.config.cjs`

## 学习时怎么对照

建议每看一节，就打开对应源码：

1. 先看文档里的“相关文件”。
2. 再看“项目里怎么用”。
3. 最后做“可以动手试的事”。

Astro 不是只靠记 API。这个项目本身就是最好的练习材料。
