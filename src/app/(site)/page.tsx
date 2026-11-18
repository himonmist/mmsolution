import { HeroExperience } from "@/components/home/HeroExperience";
import { ProductFilm } from "@/components/home/ProductFilm";
import { IntroSection, CategoriesSection, FeaturedSection, ServicesSection, WhySection, BrandsSection, ProjectsSection, ProcessSection, TestimonialsSection, NewsSection, FinalCta } from "@/components/home/Sections";
import { getSettings } from "@/lib/settings";
import { getBrands, getCategories, getFeaturedProducts, getPosts, getProjects, getServices, getTestimonials } from "@/lib/queries";
import { prisma } from "@/lib/db";

export default async function Home() {
  const [s, categories, featured, services, brands, projects, testimonials, posts, productCount] = await Promise.all([
    getSettings(), getCategories(), getFeaturedProducts(8), getServices(), getBrands(), getProjects(7), getTestimonials(), getPosts(4),
    prisma.product.count({ where: { isPublished: true } }),
  ]);
  // Statistics: only verifiable live counts + figures the company enters in the CMS.
  const stats = [
    ...(s.stats.showLiveCounts ? [
      { label: "Product categories", value: categories.length },
      { label: "Products in catalogue", value: productCount },
      { label: "Technology brands", value: brands.length },
      { label: "Service lines", value: services.length },
    ] : []),
    ...s.stats.custom,
  ].slice(0, 8);
  const iconFor = Object.fromEntries(categories.map((c) => [c.slug, c.icon]));
  return (
    <>
      <HeroExperience eyebrow={s.hero.eyebrow} heading={s.hero.heading} description={s.hero.description} primary={s.hero.primaryCta} secondary={s.hero.secondaryCta} />
      <ProductFilm />
      <IntroSection intro={s.intro} stats={stats} />
      <CategoriesSection categories={categories} />
      <FeaturedSection products={featured} iconFor={iconFor} />
      <ServicesSection services={services} />
      <WhySection />
      <BrandsSection brands={brands} />
      <ProjectsSection projects={projects} />
      <ProcessSection />
      <TestimonialsSection items={testimonials} />
      <NewsSection posts={posts} />
      <FinalCta />
    </>
  );
}
