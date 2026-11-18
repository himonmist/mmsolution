import type { Permission } from "@/lib/auth/rbac";

export type FieldType = "text" | "textarea" | "richtext" | "select" | "checkbox" | "number" | "date" | "image" | "list" | "specs" | "images" | "relation";
export type Field = { name: string; label: string; type: FieldType; required?: boolean; options?: [string, string][]; relation?: "categories" | "brands"; help?: string; full?: boolean };
export type ResourceConfig = { label: string; plural: string; perm: Permission; titleField: string; columns: [string, string][]; fields: Field[]; publicPath?: (row: Record<string, unknown>) => string };

const seo: Field[] = [
  { name: "seoTitle", label: "SEO title", type: "text", help: "≤ 70 characters" },
  { name: "seoDescription", label: "SEO meta description", type: "textarea", help: "≤ 170 characters" },
];
const order: Field = { name: "sortOrder", label: "Sort order", type: "number", help: "Lower numbers appear first" };

export const RESOURCES: Record<string, ResourceConfig> = {
  products: {
    label: "Product", plural: "Products", perm: "products.write", titleField: "name",
    columns: [["name", "Name"], ["category.name", "Category"], ["brand.name", "Brand"], ["isPublished", "Published"], ["isFeatured", "Featured"]],
    publicPath: (r) => `/products/${r.slug}`,
    fields: [
      { name: "name", label: "Product name", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "text", help: "Leave blank to generate" },
      { name: "modelNumber", label: "Model number", type: "text" },
      { name: "categoryId", label: "Category", type: "relation", relation: "categories", required: true },
      { name: "brandId", label: "Brand", type: "relation", relation: "brands" },
      { name: "shortDescription", label: "Short description", type: "textarea", full: true },
      { name: "description", label: "Detailed description", type: "richtext", full: true },
      { name: "features", label: "Key features (one per line)", type: "list", full: true },
      { name: "specifications", label: "Technical specifications", type: "specs", full: true },
      { name: "images", label: "Product images", type: "images", full: true },
      { name: "availability", label: "Availability", type: "select", options: [["UNSPECIFIED", "Not shown"], ["IN_STOCK", "In stock"], ["LIMITED", "Limited stock"], ["PRE_ORDER", "Pre-order"], ["ON_REQUEST", "Available on request"], ["OUT_OF_STOCK", "Out of stock"]] },
      { name: "priceMode", label: "Price display", type: "select", options: [["REQUEST_QUOTE", "Request a Quote"], ["CALL_FOR_PRICE", "Call for Price"], ["SHOW_PRICE", "Show price"], ["HIDE", "Hide price"]] },
      { name: "price", label: "Price (BDT)", type: "number", help: "Only shown when 'Show price' is selected" },
      order,
      { name: "isPublished", label: "Published", type: "checkbox" },
      { name: "isFeatured", label: "Featured on homepage", type: "checkbox" },
      { name: "isNewArrival", label: "New arrival", type: "checkbox" },
      ...seo,
    ],
  },
  categories: {
    label: "Category", plural: "Categories", perm: "categories.write", titleField: "name", columns: [["name", "Name"], ["parent.name", "Parent"], ["isPublished", "Published"], ["sortOrder", "Order"]],
    publicPath: (r) => `/products?category=${r.slug}`,
    fields: [
      { name: "name", label: "Name", type: "text", required: true }, { name: "slug", label: "URL slug", type: "text" },
      { name: "parentId", label: "Parent category", type: "relation", relation: "categories" },
      { name: "icon", label: "Icon", type: "select", options: ["laptop", "desktop", "cpu", "monitor", "printer", "wifi", "server", "router", "cctv", "keyboard", "ups", "shield", "network", "storage"].map((v) => [v, v]) },
      { name: "description", label: "Description", type: "textarea", full: true }, { name: "image", label: "Category image", type: "image" },
      order, { name: "isPublished", label: "Published", type: "checkbox" },
    ],
  },
  brands: {
    label: "Brand", plural: "Brands", perm: "brands.write", titleField: "name", columns: [["name", "Name"], ["isActive", "Active"], ["sortOrder", "Order"]],
    fields: [
      { name: "name", label: "Name", type: "text", required: true }, { name: "slug", label: "URL slug", type: "text" },
      { name: "logo", label: "Logo", type: "image" }, { name: "websiteUrl", label: "Website URL", type: "text" },
      { name: "description", label: "Description", type: "textarea", full: true }, order, { name: "isActive", label: "Active (shown on site)", type: "checkbox" },
    ],
  },
  services: {
    label: "Service", plural: "Services", perm: "services.write", titleField: "title", columns: [["title", "Title"], ["isPublished", "Published"], ["sortOrder", "Order"]],
    publicPath: (r) => `/solutions/${r.slug}`,
    fields: [
      { name: "title", label: "Title", type: "text", required: true }, { name: "slug", label: "URL slug", type: "text" },
      { name: "icon", label: "Icon", type: "select", options: ["laptop", "network", "server", "cctv", "building", "wrench", "support", "shield", "wifi"].map((v) => [v, v]) },
      { name: "image", label: "Image", type: "image" }, { name: "summary", label: "Summary", type: "textarea", full: true },
      { name: "features", label: "Features (one per line)", type: "list", full: true }, { name: "description", label: "Description", type: "richtext", full: true },
      order, { name: "isPublished", label: "Published", type: "checkbox" }, ...seo,
    ],
  },
  projects: {
    label: "Project", plural: "Projects", perm: "projects.write", titleField: "title", columns: [["title", "Title"], ["category", "Category"], ["isPublished", "Published"]],
    publicPath: (r) => `/projects/${r.slug}`,
    fields: [
      { name: "title", label: "Title", type: "text", required: true }, { name: "slug", label: "URL slug", type: "text" },
      { name: "category", label: "Category", type: "text", required: true, help: "e.g. Corporate Office Networking" },
      { name: "clientName", label: "Client name (verified only)", type: "text" }, { name: "completedAt", label: "Completion date", type: "date" },
      { name: "coverImage", label: "Cover image", type: "image" }, { name: "summary", label: "Summary", type: "textarea", full: true },
      { name: "description", label: "Description", type: "richtext", full: true }, { name: "implementationDetails", label: "Implementation details", type: "richtext", full: true },
      { name: "technologies", label: "Technologies used (one per line)", type: "list", full: true }, order, { name: "isPublished", label: "Published", type: "checkbox" },
    ],
  },
  testimonials: {
    label: "Testimonial", plural: "Testimonials", perm: "testimonials.write", titleField: "clientName", columns: [["clientName", "Client"], ["organization", "Organization"], ["isPublished", "Published"]],
    fields: [
      { name: "clientName", label: "Client name", type: "text", required: true }, { name: "designation", label: "Designation", type: "text" },
      { name: "organization", label: "Organization", type: "text" }, { name: "image", label: "Photo or logo", type: "image" },
      { name: "quote", label: "Testimonial (real client feedback only)", type: "textarea", required: true, full: true }, order, { name: "isPublished", label: "Published", type: "checkbox" },
    ],
  },
  posts: {
    label: "Article", plural: "News & Insights", perm: "posts.write", titleField: "title", columns: [["title", "Title"], ["category", "Category"], ["status", "Status"]],
    publicPath: (r) => `/news/${r.slug}`,
    fields: [
      { name: "title", label: "Title", type: "text", required: true }, { name: "slug", label: "URL slug", type: "text" },
      { name: "category", label: "Category", type: "text" }, { name: "status", label: "Status", type: "select", options: [["DRAFT", "Draft"], ["PUBLISHED", "Published"]] },
      { name: "coverImage", label: "Cover image", type: "image" }, { name: "excerpt", label: "Excerpt", type: "textarea", full: true },
      { name: "body", label: "Body", type: "richtext", full: true }, ...seo,
    ],
  },
  pages: {
    label: "Page", plural: "Pages", perm: "pages.write", titleField: "title", columns: [["title", "Title"], ["slug", "Slug"], ["status", "Status"]],
    publicPath: (r) => (["privacy-policy", "terms"].includes(String(r.slug)) ? `/${r.slug}` : `/p/${r.slug}`),
    fields: [
      { name: "title", label: "Title", type: "text", required: true }, { name: "slug", label: "URL slug", type: "text" },
      { name: "status", label: "Status", type: "select", options: [["DRAFT", "Draft"], ["PUBLISHED", "Published"]] },
      { name: "body", label: "Content", type: "richtext", full: true }, ...seo,
    ],
  },
  banners: {
    label: "Banner", plural: "Banners", perm: "banners.write", titleField: "title", columns: [["title", "Title"], ["placement", "Placement"], ["isActive", "Active"]],
    fields: [
      { name: "title", label: "Title", type: "text", required: true }, { name: "placement", label: "Placement", type: "select", options: [["home_top", "Homepage"], ["products_top", "Products page"], ["solutions_top", "Solutions page"]] },
      { name: "subtitle", label: "Subtitle", type: "textarea", full: true }, { name: "image", label: "Image", type: "image" },
      { name: "ctaLabel", label: "Button label", type: "text" }, { name: "ctaHref", label: "Button link", type: "text", help: "/path or https://…" },
      order, { name: "isActive", label: "Active", type: "checkbox" },
    ],
  },
};
