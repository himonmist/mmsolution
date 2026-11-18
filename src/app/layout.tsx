import type { Metadata, Viewport } from "next";
import { Sora, Manrope, Hind_Siliguri } from "next/font/google";
import { headers } from "next/headers";
import Script from "next/script";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import { getLocale } from "@/lib/i18n/server";
import { siteUrl } from "@/lib/seo";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap", weight: ["400", "500", "600", "700"] });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const bangla = Hind_Siliguri({ subsets: ["bengali"], weight: ["400", "500", "600"], variable: "--font-bangla", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: s.seo.title, template: "%s | MM Business Solution" },
    description: s.seo.description,
    applicationName: "MM Business Solution",
    openGraph: { type: "website", siteName: "MM Business Solution", title: s.seo.title, description: s.seo.description, images: [s.seo.ogImage || "/media/server-rack.webp"], locale: "en_BD" },
    twitter: { card: "summary_large_image", title: s.seo.title, description: s.seo.description },
    alternates: { canonical: "/", languages: { en: "/", bn: "/?lang=bn" } },
    verification: s.integrations.gscVerification ? { google: s.integrations.gscVerification } : undefined,
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = { themeColor: "#071426", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [nonce, s, locale] = [(await headers()).get("x-nonce") ?? undefined, await getSettings(), await getLocale()];
  const ga = s.integrations.gaId || process.env.NEXT_PUBLIC_GA_ID;
  return (
    <html lang={locale} className={`${sora.variable} ${manrope.variable} ${bangla.variable}`}>
      <body>
        {children}
        {ga && /^G-[A-Z0-9]+$/.test(ga) && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" nonce={nonce} />
            <Script id="ga" strategy="afterInteractive" nonce={nonce}>{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga}',{anonymize_ip:true});`}</Script>
          </>
        )}
      </body>
    </html>
  );
}
