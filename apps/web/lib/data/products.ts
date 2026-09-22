import {
  demoIngredients,
  demoProduct,
  type DemoIngredient,
  type DemoProduct,
} from "@/lib/data/demo-data";
import { env } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface ProductWithIngredients {
  product: DemoProduct;
  ingredients: ReadonlyArray<DemoIngredient>;
}

function fromDemo(): ProductWithIngredients {
  return { product: demoProduct, ingredients: demoIngredients };
}

/**
 * Satu kueri bergabung: produk + bahan. Dilarang memanggil per baris dalam loop
 * (aturan anti-N+1, Docs/SCHEMA.md §4).
 */
export async function getPrimaryProduct(): Promise<ProductWithIngredients> {
  if (env.demoMode) return fromDemo();

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("product")
      .select(
        "slug, name, description, unit, pack_weight_kg, price_idr, compare_price_idr, protein_pct, is_bulk, product_ingredient(name, share_min_pct, share_max_pct, function_label, sort_order)",
      )
      .eq("is_active", true)
      .eq("is_bulk", false)
      .order("slug", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error !== null || data === null) {
      throw new Error(error?.message ?? "produk tidak ditemukan");
    }

    const ingredients = [...data.product_ingredient]
      .sort((left, right) => left.sort_order - right.sort_order)
      .map((row) => ({
        name: row.name,
        shareMinPct: Number(row.share_min_pct),
        shareMaxPct: Number(row.share_max_pct),
        functionLabel: row.function_label,
        sortOrder: row.sort_order,
      }));

    return {
      product: {
        slug: data.slug,
        name: data.name,
        description: data.description,
        unit: "karung",
        packWeightKg: Number(data.pack_weight_kg),
        priceIdr: Number(data.price_idr),
        comparePriceIdr: data.compare_price_idr === null ? null : Number(data.compare_price_idr),
        proteinPct: data.protein_pct === null ? null : Number(data.protein_pct),
      },
      ingredients,
    };
  } catch {
    return fromDemo();
  }
}
