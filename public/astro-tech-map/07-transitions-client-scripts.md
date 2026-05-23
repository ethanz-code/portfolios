# 07. View Transitions 与客户端脚本

## 相关文件

- `src/layouts/BaseLayout.astro`
- `src/components/ThemeToggle.astro`
- `src/config.ts`

## Astro 默认偏静态

Astro 的默认思路是：

- 尽量在构建期生成 HTML。
- 页面默认没有大量客户端 JS。
- 需要交互时，再明确加脚本或岛屿组件。

这个项目没有 React/Vue 组件岛，只有少量原生浏览器脚本：

- 主题切换。
- 主题按钮状态同步。
- View Transitions 后重新绑定事件。

## View Transitions 怎么启用

`BaseLayout.astro`：

```ts
import { ViewTransitions } from "astro:transitions";
```

`src/config.ts`：

```ts
export const TRANSITION_API = true;
```

layout 里：

```astro
{TRANSITION_API && <ViewTransitions />}
```

这样可以通过配置开关控制是否启用页面过渡。

## 为什么要关注 `astro:after-swap`

启用 View Transitions 后，页面切换不完全等同于传统刷新。

如果脚本只在初次加载时绑定事件，切换页面后新 DOM 里的按钮可能没有事件。

所以项目里有：

```js
document.addEventListener("astro:after-swap", bindThemeControls);
```

含义：

- 页面内容替换后。
- 重新查找主题按钮。
- 重新绑定点击事件。

## 主题初始化脚本

页面 `<head>` 里有一段内联脚本：

```astro
<script is:inline>
  (() => {
    const storageKey = "theme-preference";
    const getSystemTheme = () =>
      window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

    try {
      const storedTheme = window.localStorage.getItem(storageKey);
      const theme = storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : getSystemTheme();

      document.documentElement.dataset.theme = getDaisyTheme(theme);
      document.documentElement.style.colorScheme = getColorScheme(theme);
    } catch {
      ...
    }
  })();
</script>
```

它放在 `<head>` 里，是为了尽早应用主题，减少页面先亮后暗或先暗后亮的闪烁。

## `is:inline` 是什么

```astro
<script is:inline>
```

表示这段脚本直接内联到 HTML，不交给 Astro 打包。

适合：

- 很短的初始化脚本。
- 必须尽早执行的脚本。
- 不依赖模块系统的浏览器逻辑。

不适合：

- 很大的业务逻辑。
- 需要复用的复杂模块。
- 依赖 npm 包的前端逻辑。

## 主题状态存在哪里

项目使用：

```js
window.localStorage.getItem("theme-preference")
```

可能值：

```text
light
dark
null
```

`null` 表示跟随系统。

用户选择“跟随系统”时，删除本地存储：

```js
window.localStorage.removeItem(storageKey);
```

## DaisyUI 主题怎么切

项目最终改的是 HTML 根节点：

```js
document.documentElement.dataset.theme = getDaisyTheme(theme);
document.documentElement.style.colorScheme = getColorScheme(theme);
```

映射关系：

```js
const getDaisyTheme = (theme) => (theme === "dark" ? "black" : "light");
```

也就是说：

- 业务里叫 `dark`。
- DaisyUI 里使用 `black` 主题。
- 亮色使用 `light`。

## 为什么监听系统主题变化

```js
mediaQuery.addEventListener("change", () => {
  if (!getStoredTheme()) {
    applyTheme(getSystemTheme());
  }
});
```

如果用户没有手动选择 light/dark，就跟随系统变化。

如果用户已经手动选择，就尊重用户选择。

## 客户端脚本的边界

当前项目脚本只负责交互增强，不负责核心内容。

核心内容来自：

- `src/pages/`
- `src/content/`
- Astro 构建

即使 JS 失败，文章和项目正文仍然是静态 HTML。这是 Astro 的优势之一。

## 可以动手试的事

1. 关闭 `TRANSITION_API`。
2. 执行 `bun run dev`。
3. 观察页面跳转体验变化。
4. 切换主题，看 localStorage 里的 `theme-preference`。
5. 选择“跟随系统”，确认 localStorage 被删除。

## 这一节要掌握的关键词

- `ViewTransitions`
- `astro:after-swap`
- `is:inline`
- `localStorage`
- `matchMedia`
- `prefers-color-scheme`
- DaisyUI theme
- progressive enhancement
