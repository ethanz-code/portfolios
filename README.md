# portfolios

张永鑫 Ethan Zhang 的个人作品集。展示项目交付、技术文章、工作片段和联系方式。

技术栈：Astro、Tailwind CSS、DaisyUI、Bun。

## 启动

```bash
bun install
bun run dev
```

## 验证

```bash
bun run check
bun run build
bun run preview
```

## 常改入口

- 站点信息：`src/config.ts`
- 页面：`src/pages/`
- 导航：`src/data/navigation.ts`
- 项目：`src/content/projects/`
- 文章：`src/content/articles/`
- 图集数据：`src/data/moments.ts`
- 图集图片：`src/assets/moments/`
- 通用图片：`src/assets/`、`public/`
- Astro 维护教程：`public/astro-tech-map/README.md`

## 内容发布

- 新增文章：在 `src/content/articles/` 新建 Markdown。
- 新增项目：在 `src/content/projects/` 新建 Markdown，详情页由 `detailPage` 控制。
- 文章正文图片：放到 `public/articles/`，用 `![](/articles/demo.webp)` 引用。
- 新增图集：图片放到 `src/assets/moments/`，标题、日期、说明和排序写进 `src/data/moments.ts`。

## 部署

推送到 `main` 后，GitHub Actions 会构建 `linux/amd64` 镜像，推送到 GHCR，并通过 SSH 重启服务器容器。

必填 Secrets：

- `SSH_HOST`
- `SSH_USER`
- `SSH_PRIVATE_KEY`

可选配置：

- `SSH_PORT`：默认 `22`
- `GHCR_USERNAME`、`GHCR_TOKEN`：私有镜像拉取凭据
- `DEPLOY_CONTAINER_NAME`：默认 `portfolios`
- `DEPLOY_PORT_MAPPING`：默认 `8080:80`
