import { sanitizeRichText } from "@/lib/security/sanitize";

/** Renders CMS HTML. Content is sanitised on write AND again on render (defence in depth). */
export function RichText({ html, className = "" }: { html?: string | null; className?: string }) {
  if (!html) return null;
  return <div className={`prose-mm ${className}`} dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }} />;
}
