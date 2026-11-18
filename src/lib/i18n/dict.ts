export const LOCALES = ["en", "bn"] as const;
export type Locale = (typeof LOCALES)[number];

const en = {
  nav: { home: "Home", about: "About Us", products: "Products", solutions: "Solutions & Services", brands: "Brands", projects: "Projects", news: "News & Insights", contact: "Contact Us" },
  cta: { quote: "Request a Quote", inquiry: "Request Product Inquiry", details: "View Details", explore: "Explore Products", whatsapp: "WhatsApp", contact: "Contact Our Team", businessQuote: "Request a Business Quote" },
  common: { search: "Search", searchPlaceholder: "Search products, brands, services…", allCategories: "All categories", allBrands: "All brands", products: "products", noResults: "No results found.", readMore: "Read more", viewAll: "View all", language: "বাংলা" },
};
const bn: typeof en = {
  nav: { home: "হোম", about: "আমাদের সম্পর্কে", products: "পণ্য", solutions: "সমাধান ও সেবা", brands: "ব্র্যান্ড", projects: "প্রকল্প", news: "সংবাদ ও তথ্য", contact: "যোগাযোগ" },
  cta: { quote: "কোটেশন চান", inquiry: "পণ্য সম্পর্কে জানতে চান", details: "বিস্তারিত দেখুন", explore: "পণ্য দেখুন", whatsapp: "হোয়াটসঅ্যাপ", contact: "আমাদের টিমের সাথে যোগাযোগ", businessQuote: "ব্যবসায়িক কোটেশন চান" },
  common: { search: "খুঁজুন", searchPlaceholder: "পণ্য, ব্র্যান্ড, সেবা খুঁজুন…", allCategories: "সব ক্যাটাগরি", allBrands: "সব ব্র্যান্ড", products: "টি পণ্য", noResults: "কিছু পাওয়া যায়নি।", readMore: "আরও পড়ুন", viewAll: "সব দেখুন", language: "English" },
};
export const DICTS: Record<Locale, typeof en> = { en, bn };
export type Dict = typeof en;
