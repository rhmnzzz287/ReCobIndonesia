import type { ReactNode } from "react";
import { MessageCircle } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { CaptionNote } from "@/components/ui/caption-note";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";
import { env } from "@/lib/env";
import { whatsappHref } from "@/lib/utils/whatsapp";

/**
 * Isi halaman `/kontak`.
 *
 * Tombol WhatsApp hanya muncul bila `NEXT_PUBLIC_WHATSAPP_NUMBER` diisi. Sebelumnya nomor contoh
 * `6281200000000` ditulis langsung di komponen — nomor karangan, dan itu dilarang PRD Bagian 8.
 * Selama nomor resmi belum ada, halaman menyatakan apa adanya lewat `copy.footer.contactNotice`.
 *
 * Kedua kolom memakai kerangka yang sama — judul, kalimat pengantar, lalu satu kartu — dan kartu
 * direntangkan `flex-1` di dalam baris `auto-rows-fr`. Sebelumnya kolom kiri hanya punya judul dan
 * kartu sementara kolom kanan menambah pengantar dan catatan penutup, sehingga tepi atas kartu
 * berselisih 42 px, tinggi kartu 165 px vs 93 px, dan kolom kiri menyisakan 20 px ruang mati.
 * Catatan kontak kini satu baris penuh di bawah grid karena berlaku untuk kedua kolom.
 */
export function Contact(): ReactNode {
  const waHref = whatsappHref(env.whatsappUrl, { text: copy.contact.whatsappText });

  return (
    <Section id="kanal" tone="surface">
      <Container>
        <div className="grid auto-rows-fr gap-2xl lg:grid-cols-2">
          <div className="flex h-full flex-col" data-reveal="">
            <h2 className="type-h2 text-ink">{copy.contact.channelsTitle}</h2>
            <p className="mt-md type-body-md text-text-secondary">
              {copy.contact.whatsappBody}
            </p>

            <div className="mt-lg flex flex-1 flex-col rounded-lg border border-border bg-paper p-lg">
              <h3 className="type-h3 text-ink">{copy.contact.whatsappTitle}</h3>

              {waHref === null ? (
                <>
                  <p className="mt-xs type-body-sm text-text-secondary">
                    {copy.contact.whatsappUnavailable}
                  </p>
                  <ButtonLink
                    className="mt-md self-start"
                    href="/kontak#form-sampel"
                    variant="accent"
                  >
                    {copy.contact.formTitle}
                  </ButtonLink>
                </>
              ) : (
                <ButtonLink
                  className="mt-xs self-start"
                  external
                  href={waHref}
                  variant="accent"
                >
                  <MessageCircle aria-hidden="true" size={18} strokeWidth={1.75} />
                  {copy.contact.whatsappCta}
                </ButtonLink>
              )}
            </div>
          </div>

          <div className="flex h-full flex-col" data-reveal="">
            <h2 className="type-h2 text-ink">{copy.contact.legalTitle}</h2>
            <p className="mt-md type-body-md text-text-secondary">{copy.contact.legalBody}</p>

            <div className="mt-lg flex flex-1 flex-col rounded-lg border border-border bg-paper p-lg">
              <h3 className="type-h3 text-ink">{copy.contact.identityTitle}</h3>

              <dl className="mt-md flex flex-col">
                <dt className="type-label-md uppercase text-text-secondary">
                  {copy.validation.nppLabel}
                </dt>
                <dd className="mt-xs type-body-sm text-ink">{copy.validation.nppStatus}</dd>

                <dt className="mt-md type-label-md uppercase text-text-secondary">
                  {copy.contact.legalNameLabel}
                </dt>
                <dd className="mt-xs type-body-sm text-ink">{copy.meta.legalName}</dd>

                <dt className="mt-md type-label-md uppercase text-text-secondary">
                  {copy.contact.addressLabel}
                </dt>
                <dd className="mt-xs type-body-sm text-ink">{copy.footer.address}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="mt-lg">
          <CaptionNote>{copy.footer.contactNotice}</CaptionNote>
        </div>
      </Container>
    </Section>
  );
}
