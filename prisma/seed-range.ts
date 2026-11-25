/**
 * Range additions (Nov 2026): Canon printing & copier consumables, Autodesk/Adobe software,
 * extended services, and official contact details. Idempotent: only creates what is missing.
 */
import type { PrismaClient, Prisma } from "@prisma/client";

const S = (k: string) => `/media/studio/${k}.webp`;

export const CONTACT = {
  companyName: "MM Business Solution",
  email: "info@mmbusinesssolution.com",
  phone: "+88 01866208620",
  whatsapp: "8801866208620",
  address: "261/3/B, West Agargaon Road,\nOli Market, Mirpur,\nDhaka-1216.",
  hours: "Saturday – Thursday, 9:30 AM – 7:00 PM",
  mapEmbedUrl: "",
};

const SUBCATEGORIES = [
  { parent: "printers-scanners", name: "Photocopiers & MFPs", slug: "photocopiers-mfps", icon: "printer", img: "photocopier", description: "Canon imageRUNNER office copiers and multifunction systems — print, copy, scan and fax." },
  { parent: "printers-scanners", name: "Toner & Cartridges", slug: "toner-cartridges", icon: "printer", img: "toner-set", description: "Genuine Canon copier toners (NPG series) and printer cartridges." },
];

const NEW_BRANDS = [
  { name: "Autodesk", slug: "autodesk", websiteUrl: "https://www.autodesk.com", description: "Design and engineering software — AutoCAD, Revit, 3ds Max and the industry collections." },
  { name: "Adobe", slug: "adobe", websiteUrl: "https://www.adobe.com", description: "Creative, document and marketing software — Creative Cloud and Acrobat." },
];
const BRAND_SITES: Record<string, string> = { canon: "https://www.canon.com" };

type P = {
  name: string; slug: string; brand: string; cat: string; model?: string; img: string; gallery?: string[]; short: string; body: string;
  features: string[]; specs: [string, string, string?][]; featured?: boolean; isNew?: boolean;
};

/** Official Canon product photos (asia.canon), re-encoded locally. Shown as the main images for these products. */
const CANON_PHOTOS: Record<string, { url: string; alt: string }[]> = {
  "canon-laser-printer": [
    { url: "/media/canon/imageclass-lbp6130n.webp", alt: "Canon imageCLASS LBP6130n laser printer" },
    { url: "/media/canon/imageclass-mf3020w.webp", alt: "Canon imageCLASS MF3020w laser multifunction printer" },
  ],
  "canon-ink-tank-printer": [
    { url: "/media/canon/pixma-g3010.webp", alt: "Canon PIXMA G3010 ink tank printer" },
    { url: "/media/canon/pixma-g3010-front.webp", alt: "Canon PIXMA G3010 front view with ink tanks" },
  ],
  "canon-photocopier-imagerunner": [
    { url: "/media/canon/imagerunner-advance-dx-c3935i.webp", alt: "Canon imageRUNNER ADVANCE DX C3935i multifunction copier" },
    { url: "/media/canon/imagerunner-advance-dx-c3935i-finisher.webp", alt: "Canon imageRUNNER ADVANCE DX C3935i with booklet finisher" },
  ],
};

const toner = (code: string, colour: string, fits: string, models: string[]): P => ({
  name: `Canon ${code} Toner`, slug: `canon-${code.toLowerCase()}-toner`, brand: "canon", cat: "toner-cartridges", model: code,
  img: colour.includes("Cyan") ? "toner-set" : "toner", gallery: colour.includes("Cyan") ? ["toner"] : undefined,
  short: `Genuine Canon ${code} copier toner (${colour}) for ${fits}.`,
  body: `<p>The Canon <strong>${code}</strong> toner is designed for ${fits}. Using genuine Canon toner protects print quality, page yield and the copier's drum and fuser.</p>
<h3>Compatible copiers</h3><ul>${models.map((m) => `<li>${m}</li>`).join("")}</ul>
<p>Not sure which toner your machine uses? Send us the copier model number and we'll confirm before you order. Bulk and corporate supply available.</p>`,
  features: ["Genuine Canon consumable", "Consistent output and page yield", "Model compatibility checked before supply", "Bulk & contract supply for offices"],
  specs: [["Brand", "Canon"], ["Toner code", code], ["Colour", colour], ["Type", "Copier toner bottle"], ["Compatible series", fits]],
});

