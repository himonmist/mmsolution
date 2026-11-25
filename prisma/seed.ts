/**
 * Seed: RBAC, first super admin, and clearly-labelled sample content.
 * Products/projects are flagged isDemo and carry NO invented prices, specs or availability.
 * Run: npm run db:seed   (idempotent — safe to re-run)
 */
import { PrismaClient } from "@prisma/client";
import { ensureSuperAdmin } from "../src/lib/services/auth";
import { seedRange } from "./seed-range";
import { PERMISSIONS, ROLES, ROLE_LABELS, ROLE_PERMISSIONS } from "../src/lib/auth/rbac";

const prisma = new PrismaClient();
const S = (k: string) => `/media/studio/${k}.webp`;

const CATEGORIES = [
  ["Laptop & Notebook", "laptop-notebook", "laptop", "laptop", "Business, ultrabook and performance laptops for every role."],
  ["Desktop Computers", "desktop-computers", "desktop", "desktop", "Office desktops, all-in-ones and professional workstations."],
  ["Computer Components", "computer-components", "cpu", "components", "Memory, storage, processors and upgrade components."],
  ["Monitors & Displays", "monitors-displays", "monitor", "monitor", "Business monitors, large-format and professional displays."],
  ["Printers & Scanners", "printers-scanners", "printer", "printer", "Laser, ink-tank, multifunction printers and scanners."],
  ["Networking Equipment", "networking-equipment", "wifi", "accesspoint", "Wi-Fi access points, cabling, racks and network accessories."],
  ["Servers & Storage", "servers-storage", "server", "server", "Rack and tower servers, NAS and storage solutions."],
  ["Routers & Switches", "routers-switches", "router", "switch", "Managed switches, routers and firewalls for every scale."],
  ["CCTV & Surveillance", "cctv-surveillance", "cctv", "camera", "IP cameras, NVR/DVR systems and access control."],
  ["Accessories & Peripherals", "accessories-peripherals", "keyboard", "accessories", "Keyboards, mice, headsets, docks and everyday accessories."],
  ["UPS & Power Solutions", "ups-power-solutions", "ups", "ups", "Online and line-interactive UPS, stabilisers and power."],
  ["Software & Security Solutions", "software-security", "shield", "shield", "Operating systems, productivity, antivirus and endpoint security."],
] as const;

const BRANDS = ["HP", "Dell", "Lenovo", "ASUS", "Acer", "Cisco", "MikroTik", "TP-Link", "Hikvision", "Dahua", "Logitech", "Epson", "Canon", "HPE"];

// Illustrative products only: real product lines, but specifications/price/availability are left to the CMS.
const PRODUCTS = [
  { name: "HP Business Laptop", brand: "HP", cat: "laptop-notebook", model: "ProBook series", img: "laptop", short: "Durable business notebook line for corporate and SME teams." },
  { name: "Dell Professional Desktop", brand: "Dell", cat: "desktop-computers", model: "OptiPlex series", img: "desktop", short: "Reliable office desktop platform for standardised deployments." },
  { name: "Lenovo ThinkPad Laptop", brand: "Lenovo", cat: "laptop-notebook", model: "ThinkPad series", img: "laptop-graphite", short: "Business laptop line known for keyboards, durability and manageability." },
  { name: "ASUS Business Monitor", brand: "ASUS", cat: "monitors-displays", model: "Business monitor series", img: "monitor", short: "Eye-care business displays for office productivity." },
  { name: "Cisco Network Switch", brand: "Cisco", cat: "routers-switches", model: "Catalyst series", img: "switch", short: "Managed enterprise switching for campus and branch networks." },
  { name: "MikroTik Router", brand: "MikroTik", cat: "routers-switches", model: "RouterBOARD series", img: "router", short: "Flexible routing platform widely used by SMEs and ISPs." },
  { name: "Hikvision IP Camera", brand: "Hikvision", cat: "cctv-surveillance", model: "IP bullet camera series", img: "camera", short: "Network surveillance cameras for indoor and outdoor coverage." },
  { name: "HPE Enterprise Server", brand: "HPE", cat: "servers-storage", model: "ProLiant series", img: "server", short: "Rack server platform for business applications and virtualisation." },
  { name: "TP-Link Access Point", brand: "TP-Link", cat: "networking-equipment", model: "Business Wi-Fi series", img: "accesspoint", short: "Ceiling-mount Wi-Fi access points for offices and campuses." },
  { name: "Epson Ink Tank Printer", brand: "Epson", cat: "printers-scanners", model: "EcoTank series", img: "printer", short: "Low running-cost ink tank printing for offices." },
  { name: "Logitech Keyboard & Mouse Combo", brand: "Logitech", cat: "accessories-peripherals", model: "Wireless combo series", img: "accessories", short: "Everyday wireless input devices for workstations." },
  { name: "Online UPS", brand: null, cat: "ups-power-solutions", model: "Online UPS range", img: "ups", short: "Power protection for servers, networks and critical desks." },
];

