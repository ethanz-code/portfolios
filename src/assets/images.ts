import type { ImageMetadata } from "astro";

import profileImage from "./profile.webp";
import sxeasyDashboardImage from "./projects/sxeasy/dashboard.webp";
import sxeasyHomeImage from "./projects/sxeasy/home.webp";
import serviceCardImage from "./services/post-card.webp";
import socialCardImage from "./social/social-card.webp";

const mappedImageSources = {
  "/post_img.webp": serviceCardImage,
  "/projects/sxeasy/dashboard.webp": sxeasyDashboardImage,
  "/projects/sxeasy/home.webp": sxeasyHomeImage,
} as const;

export const resolveImageSource = (src?: string | ImageMetadata | null) => {
  if (!src) return undefined;
  if (typeof src !== "string") return src;
  return mappedImageSources[src as keyof typeof mappedImageSources] ?? src;
};

export {
  profileImage,
  serviceCardImage,
  socialCardImage,
  sxeasyDashboardImage,
  sxeasyHomeImage,
};
