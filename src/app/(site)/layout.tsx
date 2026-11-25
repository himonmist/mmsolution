import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { FloatingAssist } from "@/components/site/FloatingAssist";
import { JsonLd } from "@/components/site/JsonLd";
import { getCategories, getServices } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { getDict, getLocale } from "@/lib/i18n/server";
import { whatsappLink } from "@/lib/whatsapp";
import { absUrl, siteUrl } from "@/lib/seo";
import { isSafeUrl } from "@/lib/security/url";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories, services, dict, locale] = await Promise.all([getSettings(), getCategories(), getServices(), getDict(), getLocale()]);
  const c = settings.contact;
  const org = {
    "@context": "https://schema.org", "@type": "Organization", name: c.companyName, url: siteUrl(), logo: absUrl("/brand/logo.png"),
    slogan: "Smarter IT | Better Business", email: c.email, telephone: c.phone,
    address: { "@type": "PostalAddress", streetAddress: c.address.replace(/\s*\n\s*/g, " "), addressLocality: "Dhaka", postalCode: "1216", addressCountry: "BD" },
    sameAs: [settings.social.facebook, settings.social.linkedin, settings.social.youtube].filter(isSafeUrl),
  };
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      <Header
        dict={dict} locale={locale}
        categories={categories.map((x) => ({ name: x.name, slug: x.slug, icon: x.icon, count: x._count.products }))}
        services={services.map((x) => ({ title: x.title, slug: x.slug, icon: x.icon, summary: x.summary }))}
      />
      <main id="main">{children}</main>
      <Footer settings={settings} dict={dict} categories={categories} services={services} />
      <FloatingAssist whatsapp={whatsappLink(c.whatsapp, "Hello MM Business Solution, I'd like to know more.")} greeting={settings.integrations.chatbotGreeting} chatbot={settings.integrations.chatbotEnabled} />
      <JsonLd data={org} />
    </>
  );
}
