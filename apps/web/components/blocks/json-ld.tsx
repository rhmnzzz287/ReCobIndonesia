import type { ReactNode } from "react";

export interface JsonLdProps {
  data: unknown;
}

/**
 * Blok data terstruktur.
 *
 * `<` di-escape agar isi naskah tidak pernah menutup tag `script` lebih awal — naskah Indonesia
 * memuat tanda hubung dan tanda kutip, tetapi tidak ada jaminan itu bertahan selamanya.
 */
export function JsonLd({ data }: JsonLdProps): ReactNode {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</gu, "\\u003c") }}
      type="application/ld+json"
    />
  );
}
