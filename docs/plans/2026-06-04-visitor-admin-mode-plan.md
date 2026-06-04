# 访客/管理员模式实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为作品集站点实现访客/管理员双模式，通过 URL 参数切换，右下角显示模式指示器。

**Architecture:** 通过 URL 参数 `?admin=true` 切换模式，在 frontmatter 中添加 `visitorDescription` 字段存储访客模式描述，使用全局工具函数检测模式，条件渲染显示不同内容。

**Tech Stack:** Astro, TypeScript, Tailwind CSS

---

## Task 1: 修改内容配置，添加 visitorDescription 字段

**Files:**
- Modify: `src/content.config.ts:10-23`

**Step 1: 修改 projectSchema**

在 `projectSchema` 中添加 `visitorDescription` 可选字段：

```typescript
const projectSchema = z.object({
    title: z.string(),
    description: z.string(),
    visitorDescription: z.string().optional(),  // 新增
    updatedDate: z.coerce.date(),
    category: z.enum(["featured", "content"]),
    order: z.number(),
    heroImage: z.string().optional(),
    heroImageLight: z.string().optional(),
    heroImageDark: z.string().optional(),
    externalUrl: z.string().optional(),
    detailPage: z.boolean().default(false),
    links: z.array(projectLinkSchema).optional(),
    tags: z.array(z.string()).optional(),
});
```

**Step 2: 验证类型定义**

检查 `ProjectSchema` 类型是否自动更新，确保 `visitorDescription` 字段可用。

**Step 3: Commit**

```bash
git add src/content.config.ts
git commit -m "feat: add visitorDescription field to project schema"
```

## Task 2: 创建模式检测工具函数

**Files:**
- Create: `src/lib/mode.ts`

**Step 1: 创建模式检测工具**

```typescript
export function isAdminMode(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('admin') === 'true';
}

export function getVisitorDescription(project: { description: string; visitorDescription?: string }): string {
  return project.visitorDescription || project.description;
}
```

**Step 2: Commit**

```bash
git add src/lib/mode.ts
git commit -m "feat: add mode detection utility"
```

## Task 3: 创建模式指示器组件

**Files:**
- Create: `src/components/ModeIndicator.astro`

**Step 1: 创建指示器组件**

```astro
---
// ModeIndicator.astro
---

<div
  id="mode-indicator"
  class="fixed bottom-4 right-4 z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-base-200 shadow-lg transition-all hover:scale-110"
  title="切换模式"
>
  <svg
    id="visitor-icon"
    class="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
  <svg
    id="admin-icon"
    class="hidden h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
</div>

<script>
  function initModeIndicator() {
    const indicator = document.getElementById('mode-indicator');
    const visitorIcon = document.getElementById('visitor-icon');
    const adminIcon = document.getElementById('admin-icon');
    
    if (!indicator || !visitorIcon || !adminIcon) return;
    
    const params = new URLSearchParams(window.location.search);
    const isAdmin = params.get('admin') === 'true';
    
    if (isAdmin) {
      visitorIcon.classList.add('hidden');
      adminIcon.classList.remove('hidden');
      indicator.title = '当前：管理员模式（点击切换）';
    } else {
      visitorIcon.classList.remove('hidden');
      adminIcon.classList.add('hidden');
      indicator.title = '当前：访客模式（点击切换）';
    }
    
    indicator.addEventListener('click', () => {
      const url = new URL(window.location.href);
      if (isAdmin) {
        url.searchParams.delete('admin');
      } else {
        url.searchParams.set('admin', 'true');
      }
      window.location.href = url.toString();
    });
  }
  
  initModeIndicator();
  
  document.addEventListener('astro:page-load', initModeIndicator);
</script>
```

**Step 2: Commit**

```bash
git add src/components/ModeIndicator.astro
git commit -m "feat: add mode indicator component"
```

## Task 4: 集成指示器到布局

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

**Step 1: 导入并添加指示器**

在 BaseLayout 中导入并添加 ModeIndicator 组件：

```astro
---
import ModeIndicator from "../components/ModeIndicator.astro";
// ... 其他导入
---

<!-- 在 body 结束前添加 -->
<ModeIndicator />
```

**Step 2: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: integrate mode indicator into layout"
```

## Task 5: 添加 sxeasy 项目的访客描述

**Files:**
- Modify: `src/content/projects/sxeasy.mdx:1-15`

**Step 1: 添加 visitorDescription**

在 frontmatter 中添加访客描述：

```yaml
---
title: "实习轻松办 Sexasy"
description: "实习轻松办是一个为高校学生解决因为各种原因的有自主实习需求的这么一个平台。"
visitorDescription: "为高校学生提供自主实习解决方案的平台，支持实习盖章、打卡管理和企业对接。"
updatedDate: "2026-05-24"
category: "featured"
order: 1
heroImage: "/projects/sxeasy/home.webp"
heroImageLight: "/projects/sxeasy/home.webp"
heroImageDark: "/projects/sxeasy/home-dark.webp"
detailPage: true
tags:
  - "实习盖章"
  - "数字工牌"
  - "三端管理"
---
```

**Step 2: Commit**

```bash
git add src/content/projects/sxeasy.mdx
git commit -m "feat: add visitor description for sxeasy"
```

## Task 6: 添加 sdcit-gaokao-volunteer 项目的访客描述

**Files:**
- Modify: `src/content/projects/sdcit-gaokao-volunteer.mdx:1-12`

**Step 1: 添加 visitorDescription**

在 frontmatter 中添加访客描述：

```yaml
---
title: "SDCIT 高考志愿填报"
description: "学校老师接的高考志愿填报项目，我负责主前端，做 H5 查分查校和 Admin 后台数据维护页面。"
visitorDescription: "高考志愿填报系统，支持分数查询、学校推荐和历年分数线查看，帮助学生和家长做出更好的选择。"
updatedDate: "2025.11.20"
category: "featured"
order: 2
detailPage: true
tags:
  - "高考志愿"
  - "H5 前台"
  - "Admin 后台"
