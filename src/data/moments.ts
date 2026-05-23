import type { ImageMetadata } from "astro";

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
    slug: "recent",
    title: "近期图片",
    description: "最近上传的生活、工作和路上片段。",
    order: 1,
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