const SERVICES = [
  { title: "Computer & IT Equipment Supply", slug: "computer-it-equipment-supply", icon: "laptop", image: "/media/workstation-set.webp",
    summary: "Genuine computers, laptops, workstations, printers and hardware — sourced and delivered for your whole organisation.",
    features: ["Desktop computers", "Business laptops", "Workstations", "Printers and peripherals", "Computer hardware"] },
  { title: "Enterprise Networking Solutions", slug: "enterprise-networking-solutions", icon: "network", image: "/media/server-rack.webp",
    summary: "Structured cabling, LAN/WAN and Wi-Fi infrastructure designed, installed and optimised by our engineers.",
    features: ["LAN/WAN network installation", "Structured cabling", "Network switches and routers", "Wi-Fi infrastructure", "Network configuration and optimization"] },
  { title: "Server & Data Infrastructure", slug: "server-data-infrastructure", icon: "server", image: "/media/server-rack-sm.webp",
    summary: "Server installation, storage, backup and virtualisation infrastructure sized for your workloads.",
    features: ["Server installation", "Storage solutions", "Server configuration", "Data backup infrastructure", "Virtualization infrastructure"] },
  { title: "CCTV & Security Solutions", slug: "cctv-security-solutions", icon: "cctv", image: null,
    summary: "IP camera systems, NVR/DVR configuration and access control for secure premises.",
    features: ["IP camera installation", "CCTV surveillance", "NVR/DVR configuration", "Access control solutions", "Security infrastructure"] },
  { title: "IT Infrastructure Setup", slug: "it-infrastructure-setup", icon: "building", image: null,
    summary: "End-to-end office IT setup — from workstations and networks to installation and ongoing maintenance.",
    features: ["Office IT setup", "Corporate workstation deployment", "Network infrastructure implementation", "IT equipment installation", "Technical maintenance and support"] },
];

const PROJECTS = [
  ["Corporate Office Networking", "Corporate Office Networking", "/media/server-rack.webp", ["Structured cabling", "Managed switches", "Wi-Fi"]],
  ["Enterprise IT Infrastructure Rollout", "Enterprise IT Infrastructure", "/media/workstation-set.webp", ["Workstations", "Active Directory", "Backup"]],
  ["Multi-site CCTV Installation", "CCTV Installation", S("camera"), ["IP cameras", "NVR", "Remote viewing"]],
  ["Educational Institution IT Setup", "Educational Institution IT Setup", S("desktop"), ["Computer lab", "Network", "Projectors"]],
  ["Server Room Implementation", "Server Room Implementation", S("rack"), ["Rack servers", "UPS", "Cable management"]],
  ["Computer Lab Setup", "Computer Lab Setup", "/media/laptop-performance.webp", ["Desktops", "LAN", "Imaging"]],
] as const;

