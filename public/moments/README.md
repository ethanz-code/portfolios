# Moments 图片目录

图片源目录已经切到 `src/assets/moments/`。这里不再作为页面图片来源。

每个子文件夹就是一组图片。把图片放进去，页面会在构建时自动读取。

```text
src/assets/moments/
  recent/
    01.jpg
    02.jpg
    03.webp
  trip-2026-05/
    cover.jpg
    street.png
```

支持格式：`jpg`、`jpeg`、`png`、`webp`、`avif`。

每组图片的标题、日期、说明和排序写在 `src/data/moments.ts` 的 `momentGroupInfo` 里。`slug` 要和文件夹名一致：

```ts
{
  slug: "trip-2026-05",
  title: "五月出行",
  date: "2026-05",
  description: "路上拍到的一组图。",
  order: 2,
}
```

如果没有写组信息，页面会用文件夹名自动生成标题。
