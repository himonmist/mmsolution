export const PERMISSIONS = [
  "dashboard.view",
  "products.write", "categories.write", "brands.write",
  "services.write", "projects.write", "testimonials.write",
  "posts.write", "pages.write", "banners.write", "homepage.write", "media.write",
  "inquiries.view", "inquiries.manage", "inquiries.export",
  "settings.manage", "users.manage", "activity.view",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const ROLES = ["super_admin", "admin", "content_editor", "product_manager", "inquiry_manager"] as const;
export type RoleKey = (typeof ROLES)[number];

export const ROLE_LABELS: Record<RoleKey, string> = {
  super_admin: "Super Administrator",
  admin: "Administrator",
  content_editor: "Content Editor",
  product_manager: "Product Manager",
  inquiry_manager: "Inquiry Manager",
};

export const ROLE_PERMISSIONS: Record<RoleKey, readonly Permission[]> = {
  super_admin: PERMISSIONS,
  admin: PERMISSIONS.filter((p) => p !== "users.manage"),
  content_editor: ["dashboard.view", "services.write", "projects.write", "testimonials.write", "posts.write",
    "pages.write", "banners.write", "homepage.write", "media.write"],
  product_manager: ["dashboard.view", "products.write", "categories.write", "brands.write", "media.write", "inquiries.view"],
  inquiry_manager: ["dashboard.view", "inquiries.view", "inquiries.manage", "inquiries.export"],
};

export function can(role: RoleKey | string | null | undefined, perm: Permission): boolean {
  if (!role || !(role in ROLE_PERMISSIONS)) return false;
  return ROLE_PERMISSIONS[role as RoleKey].includes(perm);
}
