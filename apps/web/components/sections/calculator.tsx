import type { ReactNode } from "react";
import { SavingsCalculator } from "@/components/blocks/savings-calculator";
import { CaptionNote } from "@/components/ui/caption-note";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";
import { getPrimaryProduct } from "@/lib/data/products";

/**
 * Seksi kalkulator penghematan.
 *
 * Berdiri di halaman `/kalkulator` selebar penuh, di bawah tabel perbandingan harga yang statis.
 * Sebelumnya seksi ini terjepit di dalam beranda dan kartu hasilnya meluber pada lebar 1149 px
 * (nilai `dd` mencapai 264 px di dalam kartu 182 px); halaman sendiri memberi kartu itu ruang.
 *
 * Harga jangkar dan harga pembanding dibaca dari data produk resmi (`lib/data/products`),
 * bukan ditulis di komponen: kalkulator tidak boleh menyimpang dari tabel "Perbandingan Harga
 * Pakan" tepat di atasnya. Bila data pembanding belum tersedia, seksi tidak ditampilkan sama
 * sekali alih-alih menebak angka.
 */
export async function Calculator(): Promise<ReactNode> {
  const { product } = await getPrimaryProduct();
  const comparePriceIdr = product.comparePriceIdr;

  if (comparePriceIdr === null || comparePriceIdr <= 0) return null;

  return (
    <Section id="kalkulator" tone="cream">
      <Container>
        <div className="max-w-[68ch]" data-reveal="">
          <p className="type-label-md uppercase text-primary">{copy.calculator.eyebrow}</p>
          <h2 className="mt-sm type-h2 text-ink">{copy.calculator.title}</h2>
          <p className="mt-md type-body-md text-text-secondary">{copy.calculator.intro}</p>
        </div>

        <SavingsCalculator
          anchorPriceIdr={product.priceIdr}
          comparePriceIdr={comparePriceIdr}
          packWeightKg={product.packWeightKg}
        />

        <div className="mt-lg max-w-[68ch] grid gap-sm sm:grid-cols-2">
          <CaptionNote>{copy.calculator.mathNote}</CaptionNote>
          <CaptionNote>{copy.calculator.claimNotice}</CaptionNote>
        </div>
      </Container>
    </Section>
  );
}
