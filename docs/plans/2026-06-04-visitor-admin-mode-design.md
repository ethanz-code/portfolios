# 访客/管理员模式设计方案

## 概述

为作品集站点实现访客/管理员双模式，通过 URL 参数切换，右下角显示模式指示器。

## 需求

- 默认访客模式，URL 参数 `?admin=true` 切换管理员模式
- 右下角显示模式指示器图标
- 访客模式显示专业简洁描述，管理员模式显示详细内容
- 仅 sxeasy 和 sdcit-gaokao-volunteer 两个项目需要访客描述

## 设计方案

### 1. 数据结构

在项目 frontmatter 中添加 `visitorDescription` 字段：

```yaml
---
title: "实习轻松办"
description: "管理员模式详细描述..."
visitorDescription: "访客模式简洁描述..."
---
```

修改 `src/content.config.ts`，在 `projectSchema` 中添加可选字段：

```typescript
visitorDescription: z.string().optional(),
```

### 2. 模式检测

创建工具函数 `src/lib/mode.ts`：

```typescript
export function isAdminMode(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('admin') === 'true';
}
```

### 3. UI 组件

#### 模式指示器

创建 `src/components/ModeIndicator.astro`：
- 右下角固定定位
- 访客模式：眼睛图标
- 管理员模式：齿轮图标
- 点击切换模式（更新 URL 参数）

#### 条件渲染

修改项目卡片和详情页，根据模式显示不同内容：
- 访客模式：优先显示 `visitorDescription`
- 管理员模式：显示 `description`

### 4. 访客描述文案要求

- 简洁、专业、直接
- 突出项目价值和成果
- 不透露个人心理活动、赚钱动机、行业分析
- 适合对外展示

示例（sxeasy）：
> 为高校学生提供自主实习解决方案的平台，支持实习盖章、打卡管理和企业对接。

## 需要修改的文件

1. `src/content.config.ts` - 添加 visitorDescription 字段
2. `src/lib/mode.ts` - 新建模式检测工具
3. `src/components/ModeIndicator.astro` - 新建指示器组件
4. `src/layouts/BaseLayout.astro` - 集成指示器
5. `src/content/projects/sxeasy.mdx` - 添加访客描述
6. `src/content/projects/sdcit-gaokao-volunteer.mdx` - 添加访客描述
7. `src/components/HorizontalCard.astro` - 支持条件渲染
8. `src/components/ContentEntryDetail.astro` - 支持条件渲染
