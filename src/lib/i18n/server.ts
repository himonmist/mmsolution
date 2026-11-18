import "server-only";
import { cookies } from "next/headers";
import { DICTS, LOCALES, type Locale } from "./dict";

export async function getLocale(): Promise<Locale> {
  const v = (await cookies()).get("lang")?.value;
  return (LOCALES as readonly string[]).includes(v ?? "") ? (v as Locale) : "en";
}
export async function getDict() { return DICTS[await getLocale()]; }

/** Pick a Bangla override from a `translations` JSON column when the locale is bn. */
export function tr<T extends Record<string, unknown>>(row: T & { translations?: unknown }, field: keyof T & string, locale: Locale): string {
  const base = row[field] as string;
  if (locale === "en") return base;
  const t = (row.translations as Record<string, Record<string, string>> | null)?.[locale]?.[field];
  return typeof t === "string" && t.length ? t : base;
}
