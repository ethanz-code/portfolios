# 设计风格

这个项目应该保持现有的 Astro + Tailwind + DaisyUI 视觉语言。

## UI 规则

- 优先使用项目里已经存在的 DaisyUI 基础类：`btn`、`btn-ghost`、`btn-outline`、`card`、`badge`、`drawer`、`menu`、`dropdown-content`。
- 优先使用主题 token，例如 `bg-base-100`、`bg-base-200`、`text-base-content`、`border-base-300`。
- 除非明确要求，不引入新的视觉风格。
- 标准控件避免使用随意的大圆角，例如 `rounded-[1.5rem]` 或 `rounded-[1.75rem]`。
- 新增操作和切换控件时，先匹配现有按钮风格，再考虑自定义容器。
- 桌面端工具入口可以固定定位，但控件本身仍应像项目原生 DaisyUI 按钮。
- 移动端 Header 空间有限时，操作入口使用紧凑的纯图标按钮。

## 主题控制

- 桌面端主题入口放在右上角。
- 移动端主题入口放在 Header 右侧，并使用纯图标。
- 支持 `跟随系统`、`浅色`、`深色`。
- 默认跟随系统主题，直到用户明确选择某个主题。
