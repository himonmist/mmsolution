export function isSafeRedirect(path: string | null | undefined): boolean {
  if (!path || typeof path !== "string") return false;
  return path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\") && !/[\r\n]/.test(path);
}

export function isSafeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}
