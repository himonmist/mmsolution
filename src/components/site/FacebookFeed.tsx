"use client";
import { useState } from "react";
import { FacebookIcon } from "@/components/ui/icons";

/** Facebook Page plugin, loaded only after the visitor opts in (privacy + performance). */
export function FacebookFeed({ pageUrl }: { pageUrl: string }) {
  const [on, setOn] = useState(false);
  if (!on) return <button onClick={() => setOn(true)} className="btn btn-outline w-full"><FacebookIcon className="h-4 w-4" />Show our Facebook updates</button>;
  const src = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(pageUrl)}&tabs=timeline&width=340&height=500&small_header=true&hide_cover=false`;
  return <iframe title="Facebook page" src={src} width="100%" height="500" className="rounded-2xl border-0 bg-white" loading="lazy" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" />;
}
