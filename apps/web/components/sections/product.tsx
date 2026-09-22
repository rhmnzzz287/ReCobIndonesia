import type { CSSProperties, ReactNode } from "react";
import { CompositionBar } from "@/components/blocks/composition-bar";
import { CaptionNote } from "@/components/ui/caption-note";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";
import { getPrimaryProduct } from "@/lib/data/products";
import { formatIdr } from "@/lib/utils/format";

export async function Product(): Promise<ReactNode> {
  const { product, ingredients } = await getPrimaryProduct();

  return (
    <Section id="formulasi" tone="cream">
      <Container>
        <div className="max-w-[68ch]" data-reveal="">
          <p className="type-label-md uppercase text-primary">
            {copy.product.eyebrow}
          </p>
          <h2 className="mt-sm type-h2 text-ink">{copy.product.title}</h2>
          <p className="mt-md type-body-md text-text-secondary">
            {copy.product.intro}
          </p>
          <p className="mt-md type-body-md text-text">{product.name}</p>
          <p className="mt-2xs type-body-sm text-text-secondary">
            {product.description}
          </p>
        </div>

        <div className="mt-2xl grid gap-xl md:grid-cols-2">
          <div data-reveal="">
            <h3 className="type-h3 text-ink">
              {copy.product.compositionTitle}
            </h3>
            <div className="mt-md">
              <CompositionBar ingredients={ingredients} />
            </div>
            <CaptionNote className="mt-md">
              {copy.product.compositionCaption}
            </CaptionNote>
            <CaptionNote className="mt-xs">
              {copy.product.compositionReference}
            </CaptionNote>
          </div>
          <div data-reveal="">
            <h3 className="type-h3 text-ink">{copy.product.specTitle}</h3>
            <p className="mt-md type-metric-md text-primary">
              {formatIdr(product.priceIdr)}
            </p>
            <dl className="mt-md divide-y divide-border">
              {copy.product.specs.map((spec) => (
                <div
                  className="flex justify-between gap-md py-sm"
                  key={spec.label}
                >
                  <dt className="type-body-sm text-text-secondary">
                    {spec.label}
                  </dt>
                  <dd className="type-body-sm text-text">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-2xl" data-reveal="">
          <h3 className="type-h3 text-ink">{copy.product.transitionTitle}</h3>
          <p className="mt-xs type-body-sm text-text-secondary">
            {copy.product.transitionIntro}
          </p>
          <ol className="mt-md grid auto-rows-fr gap-sm md:grid-cols-4">
            {copy.product.transitionSteps.map((step, index) => (
              <li
                className="flex h-full flex-col rounded-md bg-surface p-md type-body-sm text-text"
                data-reveal=""
                key={step.day}
                style={{ "--reveal-delay": `${index * 70}ms` } as CSSProperties}
              >
                <span className="type-mono-data text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-2xs type-label-md text-ink">{step.day}</p>
                <p className="mt-2xs type-metric-md text-primary">
                  {step.share}
                </p>
                <p className="mt-auto pt-2xs type-caption text-text-secondary">
                  {step.label}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
