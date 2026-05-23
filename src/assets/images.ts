import type { ImageMetadata } from "astro";

import profileImage from "./profile.webp";
import sxeasyDashboardDarkImage from "./projects/sxeasy/dashboard-dark.webp";
import sxeasyDashboardImage from "./projects/sxeasy/dashboard.webp";
import sxeasyHomeDarkImage from "./projects/sxeasy/home-dark.webp";
import sxeasyHomeImage from "./projects/sxeasy/home.webp";

const mappedImageSources = {
  "/projects/sxeasy/dashboard-dark.webp": sxeasyDashboardDarkImage,
  "/projects/sxeasy/dashboard.webp": sxeasyDashboardImage,
  "/projects/sxeasy/home-dark.webp": sxeasyHomeDarkImage,
  "/projects/sxeasy/home.webp": sxeasyHomeImage,
} as const;

export const resolveImageSource = (src?: string | ImageMetadata | null) => {
  if (!src) return undefined;
  if (typeof src !== "string") return src;
  return mappedImageSources[src as keyof typeof mappedImageSources] ?? src;
};

export {
  profileImage,
  sxeasyDashboardDarkImage,
  sxeasyDashboardImage,
  sxeasyHomeDarkImage,
  sxeasyHomeImage,
};
