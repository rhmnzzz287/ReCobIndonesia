import type { CSSProperties, ReactNode } from "react";
import { CompositionBar } from "@/components/blocks/composition-bar";
import { IngredientTabs } from "@/components/blocks/ingredient-tabs";
import { CaptionNote } from "@/components/ui/caption-note";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";
import { getPrimaryProduct } from "@/lib/data/products";

/**
 * Bahan: daftar tab yang bisa dipilih, batang proporsi, dan rujukan ilmiahnya.
 *
 * Tidak ada kisi kartu per bahan di sini. Versi pertama seksi ini menampilkan nama dan fungsi tiap
 * bahan TIGA kali (chip, kartu, dan batang) sehingga tidak ada satu pun informasi yang bergantung
 * pada interaksi; tab menggantikan chip dan kartu sekaligus, dan batang proporsi tetap memakai
 * `blocks/composition-bar` supaya angkanya satu sumber dengan halaman lain.
 */
export async function ProductIngredients(): Promise<ReactNode> {
  const { ingredients } = await getPrimaryProduct();

  return (
    <Section id="formulasi" tone="cream">
      <Container>
        <div className="max-w-[68ch]" data-reveal="">
          <p className="type-label-md uppercase text-primary">{copy.product.eyebrow}</p>
          <h2 className="mt-sm type-h2 text-ink">{copy.productStory.ingredientsTitle}</h2>
          <p className="mt-md type-body-md text-text-secondary">
            {copy.productStory.ingredientsIntro}
          </p>
        </div>

        <div className="mt-2xl grid gap-2xl lg:grid-cols-2 lg:items-start">
          <div data-reveal="">
            <IngredientTabs
              items={ingredients.map((item) => ({
                name: item.name,
                functionLabel: item.functionLabel,
                shareLabel: `${item.shareMinPct}–${item.shareMaxPct}%`,
              }))}
              label={copy.productStory.ingredientSelectLabel}
              shareLabel={copy.productStory.ingredientShareLabel}
            />
          </div>

          <div data-reveal="" style={{ "--reveal-delay": "120ms" } as CSSProperties}>
            <h3 className="type-h3 text-ink">{copy.product.compositionTitle}</h3>
            <div className="mt-md">
              <CompositionBar ingredients={ingredients} />
            </div>
            <CaptionNote className="mt-md">{copy.product.compositionCaption}</CaptionNote>
            <CaptionNote className="mt-xs">{copy.product.compositionReference}</CaptionNote>
          </div>
        </div>
      </Container>
    </Section>
  );
}
