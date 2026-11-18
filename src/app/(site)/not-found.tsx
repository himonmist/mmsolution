import Link from "next/link";
export default function NotFound() {
  return (
    <section className="grid min-h-[80vh] place-items-center bg-ink px-4 pt-24 text-center text-white">
      <div><p className="eyebrow !text-glow">404</p><h1 className="display mt-4 text-5xl">This page went offline.</h1><p className="mt-4 text-white/60">The page you requested doesn&apos;t exist or has moved.</p>
        <div className="mt-8 flex justify-center gap-3"><Link href="/" className="btn btn-primary">Home</Link><Link href="/products" className="btn btn-ghost">Browse products</Link></div></div>
    </section>
  );
}
