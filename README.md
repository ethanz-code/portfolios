# portfolios

张永鑫 Ethan Zhang 的个人作品集网站。

用 Astro、Tailwind CSS 和 DaisyUI 构建，展示项目、服务、简历和资源商店。

## 开发

```bash
bun install
bun run dev
```

## 构建

```bash
bun run build
bun run preview
```

## 目录

```text
src/
  components/
    cv/TimeLine.astro
    BaseHead.astro
    Footer.astro
    Header.astro
    HorizontalCard.astro
    HorizontalShopItem.astro
    SideBar.astro
    SideBarFooter.astro
    SideBarMenu.astro
    ThemeToggle.astro
  content/
    store/
  layouts/
    BaseLayout.astro
  pages/
    404.astro
    cv.astro
    index.astro
    projects.astro
    services.astro
    store/
  styles/
    global.css
```

## 内容维护

- 站点基础信息在 `src/config.ts`。
- 商店条目放在 `src/content/store/`。
- 页面入口放在 `src/pages/`。
- 导航项在 `src/components/SideBarMenu.astro`。
- 头像和社交图等静态资源放在 `public/`。
