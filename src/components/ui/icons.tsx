import {
  Laptop, Server, Router, Cctv, Network, Printer, Monitor, Cpu, HardDrive, Keyboard, BatteryCharging, ShieldCheck, Wifi,
  Building2, Wrench, Headset, Boxes, Handshake, Award, LifeBuoy, ClipboardList, Truck, Settings2, PcCase, Globe, type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  laptop: Laptop, server: Server, router: Router, cctv: Cctv, network: Network, printer: Printer, monitor: Monitor, cpu: Cpu,
  storage: HardDrive, keyboard: Keyboard, ups: BatteryCharging, shield: ShieldCheck, wifi: Wifi, building: Building2, wrench: Wrench,
  headset: Headset, boxes: Boxes, handshake: Handshake, award: Award, support: LifeBuoy, clipboard: ClipboardList, truck: Truck,
  settings: Settings2, desktop: PcCase, globe: Globe,
};

export function Icon({ name, className }: { name?: string | null; className?: string }) {
  const C = (name && ICONS[name]) || Boxes;
  return <C className={className} aria-hidden strokeWidth={1.6} />;
}

type P = { className?: string };
export const FacebookIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor"><path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.3H8v3h2.6V21h2.9z" /></svg>
);
export const LinkedinIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor"><path d="M6.9 8.8H3.8V20h3.1V8.8zM5.3 4a1.8 1.8 0 100 3.6 1.8 1.8 0 000-3.6zM20.2 13.6c0-3-1.6-4.9-4.2-4.9-1.4 0-2.4.8-2.8 1.5V8.8h-3V20h3.1v-5.8c0-1.5.6-2.6 2-2.6 1.3 0 1.8 1 1.8 2.6V20h3.1v-6.4z" /></svg>
);
export const YoutubeIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor"><path d="M21.6 7.2a2.5 2.5 0 00-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 002.4 7.2 26 26 0 002 12a26 26 0 00.4 4.8 2.5 2.5 0 001.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 001.8-1.8A26 26 0 0022 12a26 26 0 00-.4-4.8zM10 15V9l5.2 3L10 15z" /></svg>
);
export const WhatsappIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1c-.2.2-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 001.8-1.2 2.2 2.2 0 00.1-1.2c0-.1-.2-.2-.4-.3z" /></svg>
);
