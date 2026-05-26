export interface MomentGroupInfo {
  slug: string;
  title: string;
  date?: string;
  description?: string;
  order?: number;
}

export interface MomentImage {
  src: ImageMetadata;
  alt: string;
  fileName: string;
  groupSlug: string;
  groupTitle: string;
  groupDate?: string;
  groupDescription?: string;
}

export interface MomentGroup extends MomentGroupInfo {
  images: MomentImage[];
}

export const momentGroupInfo: MomentGroupInfo[] = [
  {
    slug: "workbench",
    title: "工作台片段",
    date: "2026-05-23",
    description: "用模拟图先看代码、文档和发布记录混排后的图集节奏。",
    order: 1,
  },
  {
    slug: "city",
    title: "路上观察",
    date: "2026-05-22",
    description: "模拟城市、通勤和夜间场景，检查深浅主题下的图片覆盖效果。",
    order: 2,
  },
  {
    slug: "interface",
    title: "界面检查",
    date: "2026-05-21",
    description: "模拟产品界面截图，确认九宫格和图片组在不同尺寸下的裁切。",
    order: 3,
  },
];

const groupInfoBySlug = new Map(momentGroupInfo.map((group) => [group.slug, group]));

const imageModules = import.meta.glob<ImageMetadata>(
  "/src/assets/moments/**/*.{jpg,jpeg,png,webp,avif}",
  {
    eager: true,
    import: "default",
  },
);

const formatSlug = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const getGroupSlug = (path: string) => path.replace("/src/assets/moments/", "").split("/")[0];

const getFileName = (path: string) => path.split("/").at(-1) ?? "image";

const shuffle = <T>(items: T[]) => {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
};

const images = Object.entries(imageModules).map(([path, src]) => {
  const groupSlug = getGroupSlug(path);
  const groupInfo = groupInfoBySlug.get(groupSlug);
  const groupTitle = groupInfo?.title ?? formatSlug(groupSlug);
  const fileName = getFileName(path);

  return {
    src,
    alt: `${groupTitle} - ${fileName.replace(/\.[^.]+$/, "")}`,
    fileName,
    groupSlug,
    groupTitle,
    groupDate: groupInfo?.date,
    groupDescription: groupInfo?.description,
  } satisfies MomentImage;
});

const groupsBySlug = new Map<string, MomentGroup>();

images.forEach((image) => {
  const groupInfo = groupInfoBySlug.get(image.groupSlug);
  const group = groupsBySlug.get(image.groupSlug) ?? {
    slug: image.groupSlug,
    title: image.groupTitle,
    date: image.groupDate,
    description: image.groupDescription,
    order: groupInfo?.order,
    images: [],
  };

  group.images.push(image);
  groupsBySlug.set(image.groupSlug, group);
});

export const momentGroups = [...groupsBySlug.values()].sort((groupA, groupB) => {
  const orderA = groupA.order ?? Number.MAX_SAFE_INTEGER;
  const orderB = groupB.order ?? Number.MAX_SAFE_INTEGER;

  if (orderA !== orderB) {
    return orderA - orderB;
  }

  return (groupB.date ?? "").localeCompare(groupA.date ?? "");
});

export const momentImages = shuffle(images);

export const getMomentPreviewImages = (limit = 9) => momentImages.slice(0, limit);
