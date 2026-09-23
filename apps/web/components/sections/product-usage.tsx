import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";
import { getPrimaryProduct } from "@/lib/data/products";
import { formatIdr } from "@/lib/utils/format";

/**
 * Seksi gelap: cara memberi sapi, kemasan, dan cara menyimpan.
 *
 * Tiga blok dalam satu permukaan `ink-deep` supaya halaman punya jeda terang-gelap-terang; tanpa
 * jeda ini halaman produk jadi satu bidang krem sepanjang empat layar. Foto gudang memakai
 * `object-cover` pada kotak bersisi tetap, bukan `fill`, karena tingginya ditentukan tata letak.
 */
export async function ProductUsage(): Promise<ReactNode> {
  const { product } = await getPrimaryProduct();

  return (
    <Section id="cara-pakai" tone="ink">
      <Container>
        <div className="grid gap-2xl lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <figure className="overflow-hidden rounded-lg" data-reveal="">
            <Image
              alt={copy.productStory.usagePhotoAlt}
              className="h-full w-full object-cover"
              height={1153}
              sizes="(min-width: 1024px) 460px, 90vw"
              src="/img/produk/produk-gudang.webp"
              width={1600}
            />
          </figure>

          <div data-reveal="" style={{ "--reveal-delay": "100ms" } as CSSProperties}>
            <h2 className="type-h2 text-surface">{copy.productStory.usageTitle}</h2>
            <p className="mt-md max-w-[56ch] type-body-md text-surface/85">
              {copy.productStory.usageIntro}
            </p>

            <ol className="mt-xl flex flex-col divide-y divide-surface/15">
              {copy.productStory.usageSteps.map((step, index) => (
                <li className="flex gap-md py-md" key={step.title}>
                  <span className="type-mono-data text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="type-h3 text-surface">{step.title}</h3>
                    <p className="mt-2xs type-body-sm text-surface/80">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-3xl grid gap-2xl lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <figure
            className="flex flex-col items-center justify-center rounded-lg bg-surface/5 p-lg"
            data-reveal=""
          >
            <Image
              alt={copy.product.photoAlt}
              className="h-auto w-full max-w-[220px] object-contain"
              height={1250}
              sizes="(min-width: 1024px) 220px, 60vw"
              src="/img/produk/karung-50kg.webp"
              width={1000}
            />
          </figure>

          <div data-reveal="" style={{ "--reveal-delay": "100ms" } as CSSProperties}>
            <h2 className="type-h3 text-accent">{copy.productStory.specTitle}</h2>
            <p className="mt-xs type-metric-md text-surface">{formatIdr(product.priceIdr)}</p>
            <dl className="mt-md divide-y divide-surface/15">
              {copy.product.specs.map((spec) => (
                <div className="flex justify-between gap-md py-sm" key={spec.label}>
                  <dt className="type-body-sm text-surface/70">{spec.label}</dt>
                  <dd className="max-w-[34ch] text-right type-body-sm text-surface">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>

            <h3 className="mt-xl type-h3 text-accent">{copy.productStory.storageTitle}</h3>
            <p className="mt-xs type-body-sm text-surface/80">
              {copy.productStory.storageIntro}
            </p>
            <ul className="mt-md grid gap-sm sm:grid-cols-2">
              {copy.productStory.storageSteps.map((step) => (
                <li className="flex gap-sm type-body-sm text-surface/90" key={step}>
                  <span
                    aria-hidden="true"
                    className="mt-xs h-2 w-2 shrink-0 rounded-pill bg-accent"
                  />
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
