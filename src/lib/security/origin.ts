/** Same-origin verification for state-changing requests (defence-in-depth CSRF). */
export function isSameOrigin(req: { origin: string | null; host: string | null }, siteUrl?: string): boolean {
  const { origin, host } = req;
  if (!origin || origin === "null") return false;
  let o: URL;
  try { o = new URL(origin); } catch { return false; }
  if (host && o.host === host) return true;
  if (siteUrl) {
    try { return new URL(siteUrl).origin === o.origin; } catch { return false; }
  }
  return false;
}

export function requestOriginOk(request: Request): boolean {
  return isSameOrigin({ origin: request.headers.get("origin"), host: request.headers.get("host") }, process.env.SITE_URL);
}
