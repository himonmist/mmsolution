import { safeJsonLd } from "@/lib/seo";

/** JSON-LD is a data block (not executed), so CSP nonces are unnecessary. Content is escaped by safeJsonLd. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />;
}
