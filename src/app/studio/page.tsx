import { notFound } from "next/navigation";
import { StudioCanvas } from "@/components/three/Studio";

/** Dev-only product photo studio used by scripts/render-studio.mjs. */
export default async function StudioPage({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { m = "laptop" } = await searchParams;
  return (
    <div style={{ width: "100vw", height: "100vh", background: "transparent" }}>
      <style>{"html,body{background:transparent!important}"}</style>
      <StudioCanvas model={m} />
    </div>
  );
}
