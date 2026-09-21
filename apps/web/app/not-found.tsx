import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-[720px] flex-col justify-center gap-lg px-lg">
      <h1 className="type-h1 text-ink">Halaman tidak ditemukan</h1>
      <p className="type-body-lg text-text-secondary">
        Tautan yang Anda buka tidak tersedia. Kembali ke beranda untuk melanjutkan.
      </p>
      <Link className="type-label-md text-primary underline" href="/">
        Kembali ke beranda
      </Link>
    </main>
  );
}
