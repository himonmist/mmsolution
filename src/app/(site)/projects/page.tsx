import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { ProjectGrid } from "@/components/home/ProjectGrid";
import { FinalCta } from "@/components/home/Sections";
import { getProjects } from "@/lib/queries";

export const metadata: Metadata = { title: "Projects", description: "Networking, IT infrastructure, CCTV, server room and computer lab implementations by MM Business Solution.", alternates: { canonical: "/projects" } };

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <>
      <PageHero eyebrow="Projects & implementations" title="Infrastructure, delivered." body="A selection of implementations across corporate, education and enterprise environments." crumbs={[["Projects", "/projects"]]} image="/media/server-rack.webp" />
      <section className="bg-white py-16"><div className="container-x"><ProjectGrid projects={projects} /></div></section>
      <FinalCta />
    </>
  );
}
