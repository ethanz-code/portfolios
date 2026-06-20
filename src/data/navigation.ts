export interface NavItem {
  id: string;
  label: string;
  href: string;
  external?: boolean;
}

export const primaryNavItems: NavItem[] = [
  {
    id: "home",
    label: "首页",
    href: "/",
  },
  {
    id: "projects",
    label: "项目",
    href: "/projects",
  },
  {
    id: "articles",
    label: "文章",
    href: "/articles",
  },
  {
    id: "moments",
    label: "图集",
    href: "/moments",
  },
];

export const actionNavItems: NavItem[] = [
  {
    id: "contact",
    label: "联系我",
    href: "/contact",
  },
];