const POSTS = [
  {
    title: "How to Choose the Right Business Laptop", slug: "how-to-choose-the-right-business-laptop", category: "Buying Guide", cover: "/media/laptop-performance.webp",
    excerpt: "Processor, memory, storage, build quality and support — a practical checklist for buying laptops for your team.",
    body: `<p>Buying laptops for a business is different from buying one for yourself. You are choosing a platform your team will rely on for three to five years, so reliability and support matter as much as raw performance.</p><h2>1. Start with the work, not the spec sheet</h2><p>Group your users by workload: office productivity, finance and analytics, design, or field work. Each group has different needs for CPU, memory and screen.</p><h2>2. Memory and storage</h2><p>For modern office work, plan for at least 16&nbsp;GB of memory and an SSD. Upgradeable memory extends a laptop's useful life.</p><h2>3. Build quality and keyboard</h2><p>Business lines are designed for daily travel and long typing sessions. Check hinge quality, keyboard comfort and port selection (USB-C charging, HDMI, Ethernet where needed).</p><h2>4. Security and manageability</h2><p>Look for TPM, fingerprint or IR camera login, and remote management support so your IT team can deploy and secure devices at scale.</p><h2>5. Warranty and after-sales support</h2><p>Confirm warranty terms and local service availability before you buy. Standardising on one or two models simplifies spares and support.</p><p>Need help sizing a laptop fleet? <a href="/quote">Request a business quote</a> and our team will recommend options for each user group.</p>`,
  },
  {
    title: "Essential Networking Infrastructure for Modern Offices", slug: "essential-networking-infrastructure-for-modern-offices", category: "Networking", cover: "/media/server-rack.webp",
    excerpt: "Cabling, switching, Wi-Fi, security and power — the building blocks every modern office network needs.",
    body: `<p>A dependable office network is built in layers. Getting each layer right avoids slow Wi-Fi, dropped calls and difficult troubleshooting later.</p><h2>Structured cabling</h2><p>Quality Cat6/Cat6A cabling, properly terminated, labelled and tested, is the foundation. It outlives every active device you will install.</p><h2>Switching</h2><p>Managed switches allow VLANs, quality of service and monitoring. PoE switches simplify powering access points, IP phones and cameras.</p><h2>Wireless</h2><p>Plan access points from a site survey, not guesswork. Ceiling-mounted business APs with central management provide consistent coverage and roaming.</p><h2>Security and routing</h2><p>A business router or firewall segments guest traffic, enforces policies and provides secure remote access.</p><h2>Power and rack</h2><p>UPS protection and an organised rack keep the network running during outages and make maintenance easier.</p>`,
  },
  {
    title: "Why Businesses Need Professional Network Installation", slug: "why-businesses-need-professional-network-installation", category: "Insights", cover: S("switch"),
    excerpt: "The hidden costs of ad-hoc cabling and consumer equipment — and what a professional installation delivers.",
    body: `<p>Many offices grow their network one cable and one router at a time. The result is often unreliable connectivity that costs far more in lost productivity than a proper installation would have.</p><h2>What professional installation includes</h2><ul><li>Site survey and network design based on users and devices</li><li>Standards-based cabling with testing and labelling</li><li>Correct configuration of switches, VLANs, Wi-Fi and security</li><li>Documentation so future changes are quick and safe</li></ul><h2>The business benefit</h2><p>Fewer outages, faster troubleshooting and a network that can scale as you hire. <a href="/contact?type=NETWORKING_PROJECT">Start a networking project inquiry</a>.</p>`,
  },
  {
    title: "Understanding Enterprise Server Solutions", slug: "understanding-enterprise-server-solutions", category: "Infrastructure", cover: S("server"),
    excerpt: "Tower vs rack, storage options, virtualisation and backup — a primer for growing organisations.",
    body: `<p>When shared files, business applications and email outgrow a single PC, it is time to consider a server. Here is what to evaluate.</p><h2>Form factor</h2><p>Tower servers suit small offices without a rack. Rack servers are denser and easier to manage in a server room.</p><h2>Storage</h2><p>Choose redundant disk configurations (RAID) and consider separate NAS storage for file shares and backups.</p><h2>Virtualisation</h2><p>Running multiple virtual servers on one physical host improves utilisation and simplifies recovery.</p><h2>Backup and power</h2><p>Follow the 3-2-1 backup rule and protect the server with an online UPS. Plan cooling and physical security for the server room.</p>`,
  },
];

const PRIVACY = `<p>This Privacy Policy explains how MM Business Solution collects and uses information submitted through this website.</p><h2>Information we collect</h2><p>When you submit an inquiry, contact or quotation form we collect the details you provide — such as your name, organisation, email address, phone number and message — solely to respond to your request.</p><h2>How we use information</h2><p>We use your information to respond to inquiries, prepare quotations and provide support. We do not sell personal information.</p><h2>Security</h2><p>Submissions are transmitted over HTTPS and stored with access restricted to authorised staff.</p><h2>Cookies</h2><p>We use essential cookies for language preference and, where enabled, analytics to understand site usage.</p><h2>Contact</h2><p>For questions about this policy please <a href="/contact">contact us</a>.</p><p><em>Template text — please review with your legal advisor before publishing.</em></p>`;
const TERMS = `<p>By using this website you agree to these terms.</p><h2>Product information</h2><p>Product names, images and descriptions are provided for information only. Specifications, availability and pricing are confirmed in a formal quotation.</p><h2>Trademarks</h2><p>Brand names and logos belong to their respective owners and are used to identify products.</p><h2>Inquiries</h2><p>Submitting an inquiry does not create a contract. Orders are subject to a confirmed quotation and agreed terms.</p><h2>Liability</h2><p>We make reasonable efforts to keep information accurate but do not warrant that the site is error-free.</p><p><em>Template text — please review with your legal advisor before publishing.</em></p>`;

