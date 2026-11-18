import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/whatsapp";

export type ChatLink = { label: string; href: string };
export type ChatReply = { reply: string; links: ChatLink[]; suggestions: string[] };

const INTENTS: [string, RegExp][] = [
  ["greeting", /^(hi|hello|hey|salam|assalamu|হাই|হ্যালো|আসসালামু)/i],
  ["quote", /(quote|quotation|price|pricing|cost|budget|rate|দাম|কোটেশন|মূল্য)/i],
  ["networking", /(network|lan|wan|cabling|wifi|wi-fi|switch|router|firewall|নেটওয়ার্ক)/i],
  ["cctv", /(cctv|camera|surveillance|nvr|dvr|access control|সিসিটিভি|ক্যামেরা)/i],
  ["server", /(server|storage|nas|backup|virtuali|data ?cent|সার্ভার)/i],
  ["contact", /(contact|phone|call|email|address|office|location|where|যোগাযোগ|ঠিকানা|ফোন)/i],
  ["hours", /(hour|open|time|close|when|সময়)/i],
  ["support", /(support|repair|maintenance|warranty|service center|সাপোর্ট)/i],
  ["human", /(human|agent|person|talk to|whatsapp|representative)/i],
];

export function classifyIntent(text: string): string {
  const t = text.trim();
  for (const [name, re] of INTENTS) if (re.test(t)) return name;
  return "product";
}

const DEFAULT_SUGGESTIONS = ["Browse laptops", "Networking project", "Request a quote", "Contact details"];

export async function chatReply(raw: string): Promise<ChatReply> {
  const text = raw.replace(/[\u0000-\u001f]/g, " ").trim().slice(0, 300);
  const s = await getSettings();
  const wa = whatsappLink(s.contact.whatsapp, `Hello MM Business Solution — ${text}`);
  const human: ChatLink[] = wa ? [{ label: "Chat on WhatsApp", href: wa }] : [{ label: "Contact our team", href: "/contact" }];
  if (!text) return { reply: s.integrations.chatbotGreeting, links: [], suggestions: DEFAULT_SUGGESTIONS };

  switch (classifyIntent(text)) {
    case "greeting":
      return { reply: s.integrations.chatbotGreeting, links: [], suggestions: DEFAULT_SUGGESTIONS };
    case "quote":
      return { reply: "We prepare tailored business proposals — share your requirements and quantities and our team will respond with a quotation.", links: [{ label: "Request a quote", href: "/quote" }, ...human], suggestions: ["Networking project", "Browse products"] };
    case "networking":
      return { reply: "We design and install structured cabling, LAN/WAN, enterprise Wi-Fi and network configuration. Tell us about your site and an engineer will get back to you.", links: [{ label: "Networking solutions", href: "/solutions/enterprise-networking-solutions" }, { label: "Start a project inquiry", href: "/contact?type=NETWORKING_PROJECT" }], suggestions: ["CCTV installation", "Request a quote"] };
    case "cctv":
      return { reply: "We supply and install IP cameras, NVR/DVR systems and access control, configured for remote viewing.", links: [{ label: "CCTV & security", href: "/solutions/cctv-security-solutions" }, { label: "Browse CCTV products", href: "/products?category=cctv-surveillance" }], suggestions: ["Request a quote", "Contact details"] };
    case "server":
      return { reply: "From rack servers and storage to backup and virtualisation infrastructure — we size, install and configure it.", links: [{ label: "Server & data infrastructure", href: "/solutions/server-data-infrastructure" }, { label: "Servers & storage", href: "/products?category=servers-storage" }], suggestions: ["Request a quote", "Talk to a human"] };
    case "contact":
      return { reply: `You can reach us at ${s.contact.phone} or ${s.contact.email}. Office: ${s.contact.address}.`, links: [{ label: "Contact page", href: "/contact" }, ...human], suggestions: ["Office hours", "Request a quote"] };
    case "hours":
      return { reply: `Our office hours are ${s.contact.hours}. You can submit an inquiry any time.`, links: [{ label: "Send an inquiry", href: "/contact" }], suggestions: ["Contact details"] };
    case "support":
      return { reply: "For technical support and maintenance, please share your issue and organisation — our support team will follow up.", links: [{ label: "Support request", href: "/contact?type=GENERAL" }, ...human], suggestions: ["Contact details"] };
    case "human":
      return { reply: "Sure — connect with our team directly.", links: human, suggestions: [] };
    default: {
      const words = text.replace(/^(browse|show|find|need|looking for|i want|do you have)\s+/i, "").split(/\s+/).filter((w) => w.length > 1).slice(0, 4);
      const term = words.join(" ");
      const or = words.flatMap((w) => [
        { name: { contains: w, mode: "insensitive" as const } }, { brand: { name: { contains: w, mode: "insensitive" as const } } },
        { category: { name: { contains: w.replace(/s$/i, ""), mode: "insensitive" as const } } },
      ]);
      const products = or.length ? await prisma.product.findMany({ where: { isPublished: true, OR: or }, take: 4, select: { name: true, slug: true } }) : [];
      if (products.length) {
        return { reply: `Here's what I found for “${term}”. Open a product to see details or send an inquiry.`, links: [...products.map((p) => ({ label: p.name, href: `/products/${p.slug}` })), { label: "Search all products", href: `/products?q=${encodeURIComponent(term)}` }], suggestions: ["Request a quote", "Talk to a human"] };
      }
      return { reply: "I couldn't find an exact match — our team can source most IT products. Send an inquiry and we'll get back to you.", links: [{ label: "Browse catalogue", href: "/products" }, { label: "Send an inquiry", href: "/contact" }, ...human], suggestions: DEFAULT_SUGGESTIONS };
    }
  }
}
