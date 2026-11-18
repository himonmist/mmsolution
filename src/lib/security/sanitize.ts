import sanitizeHtml from "sanitize-html";

const RICH: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "blockquote",
    "ul", "ol", "li", "a", "img", "figure", "figcaption", "hr", "table", "thead", "tbody", "tr", "th", "td", "code", "pre"],
  allowedAttributes: { a: ["href", "title", "rel"], img: ["src", "alt", "width", "height"], th: ["colspan"], td: ["colspan"] },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["https", "http"] },
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
  transformTags: {
    a: (tagName, attribs) => ({ tagName, attribs: { ...attribs, rel: "noopener noreferrer nofollow" } }),
  },
};

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html ?? "", RICH);
}

export function stripTags(html: string): string {
  return sanitizeHtml(html ?? "", { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
}
