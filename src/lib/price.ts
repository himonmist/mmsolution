export type PriceInput = { priceMode: "SHOW_PRICE" | "CALL_FOR_PRICE" | "REQUEST_QUOTE" | "HIDE"; price: number | string | null | { toString(): string }; currency: string };

export function priceLabel(p: PriceInput): string | null {
  switch (p.priceMode) {
    case "HIDE": return null;
    case "CALL_FOR_PRICE": return "Call for Price";
    case "REQUEST_QUOTE": return "Request a Quote";
    case "SHOW_PRICE": {
      const n = p.price === null || p.price === undefined ? NaN : Number(p.price.toString());
      if (!Number.isFinite(n) || n < 0) return "Request a Quote";
      const sym = p.currency === "BDT" ? "৳" : p.currency + " ";
      return sym + Math.round(n).toLocaleString("en-US");
    }
  }
}
