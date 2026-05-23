# portfolios

张永鑫 Ethan Zhang 的个人作品集网站。

用 Astro、Tailwind CSS 和 DaisyUI 构建，展示项目、文章、图集和联系方式。

## 快速开始

```bash
bun install
bun run dev
```

## 验证与构建

```bash
bun run check
bun run build
bun run preview
```

## 常改入口

- 站点基础信息：`src/config.ts`
- 首页、项目、服务、图集、联系页：`src/pages/`
- 文章：`src/content/articles/`
- 项目：`src/content/projects/`
- 导航：`src/data/navigation.ts`
- 图集分组说明：`src/data/moments.ts`
- 图集图片源：`src/assets/moments/`
- 页面图片与社交图：`public/`、`src/assets/`
- Astro 学习与维护教程：`public/astro-tech-map/README.md`

## 目录结构

```text
src/
  components/
    BaseHead.astro
    Footer.astro
    Header.astro
    HorizontalCard.astro
    SideBar.astro
    SideBarFooter.astro
    SideBarMenu.astro
    ThemeToggle.astro
  content/
    articles/
    projects/
  layouts/
    BaseLayout.astro
  pages/
    404.astro
    articles.astro
    contact.astro
    index.astro
    moments.astro
    projects.astro
    services.astro
  styles/
    global.css
```

## 内容维护

- 新增文章：在 `src/content/articles/` 放 Markdown 文件即可发布。
- 文章正文本地图片：放在 `public/articles/`，正文里用 `![](/articles/demo.webp)` 这类根路径引用。
- 新增项目：在 `src/content/projects/` 新建 Markdown 文件；是否生成详情页由 frontmatter 里的 `detailPage` 控制。
- 新增图集图片：放进 `src/assets/moments/` 对应分组目录；标题、日期、说明和排序写在 `src/data/moments.ts`。
- 修改导航：编辑 `src/data/navigation.ts`。
- 修改页面：编辑 `src/pages/` 和 `src/components/`。
- 查看维护教程：打开 `public/astro-tech-map/README.md`，按顺序看对应章节。
