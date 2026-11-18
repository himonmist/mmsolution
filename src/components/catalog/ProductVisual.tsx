import Image from "next/image";
import { Icon } from "@/components/ui/icons";

export function ProductVisual({ src, alt, icon, sizes = "(max-width:768px) 50vw, 25vw", priority }: { src?: string | null; alt: string; icon?: string | null; sizes?: string; priority?: boolean }) {
  if (src) return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-contain p-6 transition duration-500 group-hover:scale-[1.06]" />;
  return (
    <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_40%,#e8f1ff,transparent_70%)]">
      <Icon name={icon} className="h-16 w-16 text-brand-blue/40" />
    </div>
  );
}
