import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/search", "/studio"] }], sitemap: `${siteUrl()}/sitemap.xml`, host: siteUrl() };
}
