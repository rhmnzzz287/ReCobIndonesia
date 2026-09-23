# Spesifikasi: Penyegaran Halaman Produk ReCob dengan Referensi LOCOL

## Tujuan

Susun ulang `/produk` agar mengikuti alur editorial dan bobot visual beranda LOCOL (`https://locol.company/en/`): hero produk yang kuat, pita mitra/proses, manfaat berbukti, pengalaman peternak bila ada materi sah, lalu penawaran produk dan ajakan bertindak. Hasil tetap terasa sebagai ReCob dan mematuhi `Docs/DESIGN.md`; bukan salinan LOCOL.

## Pengguna dan kebutuhan

Peternak atau petugas KUD harus dapat memahami dalam beberapa detik: produk apa ini, apa manfaat yang benar-benar didukung informasi ReCob, bagaimana cara menggunakannya, berapa harga/ukuran kemasannya, dan langkah berikutnya untuk mencoba atau bertanya.

## Arah visual dan urutan halaman

1. **Hero terang dan editorial.** Gunakan bidang `surface`/`cream`, judul display besar, satu paragraf ringkas, foto produk dominan dari aset lokal, dan CTA utama yang menonjol. Letakkan komposisi responsif: copy dan foto berdampingan di desktop, ditumpuk dengan foto tetap dominan di ponsel. Sajikan hanya satu H1.
2. **Pita bukti/mitra.** Adaptasi pita LOCOL menjadi baris horizontal yang mengalir perlahan berisi nama KUD aktif atau tahapan alur yang memang tersedia dari data/copy ReCob. Tidak memakai logo pihak ketiga atau mengklaim dukungan mitra yang tidak terdata. Hormati `prefers-reduced-motion`.
3. **Manfaat dan formulasi.** Tampilkan manfaat produk sebagai blok editorial dengan angka/fakta besar yang memiliki sumber dan konteks. Pertahankan komposisi bahan, referensi, informasi cara pakai, penyimpanan, ukuran dan harga yang sudah ada. Jangan menciptakan metrik baru atau memindahkan angka dampak yang sudah dihapus dari lingkup PRD.
4. **Bukti dari peternak.** Bagian testimoni hanya ditampilkan bila pemilik menyediakan kutipan nyata, atribusi yang boleh dipublikasikan, dan izin penggunaannya. Tidak ada testimoni atau foto pelanggan yang terverifikasi di aset/copy repo saat spesifikasi ini dibuat. Tanpa materi tersebut, jangan render testimoni placeholder; gunakan fakta produk/rujukan yang telah tersedia sebagai bukti, atau hilangkan bagian ini sampai kontennya disetujui.
5. **Penawaran dan CTA penutup.** Sajikan kemasan, harga terkini dari sumber produk, syarat sampel, dan tautan yang sudah ada ke formulir kontak/kalkulator. Pertahankan data terstruktur produk dan perilaku rute saat ini.

## Batas lingkup

- Hanya halaman `/produk` beserta copy, gaya, dan tes yang langsung dibutuhkan.
- Tidak menyalin teks, logo, foto, atau angka LOCOL.
- Tidak menambah dependensi.
- Tidak mengubah model harga, rumus kalkulator, sumber data produk, atau alur formulir.
- Pertahankan `#formulasi`, satu `<h1>`, JSON-LD produk/halaman, dan navigasi CTA yang berlaku.
- Semua teks tampilan dan teks alternatif tetap di `apps/web/content/copy/id.ts` sesuai ADR-015.
- Gunakan aset lokal yang sudah dioptimalkan. Nama/alt foto yang belum dapat diverifikasi tetap netral sampai pemilik memastikan isinya.
- Patuhi palet, tipografi, kontras, dan batas animasi di `Docs/DESIGN.md`; semua gerak dekoratif non-esensial berhenti pada `prefers-reduced-motion`.

## Kriteria penerimaan

- Susunan halaman mudah dikenali sebagai alur editorial LOCOL: hero dominan → pita bukti/mitra → blok manfaat/bukti → penawaran/CTA; bukan tumpukan seksi gelap generik.
- Layout berfungsi pada lebar ponsel dan desktop, tanpa overflow horizontal.
- Tidak ada logo, testimoni, klaim, angka, atau deskripsi foto yang dikarang.
- Fakta kuantitatif membawa konteks/sumber yang diwajibkan PRD.
- Kontras teks memenuhi WCAG AA; satu H1; tab bahan dan tautan dapat dioperasikan dengan keyboard; reduced motion dihormati.
- `#formulasi`, JSON-LD, CTA kontak/kalkulator, dan harga dari data produk tetap bekerja.
- Lint, typecheck, unit, pemeriksaan repo, build, dan E2E lulus.

## Batasan konten yang menunggu pemilik

Aset saat ini tidak memiliki testimoni pelanggan atau logo mitra yang bisa dipakai sebagai bukti sosial. Sebelum mengaktifkan blok testimoni, pemilik produk perlu memberi kutipan asli, nama/atribusi publik yang disetujui, konteks klaim, dan izin penggunaan. Untuk pita mitra, gunakan hanya nama KUD yang saat render benar-benar berasal dari sumber kemitraan aktif; jika tidak tersedia, tampilkan tahapan proses ReCob, bukan daftar mitra fiktif.
