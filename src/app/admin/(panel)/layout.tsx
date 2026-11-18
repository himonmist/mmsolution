import { AdminShell, type NavItem } from "@/components/admin/AdminShell";
import { requireUser } from "@/lib/auth/session";
import { can, ROLE_LABELS, type Permission } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db";

const NAV: (NavItem & { perm: Permission })[] = [
  { href: "/admin", label: "Dashboard", icon: "LayoutDashboard", group: "Overview", perm: "dashboard.view" },
  { href: "/admin/inquiries", label: "Inquiries", icon: "Inbox", group: "Overview", perm: "inquiries.view" },
  { href: "/admin/products", label: "Products", icon: "Package", group: "Catalogue", perm: "products.write" },
  { href: "/admin/categories", label: "Categories", icon: "FolderTree", group: "Catalogue", perm: "categories.write" },
  { href: "/admin/brands", label: "Brands", icon: "Tag", group: "Catalogue", perm: "brands.write" },
  { href: "/admin/homepage", label: "Homepage", icon: "Home", group: "Content", perm: "homepage.write" },
  { href: "/admin/services", label: "Services", icon: "Wrench", group: "Content", perm: "services.write" },
  { href: "/admin/projects", label: "Projects", icon: "Briefcase", group: "Content", perm: "projects.write" },
  { href: "/admin/testimonials", label: "Testimonials", icon: "Quote", group: "Content", perm: "testimonials.write" },
  { href: "/admin/posts", label: "News & Insights", icon: "Newspaper", group: "Content", perm: "posts.write" },
  { href: "/admin/pages", label: "Pages", icon: "FileText", group: "Content", perm: "pages.write" },
  { href: "/admin/banners", label: "Banners", icon: "Megaphone", group: "Content", perm: "banners.write" },
  { href: "/admin/media", label: "Media library", icon: "ImageIcon", group: "Content", perm: "media.write" },
  { href: "/admin/settings", label: "Site settings", icon: "Settings", group: "System", perm: "settings.manage" },
  { href: "/admin/users", label: "Users & roles", icon: "Users", group: "System", perm: "users.manage" },
  { href: "/admin/activity", label: "Activity log", icon: "Activity", group: "System", perm: "activity.view" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("dashboard.view");
  const fresh = can(user.role, "inquiries.view") ? await prisma.inquiry.count({ where: { status: "NEW" } }) : 0;
  const nav = NAV.filter((n) => can(user.role, n.perm)).map(({ perm: _p, ...n }) => (n.href === "/admin/inquiries" ? { ...n, badge: fresh } : n));
  return <AdminShell nav={nav} user={{ name: user.name, email: user.email, roleLabel: ROLE_LABELS[user.role] }}>{children}</AdminShell>;
}
