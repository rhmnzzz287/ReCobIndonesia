import { copy } from "@/content/copy";
import { getPrimaryProduct } from "@/lib/data/products";
import { env } from "@/lib/env";
import { formatIdr } from "@/lib/utils/format";

/**
 * `/llms.txt` — ringkasan situs untuk mesin jawaban (AEO/GEO).
 *
 * Isinya diturunkan dari lapisan konten dan data produk resmi, bukan ditulis tangan, sehingga
 * ringkasan mesin tidak pernah menyimpang dari yang tampil di halaman. Fakta yang belum pasti
 * (nomor NPP, kontak, akun sosial) sengaja tidak dicantumkan.
 *
 * Rute ini statis dan di-cache seperti berkas metadata lain; tanpa `revalidate` karena seluruh
 * sumbernya sudah statis pada saat build.
 */
export const dynamic = "force-static";

export async function GET(): Promise<Response> {
  const { product } = await getPrimaryProduct();
  const base = env.siteUrl.replace(/\/+$/u, "");

  const lines = [
    `# ${copy.meta.shortName}`,
    "",
    `> ${copy.meta.summary}`,
    "",
    "## Fakta Utama",
    "",
    `- Produk: ${product.name} (${product.packWeightKg} kg per karung).`,
    `- Harga: ${formatIdr(product.priceIdr)} per karung ${
      product.packWeightKg
    } kg, harga di gudang KUD mitra.`,
    product.comparePriceIdr === null
      ? null
      : `- Pembanding pasar: ${formatIdr(product.comparePriceIdr)} per karung untuk konsentrat komersial umum.`,
    `- Skema pembayaran: potong setoran susu mingguan melalui KUD penampung; tanpa uang muka.`,
    `- Wilayah kemitraan: ${copy.partnership.kudNames.join("; ")}.`,
    `- Status legalitas: ${copy.validation.nppStatus}`,
    "",
    "## Komposisi",
    "",
    ...copy.product.specs.map((spec) => `- ${spec.label} ${spec.value}`),
    "",
    "## Pertanyaan yang Sering Diajukan",
    "",
    ...copy.faq.items.flatMap((item) => [`### ${item.question}`, "", item.answer, ""]),
    "## Batas Klaim",
    "",
    copy.validation.claimNotice,
    "",
    "## Sumber",
    "",
    `- Halaman utama: ${base}`,
    ...copy.validation.citations.map((citation) => `- ${citation}`),
    "",
  ].filter((line): line is string => line !== null);

  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