const PRODUCTS: P[] = [
  {
    name: "Canon Laser Printer", slug: "canon-laser-printer", brand: "canon", cat: "printers-scanners", model: "imageCLASS series", img: "printer", featured: true,
    short: "Canon imageCLASS mono and colour laser printers for fast, reliable office printing.",
    body: `<p>Canon <strong>imageCLASS</strong> laser printers deliver sharp, fast output for offices of every size — from compact single-function printers to network-ready multifunction models that print, copy and scan.</p><p>We help you pick the right model for your monthly volume, paper sizes and network, and keep you supplied with genuine toner.</p>`,
    features: ["Mono and colour laser options", "Network & wireless printing (model dependent)", "Automatic duplex on most models", "Genuine Canon toner supply"],
    specs: [["Brand", "Canon"], ["Series", "imageCLASS"], ["Technology", "Laser"], ["Functions", "Print / Print-Copy-Scan (model dependent)"], ["Exact model & specs", "Confirmed on quotation"]],
  },
  {
    name: "Canon Ink Tank Printer", slug: "canon-ink-tank-printer", brand: "canon", cat: "printers-scanners", model: "PIXMA G series", img: "printer",
    short: "Canon PIXMA G-series refillable ink tank printers with very low running cost.",
    body: `<p>Canon <strong>PIXMA G series</strong> printers use refillable ink tanks for a very low cost per page — ideal for schools, small offices and colour document printing.</p>`,
    features: ["Refillable high-capacity ink tanks", "Low cost per page", "Colour printing, copying and scanning (model dependent)", "Wireless models available"],
    specs: [["Brand", "Canon"], ["Series", "PIXMA G"], ["Technology", "Ink tank"], ["Exact model & specs", "Confirmed on quotation"]],
  },
  {
    name: "Canon Photocopier (imageRUNNER)", slug: "canon-photocopier-imagerunner", brand: "canon", cat: "photocopiers-mfps", model: "imageRUNNER / imageRUNNER ADVANCE", img: "photocopier", featured: true, isNew: true,
    short: "Canon imageRUNNER office photocopiers — print, copy, scan and send for busy offices.",
    body: `<p>Canon <strong>imageRUNNER</strong> and <strong>imageRUNNER ADVANCE</strong> multifunction copiers are built for shared, high-volume office use: A3/A4 printing, copying, network scanning and secure document workflows.</p>
<h3>We provide</h3><ul><li>Model selection by monthly volume (mono or colour)</li><li>Delivery, installation and network setup</li><li>Genuine toner (NPG series) and parts supply</li><li>Preventive maintenance and service support</li></ul>`,
    features: ["A3/A4 print, copy & scan", "Mono and colour models", "Network scan to email/folder", "Installation, toner supply & maintenance"],
    specs: [["Brand", "Canon"], ["Series", "imageRUNNER / imageRUNNER ADVANCE"], ["Functions", "Print, copy, scan, send"], ["Paper size", "Up to A3 (model dependent)"], ["Consumables", "Canon NPG-series toner"], ["Exact model & speed", "Confirmed on quotation"]],
  },
  toner("NPG-51", "Black", "Canon imageRUNNER 2520 / 2525 / 2530 series copiers", ["imageRUNNER 2520 / 2520i", "imageRUNNER 2525 / 2525i", "imageRUNNER 2530 / 2530i"]),
  toner("NPG-67", "Black, Cyan, Magenta, Yellow", "Canon imageRUNNER ADVANCE C3020 / C3300 / C3500 series colour copiers", ["imageRUNNER ADVANCE C3020", "imageRUNNER ADVANCE C3320 / C3320L", "imageRUNNER ADVANCE C3325 / C3330", "imageRUNNER ADVANCE C3520 / C3525 / C3530"]),
  toner("NPG-88", "Black, Cyan, Magenta, Yellow", "Canon imageRUNNER ADVANCE C3300 / DX C3900 series colour copiers", ["imageRUNNER ADVANCE C3326 / C3322L", "imageRUNNER ADVANCE DX C3922 / C3926", "imageRUNNER ADVANCE DX C3930 / C3935"]),
  {
    name: "Canon Printer Cartridges", slug: "canon-printer-cartridges", brand: "canon", cat: "toner-cartridges", model: "Toner & ink cartridges", img: "cartridge",
    short: "Genuine Canon toner and ink cartridges for imageCLASS laser and PIXMA printers.",
    body: `<p>Genuine Canon <strong>toner cartridges</strong> (e.g. Cartridge 0xx series for imageCLASS) and <strong>ink cartridges</strong> for PIXMA printers. Tell us your printer model and we'll supply the correct cartridge.</p>`,
    features: ["Genuine Canon cartridges", "Laser toner and inkjet options", "Correct cartridge matched to your printer", "Corporate & bulk supply"],
    specs: [["Brand", "Canon"], ["Type", "Toner / ink cartridge"], ["Compatibility", "Matched to your printer model"]],
  },
  {
    name: "Autodesk AutoCAD", slug: "autodesk-autocad", brand: "autodesk", cat: "software-security", model: "AutoCAD subscription", img: "software-cad", featured: true, isNew: true,
    short: "Genuine AutoCAD subscriptions for 2D drafting and 3D design — licensed and supported.",
    body: `<p><strong>AutoCAD</strong> is Autodesk's industry-standard software for precise 2D drafting, documentation and 3D modelling, used across architecture, engineering and manufacturing. AutoCAD subscriptions include access to specialised toolsets.</p>
<h3>Licensing options</h3><ul><li>AutoCAD and AutoCAD LT subscriptions (monthly / annual / multi-year)</li><li>Named-user licences for teams</li><li>Industry collections (e.g. Architecture, Engineering & Construction)</li></ul><p>We handle quotation, procurement, activation and renewal reminders.</p>`,
    features: ["Genuine Autodesk subscription", "AutoCAD & AutoCAD LT options", "Team / named-user licensing", "Activation & renewal support"],
    specs: [["Publisher", "Autodesk"], ["Product", "AutoCAD / AutoCAD LT"], ["Licence type", "Subscription (named user)"], ["Term", "Monthly / 1-year / 3-year"], ["Platform", "Windows, macOS (AutoCAD)"]],
  },
  {
    name: "Autodesk AEC Collection (Revit & more)", slug: "autodesk-aec-collection", brand: "autodesk", cat: "software-security", model: "Architecture, Engineering & Construction Collection", img: "software-cad",
    short: "Revit, AutoCAD, Civil 3D, Navisworks and more in one Autodesk BIM collection.",
    body: `<p>The <strong>Autodesk Architecture, Engineering &amp; Construction (AEC) Collection</strong> bundles BIM and CAD tools such as <strong>Revit</strong>, <strong>AutoCAD</strong>, <strong>Civil 3D</strong> and <strong>Navisworks</strong> — ideal for consultancies, contractors and design firms.</p>`,
    features: ["Revit for BIM", "AutoCAD with toolsets", "Civil 3D & Navisworks", "Volume and renewal management"],
    specs: [["Publisher", "Autodesk"], ["Includes", "Revit, AutoCAD, Civil 3D, Navisworks and more"], ["Licence type", "Subscription (named user)"]],
  },
  {
    name: "Adobe Creative Cloud", slug: "adobe-creative-cloud", brand: "adobe", cat: "software-security", model: "Creative Cloud for teams", img: "software-creative", featured: true,
    short: "Photoshop, Illustrator, InDesign, Premiere Pro and more — Creative Cloud for teams.",
    body: `<p><strong>Adobe Creative Cloud</strong> gives your team Photoshop, Illustrator, InDesign, Premiere Pro, After Effects, Acrobat and more, with shared libraries and centralised licence management through the Admin Console.</p>
<h3>Options</h3><ul><li>Creative Cloud All Apps or single-app plans</li><li>Creative Cloud for teams / enterprise</li><li>Education licensing (eligible institutions)</li></ul>`,
    features: ["All Apps or single-app plans", "Teams licence management", "Cloud storage & libraries", "Procurement & renewal support"],
    specs: [["Publisher", "Adobe"], ["Includes", "Photoshop, Illustrator, InDesign, Premiere Pro and more"], ["Licence type", "Subscription (annual)"], ["Platform", "Windows, macOS"]],
  },
  {
    name: "Adobe Acrobat Pro", slug: "adobe-acrobat-pro", brand: "adobe", cat: "software-security", model: "Acrobat Pro for teams", img: "software-creative",
    short: "Create, edit, convert, sign and protect PDFs with Adobe Acrobat Pro.",
    body: `<p><strong>Adobe Acrobat Pro</strong> lets your team create, edit, convert, compare and protect PDFs, and collect e-signatures with Acrobat Sign features — on desktop, web and mobile.</p>`,
    features: ["Edit & convert PDFs", "E-signatures", "Password protection & redaction", "Team licence management"],
    specs: [["Publisher", "Adobe"], ["Product", "Acrobat Pro"], ["Licence type", "Subscription (annual)"], ["Platform", "Windows, macOS, web, mobile"]],
  },
];

