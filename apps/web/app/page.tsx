import type { ReactNode } from "react";
import { StickyCta } from "@/components/blocks/sticky-cta";
import { SiteHeader } from "@/components/blocks/site-header";
import { CostCompare } from "@/components/sections/cost-compare";
import { Cta } from "@/components/sections/cta";
import { Education } from "@/components/sections/education";
import { Faq } from "@/components/sections/faq";
import { Footer } from "@/components/sections/footer";
import { Hero } from "@/components/sections/hero";
import { Impact } from "@/components/sections/impact";
import { Partnership } from "@/components/sections/partnership";
import { Problem } from "@/components/sections/problem";
import { Product } from "@/components/sections/product";
import { Solution } from "@/components/sections/solution";
import { Validation } from "@/components/sections/validation";
import { copy } from "@/content/copy";

export default function HomePage(): ReactNode {
  return (
    <>
      <SiteHeader faqLabel={copy.faq.eyebrow} nav={copy.nav} />
      <main id="konten">
        <Hero />
        <Problem />
        <Solution />
        <Product />
        <CostCompare />
        <Impact />
        <Partnership />
        <Validation />
        <Education />
        <Faq />
        <Cta />
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
