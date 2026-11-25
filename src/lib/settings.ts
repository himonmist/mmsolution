import { cache } from "react";
import { z } from "zod";
import { prisma } from "@/lib/db";

const link = z.object({ label: z.string().max(60), href: z.string().max(300) });
export const SETTINGS_SCHEMAS = {
  contact: z.object({
    companyName: z.string().max(120), email: z.string().max(160), phone: z.string().max(40), whatsapp: z.string().max(40),
    address: z.string().max(400), hours: z.string().max(160), mapEmbedUrl: z.string().max(600).optional().default(""),
  }),
  social: z.object({ facebook: z.string().max(300), linkedin: z.string().max(300), youtube: z.string().max(300), showFacebookFeed: z.boolean().default(false) }),
  hero: z.object({ eyebrow: z.string().max(80), heading: z.string().max(160), description: z.string().max(600), primaryCta: link, secondaryCta: link }),
  intro: z.object({ heading: z.string().max(160), body: z.string().max(1200), pillars: z.array(z.object({ title: z.string().max(80), body: z.string().max(300) })).max(6) }),
  stats: z.object({
    /** Custom, company-verified figures. Leave empty to show only live catalogue counts. */
    custom: z.array(z.object({ label: z.string().max(60), value: z.coerce.number().min(0).max(1e9), suffix: z.string().max(6).default("") })).max(6),
    showLiveCounts: z.boolean().default(true),
  }),
  seo: z.object({ title: z.string().max(70), description: z.string().max(170), ogImage: z.string().max(300).optional().default("") }),
  integrations: z.object({ gaId: z.string().max(30).regex(/^(G-[A-Z0-9]+)?$/).default(""), gscVerification: z.string().max(100).regex(/^[\w-]*$/).default(""), chatbotEnabled: z.boolean().default(true), chatbotGreeting: z.string().max(300) }),
  about: z.object({ heading: z.string().max(160), body: z.string().max(5000), mission: z.string().max(600), vision: z.string().max(600) }),
} as const;
export type SettingsKey = keyof typeof SETTINGS_SCHEMAS;
export type Settings = { [K in SettingsKey]: z.infer<(typeof SETTINGS_SCHEMAS)[K]> };

export const DEFAULT_SETTINGS: Settings = {
  contact: {
    companyName: "MM Business Solution",
    email: "info@mmbusinesssolution.com",
    phone: "+88 01866208620",
    whatsapp: "8801866208620",
    address: "261/3/B, West Agargaon Road,\nOli Market, Mirpur,\nDhaka-1216.",
    hours: "Saturday – Thursday, 9:30 AM – 7:00 PM",
    mapEmbedUrl: "",
  },
  social: { facebook: "", linkedin: "", youtube: "", showFacebookFeed: false },
  hero: {
    eyebrow: "Smarter IT | Better Business",
    heading: "Powering Businesses Through Smarter Technology.",
    description: "From high-performance computing devices to enterprise networking infrastructure, MM Business Solution delivers reliable IT products and intelligent technology solutions that keep your business connected, productive and future-ready.",
    primaryCta: { label: "Explore Our Products", href: "/products" },
    secondaryCta: { label: "Discover Our Solutions", href: "/solutions" },
  },
  intro: {
    heading: "Your Trusted Partner for Complete IT Solutions.",
    body: "MM Business Solution provides dependable IT products, professional technology services and integrated infrastructure solutions designed to support modern businesses.",
    pillars: [
      { title: "Quality IT Products", body: "Genuine computers, networking, security and power equipment sourced for business-grade reliability." },
      { title: "Professional IT Implementation", body: "Structured cabling, LAN/WAN, Wi-Fi, servers and CCTV — planned, installed and documented properly." },
      { title: "Reliable Technical Support", body: "Responsive after-sales support and maintenance that keeps your operations running." },
    ],
  },
  stats: { custom: [], showLiveCounts: true },
  seo: {
    title: "MM Business Solution — Smarter IT | Better Business",
    description: "IT products supplier and technology solutions provider in Bangladesh: laptops, desktops, networking, servers, CCTV, installation and corporate IT support.",
    ogImage: "",
  },
  integrations: { gaId: "", gscVerification: "", chatbotEnabled: true, chatbotGreeting: "Hi! I'm the MM assistant. Looking for a product, a networking project or a quotation?" },
  about: {
    heading: "Technology partner for Bangladeshi businesses",
    body: "MM Business Solution is a Bangladesh-based IT products supplier and technology solutions provider. We supply computers, laptops, monitors, printers, networking devices, servers, security equipment and power solutions — and we design, install and support the infrastructure that connects them.",
    mission: "Help organisations of every size adopt dependable technology with honest advice, genuine products and professional implementation.",
    vision: "To be the most trusted single-window IT partner for corporate, government, education and SME customers in Bangladesh.",
  },
};

export const getSettings = cache(async (): Promise<Settings> => {
  const rows = await prisma.siteSetting.findMany();
  const out = structuredClone(DEFAULT_SETTINGS) as Record<string, unknown>;
  for (const r of rows) {
    const schema = (SETTINGS_SCHEMAS as Record<string, z.ZodTypeAny>)[r.key];
    if (!schema) continue;
    const parsed = schema.safeParse({ ...(out[r.key] as object), ...(r.value as object) });
    if (parsed.success) out[r.key] = parsed.data;
  }
  return out as Settings;
});