const SERVICES = [
  { title: "Software Licensing & Solutions", slug: "software-licensing-solutions", icon: "shield", image: null,
    summary: "Genuine software licensing — Autodesk, Adobe, Microsoft, antivirus and more — with deployment and renewal management.",
    features: ["Autodesk AutoCAD, Revit & collections", "Adobe Creative Cloud & Acrobat", "Microsoft 365 & Windows licensing", "Antivirus & endpoint security", "Licence compliance & renewals"] },
  { title: "Printing & Document Solutions", slug: "printing-document-solutions", icon: "printer", image: null,
    summary: "Canon printers and photocopiers with genuine toner supply, installation and maintenance for uninterrupted printing.",
    features: ["Canon printers & imageRUNNER copiers", "Genuine NPG toner & cartridges", "Installation & network scanning setup", "Preventive maintenance", "Toner supply contracts"] },
  { title: "Audio-Visual & Video Conferencing", slug: "audio-visual-video-conferencing", icon: "monitor", image: null,
    summary: "Meeting-room displays, projectors and video-conferencing systems designed and installed for hybrid work.",
    features: ["Conference room design", "Interactive displays & projectors", "Video-conferencing cameras & audio", "Teams / Zoom room setup", "Cabling & installation"] },
  { title: "Cloud, Email & Backup", slug: "cloud-email-backup", icon: "globe", image: null,
    summary: "Business email, Microsoft 365 / Google Workspace, cloud backup and migration handled end to end.",
    features: ["Business email setup", "Microsoft 365 & Google Workspace", "Cloud & on-site backup", "Data migration", "Security & access policies"] },
  { title: "IT Maintenance & AMC", slug: "it-maintenance-amc", icon: "support", image: null,
    summary: "Annual maintenance contracts for computers, printers, networks and servers with on-site and remote support.",
    features: ["Annual maintenance contracts (AMC)", "On-site & remote support", "Preventive maintenance visits", "Hardware repair & replacement", "Asset & warranty tracking"] },
];

