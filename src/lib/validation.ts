import { z } from "zod";
import { SLUG_RE } from "./slug";

const text = (max: number) => z.string().trim().max(max);
const optText = (max: number) => z.string().trim().max(max).optional().or(z.literal("").transform(() => undefined));
const email = z.string().trim().toLowerCase().max(160).email();
const phone = z.string().trim().max(24).regex(/^\+?[0-9][0-9\s\-()]{6,22}$/, "Invalid phone number");

export const INQUIRY_TYPES = ["GENERAL", "PRODUCT", "NETWORKING_PROJECT", "CORPORATE_QUOTE"] as const;
export const INQUIRY_STATUSES = ["NEW", "IN_REVIEW", "QUOTATION_SENT", "IN_PROGRESS", "COMPLETED", "CLOSED"] as const;

/** Public inquiry payload. Unknown keys are stripped (no mass assignment of status/assignee). */
export const inquirySchema = z.object({
  type: z.enum(INQUIRY_TYPES),
  name: text(120).min(2),
  company: optText(160),
  email,
  phone: phone.optional().or(z.literal("").transform(() => undefined)),
  productId: optText(40),
  productName: optText(200),
  quantity: z.coerce.number().int().min(1).max(100_000).optional(),
  subject: optText(200),
  message: text(5000).min(5),
  meta: z.record(z.string().max(40), z.string().max(300)).optional(),
});
export type InquiryInput = z.infer<typeof inquirySchema>;

export const loginSchema = z.object({ email, password: z.string().min(1).max(128) });

const slug = z.string().trim().max(96).regex(SLUG_RE, "Use lowercase letters, numbers and dashes");

export const productSchema = z.object({
  name: text(200).min(1),
  slug: slug.optional(),
  modelNumber: optText(120),
  shortDescription: optText(400),
  description: optText(50_000),
  categoryId: text(40).min(1),
  brandId: optText(40),
  availability: z.enum(["IN_STOCK", "LIMITED", "PRE_ORDER", "ON_REQUEST", "OUT_OF_STOCK", "UNSPECIFIED"]).default("UNSPECIFIED"),
  priceMode: z.enum(["SHOW_PRICE", "CALL_FOR_PRICE", "REQUEST_QUOTE", "HIDE"]).default("REQUEST_QUOTE"),
  price: z.coerce.number().min(0).max(1e10).optional(),
  features: z.array(text(200)).max(40).default([]),
  specifications: z.array(z.object({ label: text(80).min(1), value: text(400).min(1), group: optText(60) })).max(80).default([]),
  images: z.array(z.object({ url: text(500).min(1), alt: optText(200) })).max(20).default([]),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(-100000).max(100000).default(0),
  seoTitle: optText(70),
  seoDescription: optText(170),
});

export const resetRequestSchema = z.object({ email });
export const resetSchema = z.object({ token: z.string().min(20).max(200), password: z.string().min(1).max(128) });
