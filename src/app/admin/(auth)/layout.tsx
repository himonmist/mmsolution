import Image from "next/image";
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-ink p-4">
      <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_70%_10%,rgba(8,101,197,.45),transparent_70%),radial-gradient(600px_300px_at_10%_90%,rgba(237,16,24,.2),transparent_70%)]" />
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="relative w-full max-w-md">
        <Image src="/brand/logo-reverse.png" alt="MM Business Solution" width={1226} height={639} className="mx-auto mb-8 h-16 w-auto" priority />
        <div className="rounded-3xl bg-white p-8 shadow-lift">{children}</div>
        <p className="mt-6 text-center text-xs text-white/40">Authorised personnel only. Activity is logged.</p>
      </div>
    </div>
  );
}
