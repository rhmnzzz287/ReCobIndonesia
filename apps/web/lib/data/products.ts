import {
  demoIngredients,
  demoProduct,
  demoProducts,
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

export interface ProductCatalogGroup {
  category: string;
  products: ReadonlyArray<DemoProduct>;
}

/** Mengelompokkan produk aktif tanpa mengubah urutan kategori dari sumber data. */
export function groupProductsByCategory(
  products: ReadonlyArray<DemoProduct>,
): ProductCatalogGroup[] {
  const groups = new Map<string, DemoProduct[]>();

  for (const product of products) {
    const current = groups.get(product.category);
    if (current === undefined) {
      groups.set(product.category, [product]);
    } else {
      current.push(product);
    }
  }

  return [...groups].map(([category, groupedProducts]) => ({
    category,
    products: groupedProducts,
  }));
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
        "slug, name, description, unit, pack_weight_kg, price_idr, compare_price_idr, protein_pct, category, image_path, is_bulk, product_ingredient(name, share_min_pct, share_max_pct, function_label, sort_order)",
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
        unit: data.unit,
        packWeightKg: Number(data.pack_weight_kg),
        priceIdr: Number(data.price_idr),
        comparePriceIdr: data.compare_price_idr === null ? null : Number(data.compare_price_idr),
        proteinPct: data.protein_pct === null ? null : Number(data.protein_pct),
        category: data.category,
        imagePath: data.image_path,
      },
      ingredients,
    };
  } catch {
    return fromDemo();
  }
}

/** Daftar produk ritel aktif untuk katalog /produk. */
export async function getProducts(): Promise<ReadonlyArray<DemoProduct>> {
  if (env.demoMode) return demoProducts;

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("product")
      .select(
        "slug, name, description, unit, pack_weight_kg, price_idr, compare_price_idr, protein_pct, category, image_path",
      )
      .eq("is_active", true)
      .eq("is_bulk", false)
      .order("category", { ascending: true })
      .order("slug", { ascending: true });

    if (error !== null) throw new Error(error.message);

    return data.map((item) => ({
      slug: item.slug,
      name: item.name,
      description: item.description,
      unit: item.unit,
      packWeightKg: Number(item.pack_weight_kg),
      priceIdr: Number(item.price_idr),
      comparePriceIdr:
        item.compare_price_idr === null ? null : Number(item.compare_price_idr),
      proteinPct: item.protein_pct === null ? null : Number(item.protein_pct),
      category: item.category,
      imagePath: item.image_path,
    }));
  } catch {
    return demoProducts;
  }
}