export async function seedRange(prisma: PrismaClient) {
  // Official contact details — only if the CMS hasn't saved its own yet
  await prisma.siteSetting.upsert({ where: { key: "contact" }, update: {}, create: { key: "contact", value: CONTACT as Prisma.InputJsonValue } });

  const parents = Object.fromEntries((await prisma.category.findMany({ select: { id: true, slug: true } })).map((c) => [c.slug, c.id]));
  for (const [i, c] of SUBCATEGORIES.entries()) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: { name: c.name, slug: c.slug, icon: c.icon, image: S(c.img), description: c.description, parentId: parents[c.parent] ?? null, sortOrder: 100 + i } });
  }
  const maxBrand = (await prisma.brand.aggregate({ _max: { sortOrder: true } }))._max.sortOrder ?? 0;
  for (const [i, b] of NEW_BRANDS.entries()) {
    await prisma.brand.upsert({ where: { slug: b.slug }, update: {}, create: { ...b, sortOrder: maxBrand + 1 + i } });
  }
  for (const [slug, url] of Object.entries(BRAND_SITES)) await prisma.brand.updateMany({ where: { slug, websiteUrl: null }, data: { websiteUrl: url } });

  const cats = Object.fromEntries((await prisma.category.findMany({ select: { id: true, slug: true } })).map((c) => [c.slug, c.id]));
  const brands = Object.fromEntries((await prisma.brand.findMany({ select: { id: true, slug: true } })).map((b) => [b.slug, b.id]));
  for (const [i, p] of PRODUCTS.entries()) {
    if (await prisma.product.findUnique({ where: { slug: p.slug } })) continue;
    await prisma.product.create({
      data: {
        name: p.name, slug: p.slug, modelNumber: p.model, shortDescription: p.short, description: p.body, features: p.features,
        categoryId: cats[p.cat], brandId: brands[p.brand] ?? null, isFeatured: !!p.featured, isNewArrival: !!p.isNew, isPublished: true, isDemo: false,
        sortOrder: 50 + i, availability: "ON_REQUEST", priceMode: "REQUEST_QUOTE",
        seoTitle: p.name.slice(0, 70), seoDescription: p.short.slice(0, 170),
        images: { create: (CANON_PHOTOS[p.slug] ?? [p.img, ...(p.gallery ?? [])].map((k) => ({ url: S(k), alt: p.name }))).map((im, j) => ({ ...im, sortOrder: j })) },
        specifications: { create: p.specs.map(([label, value, group], j) => ({ label, value, group, sortOrder: j })) },
      },
    });
  }
  // Upgrade existing products from 3D renders to official photos — never touches images uploaded in the CMS.
  for (const [slug, photos] of Object.entries(CANON_PHOTOS)) {
    const prod = await prisma.product.findUnique({ where: { slug }, include: { images: true } });
    if (!prod || !prod.images.every((im) => im.url.startsWith("/media/studio/"))) continue;
    await prisma.$transaction([
      prisma.productImage.deleteMany({ where: { productId: prod.id } }),
      prisma.productImage.createMany({ data: photos.map((im, j) => ({ ...im, productId: prod.id, sortOrder: j })) }),
    ]);
  }
  const maxSvc = (await prisma.service.aggregate({ _max: { sortOrder: true } }))._max.sortOrder ?? 0;
  for (const [i, s] of SERVICES.entries()) {
    await prisma.service.upsert({
      where: { slug: s.slug }, update: {},
      create: { ...s, sortOrder: maxSvc + 1 + i, description: `<p>${s.summary}</p><h2>What's included</h2><ul>${s.features.map((f) => `<li>${f}</li>`).join("")}</ul><h2>How we work</h2><p>We start by understanding your requirements, recommend the right solution, then supply, install and support it long term.</p>` },
    });
  }
}
