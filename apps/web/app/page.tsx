import type { ReactNode } from "react";
import { CostCompare } from "@/components/sections/cost-compare";
import { Hero } from "@/components/sections/hero";
import { Impact } from "@/components/sections/impact";
import { Problem } from "@/components/sections/problem";
import { Product } from "@/components/sections/product";
import { Solution } from "@/components/sections/solution";

export default function HomePage(): ReactNode {
  return (
    <main id="konten">
      <Hero />
      <Problem />
      <Solution />
      <Product />
      <CostCompare />
      <Impact />
    </main>
  );
}