async function main() {
  // RBAC
  for (const key of PERMISSIONS) await prisma.permission.upsert({ where: { key }, update: {}, create: { key, label: key } });
  for (const key of ROLES) {
    const role = await prisma.role.upsert({ where: { key }, update: { name: ROLE_LABELS[key] }, create: { key, name: ROLE_LABELS[key] } });
    const perms = await prisma.permission.findMany({ where: { key: { in: [...ROLE_PERMISSIONS[key]] } } });
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({ data: perms.map((p) => ({ roleId: role.id, permissionId: p.id })) });
  }

  // First super admin — SEED_ADMIN_PASSWORD is authoritative (changing it in the host's env resets the password on next deploy)
  const email = process.env.SEED_ADMIN_EMAIL ?? "";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "";
  if (email && password) console.log(`Super admin ${email}: ${await ensureSuperAdmin(email, password)}`);

  // Catalogue
  const catIds: Record<string, string> = {};
  for (const [i, [name, slug, icon, img, description]] of CATEGORIES.entries()) {
    const c = await prisma.category.upsert({ where: { slug }, update: {}, create: { name, slug, icon, image: S(img), description, sortOrder: i } });
    catIds[slug] = c.id;
  }
  const brandIds: Record<string, string> = {};
  for (const [i, name] of BRANDS.entries()) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const b = await prisma.brand.upsert({ where: { slug }, update: {}, create: { name, slug, sortOrder: i, description: `${name} products available through MM Business Solution.` } });
    brandIds[name] = b.id;
  }
  for (const [i, p] of PRODUCTS.entries()) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
    if (await prisma.product.findUnique({ where: { slug } })) continue;
    await prisma.product.create({
      data: {
        name: p.name, slug, modelNumber: p.model, shortDescription: p.short, categoryId: catIds[p.cat], brandId: p.brand ? brandIds[p.brand] : null,
        description: `<p>${p.short}</p><p>Configurations vary by model. Contact our team for current models, detailed specifications, warranty terms and a formal quotation.</p>`,
        features: ["Genuine product with manufacturer warranty", "Configuration advice from our team", "Delivery and installation available"],
        isFeatured: i < 8, isNewArrival: i % 4 === 1, isPublished: true, isDemo: true, sortOrder: i,
        availability: "UNSPECIFIED", priceMode: "REQUEST_QUOTE",
        images: { create: [{ url: S(p.img), alt: p.name, sortOrder: 0 }] },
        specifications: { create: [
          { label: "Product line", value: p.model, sortOrder: 0 },
          { label: "Category", value: CATEGORIES.find((c) => c[1] === p.cat)![0], sortOrder: 1 },
          { label: "Configuration", value: "Confirmed on quotation", sortOrder: 2 },
        ] },
      },
    });
  }

  for (const [i, s] of SERVICES.entries()) {
    await prisma.service.upsert({
      where: { slug: s.slug }, update: {},
      create: { ...s, sortOrder: i, description: `<p>${s.summary}</p><h2>What's included</h2><ul>${s.features.map((f) => `<li>${f}</li>`).join("")}</ul><h2>How we work</h2><p>Every engagement starts with understanding your requirements, followed by a recommended design, supply, professional installation and long-term support.</p>` },
    });
  }

  await seedRange(prisma);

  for (const [i, [title, category, cover, tech]] of PROJECTS.entries()) {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await prisma.project.upsert({
      where: { slug }, update: {},
      create: {
        title, slug, category, coverImage: cover, technologies: [...tech], isPublished: true, isDemo: true, sortOrder: i,
        summary: `Sample project entry illustrating a typical ${category.toLowerCase()} engagement. Replace with a verified case study from the CMS.`,
        description: `<p>This is placeholder content to demonstrate the portfolio layout. Publish only verified, completed projects and approved client names.</p>`,
      },
    });
  }

  for (const p of POSTS) {
    await prisma.blogPost.upsert({
      where: { slug: p.slug }, update: {},
      create: { title: p.title, slug: p.slug, excerpt: p.excerpt, body: p.body, coverImage: p.cover, category: p.category, status: "PUBLISHED", publishedAt: new Date() },
    });
  }

  await prisma.page.upsert({ where: { slug: "privacy-policy" }, update: {}, create: { title: "Privacy Policy", slug: "privacy-policy", status: "PUBLISHED", body: PRIVACY } });
  await prisma.page.upsert({ where: { slug: "terms" }, update: {}, create: { title: "Terms & Conditions", slug: "terms", status: "PUBLISHED", body: TERMS } });
  console.log("Seed complete.");
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
