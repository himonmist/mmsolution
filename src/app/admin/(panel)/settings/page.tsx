import { requireUser } from "@/lib/auth/session";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";
export const metadata = { title: "Site settings" };

export default async function SettingsPage() {
  await requireUser("settings.manage");
  const s = await getSettings();
  return (
    <>
      <PageHeader title="Site settings" desc="Contact details, social links, SEO, integrations and About page content." />
      <div className="space-y-6">
        <SettingsForm section="contact" title="Contact information" initial={s.contact} fields={[
          { key: "companyName", label: "Company name" }, { key: "email", label: "Email" }, { key: "phone", label: "Phone" },
          { key: "whatsapp", label: "WhatsApp number", help: "International format, e.g. 8801XXXXXXXXX. Enables the floating WhatsApp button." },
          { key: "hours", label: "Business hours" }, { key: "mapEmbedUrl", label: "Google Maps embed URL", help: "Must start with https://www.google.com/maps/embed?" },
          { key: "address", label: "Office address", type: "textarea" }]} />
        <SettingsForm section="social" title="Social media" initial={s.social} fields={[
          { key: "facebook", label: "Facebook page URL" }, { key: "linkedin", label: "LinkedIn page URL" }, { key: "youtube", label: "YouTube channel URL" },
          { key: "showFacebookFeed", label: "Show Facebook page feed on Contact page (loads on click)", type: "checkbox" }]} />
        <SettingsForm section="seo" title="Default SEO" initial={s.seo} fields={[{ key: "title", label: "Site title" }, { key: "ogImage", label: "Default social share image URL" }, { key: "description", label: "Meta description", type: "textarea" }]} />
        <SettingsForm section="integrations" title="Integrations & chatbot" initial={s.integrations} fields={[
          { key: "gaId", label: "Google Analytics 4 ID", help: "Format G-XXXXXXX" }, { key: "gscVerification", label: "Search Console verification code" },
          { key: "chatbotEnabled", label: "Enable website assistant (chatbot)", type: "checkbox" }, { key: "chatbotGreeting", label: "Chatbot greeting", type: "textarea" }]} />
        <SettingsForm section="about" title="About page" initial={s.about} fields={[{ key: "heading", label: "Heading" }, { key: "body", label: "Introduction", type: "textarea" }, { key: "mission", label: "Mission", type: "textarea" }, { key: "vision", label: "Vision", type: "textarea" }]} />
      </div>
    </>
  );
}