---
```

**Step 2: Commit**

```bash
git add src/content/projects/sdcit-gaokao-volunteer.mdx
git commit -m "feat: add visitor description for sdcit-gaokao-volunteer"
```

## Task 7: 修改项目卡片，支持条件渲染

**Files:**
- Modify: `src/pages/index.astro:28-31`
- Modify: `src/pages/projects.astro` (if exists)

**Step 1: 修改 index.astro 中的项目卡片**

在渲染项目卡片时，根据模式传递不同的描述：

```astro
---
import { isAdminMode, getVisitorDescription } from "../lib/mode";
// ... 其他代码
---

<!-- 在模板中 -->
{
  homeProjects.map((project, index) => (
    <>
      <HorizontalCard
        title={project.data.title}
        imgLight={getProjectImageLight(project)}
        imgDark={getProjectImageDark(project)}
        desc={project.data.visitorDescription || project.data.description}
        url={getProjectUrl(project)}
        target={project.data.detailPage ? "_self" : "_blank"}
      />
      {index < homeProjects.length - 1 && <div class="divider my-0" />}
    </>
  ))
}
```

注意：由于 Astro 是静态生成，我们需要在客户端使用 JavaScript 来动态切换描述。或者我们可以生成两个版本的页面。

**Step 2: 修改客户端逻辑**

由于 Astro 的静态生成特性，我们需要在客户端处理模式切换。修改 HorizontalCard 组件，添加客户端逻辑：

```astro
---
// HorizontalCard.astro
interface Props {
  title: string;
  img?: string | ImageMetadata;
  imgLight?: string | ImageMetadata;
  imgDark?: string | ImageMetadata;
  desc: string;
  visitorDesc?: string;
  url: string;
  target?: string;
  compactMobile?: boolean;
}

const { title, img, imgLight, imgDark, desc, visitorDesc, url, target = "_blank", compactMobile = false } = Astro.props as Props;
---

<div
  class:list={[
    "card w-full min-w-0 overflow-hidden border border-base-300/70 bg-base-100 shadow-sm transition ease-in-out md:border-0 md:shadow-none md:hover:scale-[102%] md:hover:shadow-xl",
  ]}
  data-desc={desc}
  data-visitor-desc={visitorDesc || desc}
>
  <!-- ... 其他内容 ... -->
  <p class:list={["mt-2 break-words text-base leading-7 opacity-80 sm:text-[1.05rem] md:py-1 md:opacity-100", compactMobile && "max-md:line-clamp-2 max-md:text-[0.95rem] max-md:leading-[1.65]"]}>
    {desc}
  </p>
</div>

<script>
  function updateCardDescriptions() {
    const params = new URLSearchParams(window.location.search);
    const isAdmin = params.get('admin') === 'true';
    
    document.querySelectorAll('[data-desc]').forEach((card) => {
      const descEl = card.querySelector('p');
      if (descEl) {
        const desc = card.getAttribute('data-desc') || '';
        const visitorDesc = card.getAttribute('data-visitor-desc') || desc;
        descEl.textContent = isAdmin ? desc : visitorDesc;
      }
    });
  }
  
  updateCardDescriptions();
  document.addEventListener('astro:page-load', updateCardDescriptions);
</script>
```

**Step 3: Commit**

```bash
git add src/pages/index.astro src/components/HorizontalCard.astro
git commit -m "feat: support conditional rendering in project cards"
```

## Task 8: 修改项目详情页，支持条件渲染

**Files:**
- Modify: `src/components/ContentEntryDetail.astro:31`

**Step 1: 修改详情页描述显示**

在详情页中，根据模式显示不同的描述：

```astro
---
// 在 script 部分添加
const description = project?.visitorDescription || project?.description || "";
---

<!-- 在模板中添加客户端脚本 -->
<script>
  function updateDetailDescription() {
    const params = new URLSearchParams(window.location.search);
    const isAdmin = params.get('admin') === 'true';
    
    const descEl = document.querySelector('[data-project-desc]');
    if (descEl) {
      const desc = descEl.getAttribute('data-desc') || '';
      const visitorDesc = descEl.getAttribute('data-visitor-desc') || desc;
      descEl.textContent = isAdmin ? desc : visitorDesc;
    }
  }
  
  updateDetailDescription();
  document.addEventListener('astro:page-load', updateDetailDescription);
</script>
```

**Step 2: Commit**

```bash
git add src/components/ContentEntryDetail.astro
git commit -m "feat: support conditional rendering in project detail page"
```

## Task 9: 测试和验证

**Step 1: 启动开发服务器**

```bash
bun run dev
```

**Step 2: 测试访客模式**

访问 `http://localhost:4321/`，验证：
- 右下角显示眼睛图标
- 项目卡片显示访客描述
- 点击图标切换到管理员模式

**Step 3: 测试管理员模式**

访问 `http://localhost:4321/?admin=true`，验证：
- 右下角显示齿轮图标
- 项目卡片显示管理员描述
- 点击图标切换到访客模式

**Step 4: 测试项目详情页**

访问项目详情页，验证描述根据模式正确切换。

**Step 5: Commit**

```bash
git add .
git commit -m "test: verify visitor/admin mode functionality"
```
