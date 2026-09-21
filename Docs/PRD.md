# PRD — Platform Digital ReCob.id

| Field | Nilai |
|---|---|
| Versi dokumen | 1.0.0 |
| Tanggal | 21 September 2026 |
| Status | Draft untuk direview founder sebelum eksekusi |
| Pemilik produk | Tim ReCob.id |
| Sumber tunggal kebenaran bisnis | `BMC_DIGTREP_OCR.md` (hasil OCR `BMC_DIGTREP.pdf`) |
| Dokumen pendamping | `SCHEMA.md` (model data), `DESIGN.md` (desain visual + arsitektur sistem) |
| Target rilis | Phase 1 (prototype pitching) — 2 minggu kerja, deploy produksi di Vercel |

---

## 1. Ringkasan Eksekutif

ReCob.id memproduksi pelet konsentrat sapi perah berprotein tinggi dari limbah bonggol jagung terfermentasi, ampas tahu terfermentasi, dan tetes tebu. Dijual Rp160.000/karung 50 kg melalui KUD penampung susu, dengan mekanisme pembayaran potong setoran susu mingguan.

Dokumen sumber bisnis menyebut keberadaan "website digital prototype" tetapi **tidak memuat satu pun spesifikasi halaman, fitur, atau alur**. PRD ini mengisi kekosongan tersebut dan menetapkan satu target tunggal untuk Phase 1:

> **Membuktikan, dalam waktu 2 minggu, bahwa ReCob.id mampu mengubah trafik digital (TikTok/Instagram/Facebook/WhatsApp) menjadi permintaan sampel gratis terverifikasi dari peternak sapi perah di Bandung, Boyolali, dan Pasuruan — melalui satu situs yang dapat dipamerkan langsung di depan juri pitching.**

Phase 1 sengaja **bukan** aplikasi manajemen peternakan. Portal peternak, dashboard KUD, dan ledger potong setoran susu dirancang lengkap di `SCHEMA.md` dan `DESIGN.md` sebagai Phase 2–4, tetapi tidak dibangun sekarang. Alasannya di Bagian 5.2.

---

## 2. Latar Belakang & Masalah

### 2.1 Masalah peternak (dari dokumen sumber)

| Masalah | Bukti dari dokumen sumber | Implikasi digital |
|---|---|---|
| Fluktuasi pasokan pakan dan biaya harian tinggi | Zulaikhah et al. (2026); kritis saat musim kemarau | Situs harus menjual **kepastian pasokan sepanjang tahun**, bukan sekadar harga murah |
| Ketergantungan konsentrat pabrikan | Menyerap 60%–65% total biaya produksi (Hajar, 2025; Halawa, 2026) | Kalkulasi biaya harus tampil di halaman pertama, bukan di brosur |
| Limbah bonggol jagung tidak termanfaatkan | Potensi nasional 3,45–4,6 juta ton/tahun (BPS, 2022); banyak dibuang/dibakar | Narasi ekonomi sirkular adalah diferensiator pitching, bukan pelengkap |
| Arus kas harian/mingguan terbatas | Karakteristik pelanggan: keterbatasan arus kas; sensitif terhadap produksi susu harian | Skema potong setoran susu harus dikomunikasikan sebagai penawaran utama |
| Kanal terbatas dan berbasis kepercayaan | Bergantung pada KUD; keputusan beli mengikuti tokoh peternak/KTT | Situs harus mendukung "bukti sosial" dan peran Mitra/Referral |

### 2.2 Masalah digital (kesenjangan yang PRD ini tutup)

1. **Tidak ada kanal konversi.** Konten TikTok/Instagram/paid promote hanya dapat mengarah ke "link di bio". Tanpa halaman tujuan yang mengukur konversi, program sampel gratis 2–3 kg tidak dapat dikelola maupun dievaluasi.
2. **Tidak ada bukti kredibilitas terpusat.** Validasi laboratorium, nomor pendaftaran pakan (NPP), dan referensi ilmiah hidup di berkas terpisah; pembeli B2B/KUD membutuhkannya dalam satu tempat.
3. **Tidak ada instrumen kuantifikasi penghematan.** Argumen "hemat 11%–20%" tidak dapat diverifikasi calon pembeli secara mandiri.
4. **Tidak ada jejak data untuk pembuktian dampak.** Tanpa pencatatan permintaan sampel, tidak ada dasar untuk pitch lanjutan (jumlah peternak dalam pipeline, tonase limbah dialihkan, estimasi penghematan kolektif).

---

## 3. Tujuan & Metrik Keberhasilan

### 3.1 Tujuan produk

| Kode | Tujuan | Ukuran keberhasilan |
|---|---|---|
| G1 | Menghasilkan permintaan sampel gratis terverifikasi | Jumlah entri `leads` valid di Supabase (bukan sekadar klik) |
| G2 | Menjelaskan penghematan biaya pakan secara kredibel | Pengunjung memahami angka penghematan sebelum CTA, tanpa klaim tanpa dasar |
| G3 | Menjadi bukti kompetensi tim di depan juri | Demo berjalan tanpa error di jaringan venue, < 2 detik muat pertama |
| G4 | Menjadi fondasi arsitektur Phase 2 | Skema data Phase 2 sudah dirancang dan kompatibel tanpa migrasi destruktif |

### 3.2 Metrik (north star dan pendukung)

**North star Phase 1:** jumlah permintaan sampel gratis terverifikasi per minggu (`leads` dengan status `verified` atau lebih tinggi).

| Metrik pendukung | Target awal | Sumber data |
|---|---:|---|
| Conversion rate form sampel (selesai form / kunjungan halaman) | ≥ 3% | `leads` ÷ page views (Vercel Analytics) |
| Klik CTA utama (hero + sticky) | ≥ 12% kunjungan | Custom event `cta_click` |
| Bounce rate beranda | ≤ 55% | Vercel Analytics |
| LCP (mobile, 4G) | ≤ 2,0 s | Vercel Speed Insights |
| INP | ≤ 200 ms | Vercel Speed Insights |
| CLS | ≤ 0,1 | Vercel Speed Insights |
| Lighthouse Accessibility | ≥ 95 | audit CI |
| Error rate runtime (Sentry) | < 1% sesi | Sentry |

> Semua angka target adalah **target internal**, bukan klaim pasar. Tidak ada target yang boleh dipresentasikan sebagai capaian sebelum datanya nyata.

### 3.3 Definisi "Pitch Ready" (Definition of Done)

- [ ] Beranda, Produk, Dampak, Edukasi, Mitra/KUD, dan Kontak dapat diakses publik dari domain produksi Vercel.
- [ ] Form permintaan sampel gratis menyimpan data ke Supabase dan mengirim notifikasi internal (WA/email) — terbukti dengan data nyata, bukan mockup.
- [ ] Angka penghematan tampil dengan asumsi yang dapat dibaca pengunjung (tidak ada angka tanpa dasar).
- [ ] Seluruh halaman lolos audit Lighthouse: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95 (mobile).
- [ ] Tidak ada emoji di UI maupun konten; seluruh ikon memakai `lucide-react`.
- [ ] Playwright smoke test hijau pada build produksi.
- [ ] Mode demo tersedia: data dampak dikurasi, ditandai jelas sebagai ilustrasi bila belum ada data lapangan riil.
- [ ] Tidak ada kredensial, kunci, atau data pribadi yang tertanam di repositori.

---

## 4. Persona & Segmen

### 4.1 Persona primer — Pak Tarno, peternak 8 ekor

- 42 tahun, Pangalengan, Bandung. Akses utama: **Android mid-range, koneksi 4G tidak stabil**.
- Menyetor susu harian ke KPBS Pangalengan; biaya pakan dipotong dari setoran.
- Kekhawatiran: harga konsentrat pabrikan naik saat kemarau; sapi ogah makan pakan baru; takut produksi susu turun.
- Pemicu aksi: melihat sapi tetangga lahap + hitungan rupiah penghematan per bulan.
- **Implikasi desain:** halaman produk wajib berfungsi prima di jaringan lambat; bukti sosial dan video palatabilitas ditempatkan sebelum form; form maksimal 4 kolom (nama, WhatsApp, jumlah sapi, lokasi).

### 4.2 Persona sekunder — Ibu Rahma, petugas KUD

- 35 tahun, mengelola penerimaan susu harian dan pemotongan biaya pakan ±300 peternak anggota.
- Butuh: transparansi produk yang akan masuk ke sistem potong setoran, bukti legalitas (NPP), alur konsinyasi dan rekonsiliasi yang tidak menambah pekerjaan manual.
- **Implikasi desain:** halaman Mitra/KUD menyediakan unduhan ringkasan produk (PDF) dan alur rekonsiliasi yang dijelaskan tanpa jargon teknis.

### 4.3 Segmen tersier — commercial farm independen

Di luar sistem KUD; sensitif terhadap harga per kg dan konsistensi nutrisi. Dilayani halaman Penjualan Curah (bulk) dengan CTA "minta penawaran volume".

---

## 5. Lingkup Prototype (Phase 1)

### 5.1 Termasuk lingkup

Fokus Phase 1 ditetapkan tunggal: **landing marketing + metrik dampak + edukasi**, sesuai keputusan pemilik produk.

| Kode | Permukaan | Isi wajib | Kriteria penerimaan |
|---|---|---|---|
| S1 | Beranda | Hero, masalah, solusi, produk, dampak, kemitraan KUD, validasi, edukasi, FAQ, CTA | Semua bagian dapat di-scroll tanpa layout shift > 0,1 CLS; CTA muncul ≥ 3 kali |
| S2 | Produk | Komposisi formulasi, spesifikasi karung 50 kg, harga Rp160.000, perbandingan harga pabrikan, cara pakai/transisi pakan | Tabel komposisi menampilkan 3 bahan dengan proporsi dan fungsi; harga terbaca sebagai perbandingan, bukan klaim absolut |
| S3 | Dampak | Metrik bergaya LOCOL (angka besar), tonase limbah, penghematan kolektif, emisi yang dihindari, sumber tiap angka | Setiap metrik menampilkan satuan, periode, dan sumber/asumsi |
| S4 | Edukasi | Artikel MDX (uji palatabilitas, hitung biaya pakan, silase musim kemarau, penyimpanan pakan anti jamur) | Minimal 4 artikel, terindeks sitemap, punya metadata OG |
| S5 | Mitra/KUD | Alur konsinyasi, potong setoran susu, rekonsiliasi; daftar KUD target | Menjelaskan 4 langkah operasional; menyebut KPBS Pangalengan, KUD Mojosongo/Cepogo, KUD Setia Kawan |
| S6 | Permintaan sampel gratis (lead) | Form 2–3 kg sampel, validasi input, simpan ke Supabase, notifikasi internal | Data tersimpan dengan RLS aktif; duplikat WhatsApp di-dedupe; respons < 1,5 s |
| S7 | Kontak & legal | WhatsApp, email, alamat, status NPP, kebijakan privasi | Nomor WhatsApp dapat diklik dari mobile; status NPP dinyatakan apa adanya (lihat Bagian 8) |
| S8 | Instrumen pengukuran | Vercel Analytics, Speed Insights, Sentry, event funnel | Event `cta_click`, `sample_form_start`, `sample_form_submit` terekam |

### 5.2 Di luar lingkup Phase 1 (eksplisit)

| Kode | Tidak dibangun sekarang | Alasan | Kapan |
|---|---|---|---|
| X1 | Portal peternak (login, riwayat potong setoran, referral) | Membutuhkan data ledger nyata; demo tanpa data = kosong dan melemahkan pitch | Phase 2 |
| X2 | Dashboard KUD (stok konsinyasi, rekonsiliasi) | Bergantung integrasi operasional KUD dan kesepakatan data | Phase 2 |
| X3 | Kalkulator biaya pakan interaktif | Bernilai tinggi tetapi bukan syarat demo; dikerjakan hanya jika waktu tersisa | Stretch Phase 1, penuh di Phase 2 |
| X4 | E-commerce / pembayaran online | Model bisnis memakai konsinyasi dan potong setoran, bukan check-out | Phase 3 |
| X5 | Aplikasi mobile native | Web responsif sudah menutup kebutuhan; biaya pemeliharaan ganda tidak sepadan | Dievaluasi Phase 4 |
| X6 | Multi-bahasa penuh (EN) | Pasar utama berbahasa Indonesia; struktur i18n disiapkan, terjemahan menyusul | Phase 3 |
| X7 | Integrasi IoT/pencatatan produksi susu otomatis | Perlu perangkat lapangan dan kesepakatan data peternak | Phase 4 |

**Aturan scope:** permintaan di luar daftar 5.1 yang muncul selama 2 minggu eksekusi masuk ke daftar tunggu Phase 2, kecuali pemilik produk menyetujui penggantian lingkup secara tertulis.

---

## 6. Alur Konversi

Dokumen sumber menetapkan kerangka `Awareness → Consideration/Trial → Retention & Expansion`. Pemetaannya ke situs:

```text
Awareness            Consideration & Validity        Trial / Action              Retention & Expansion
(TikTok/IG/FB/WA)    (beranda: masalah, produk,      (form sampel gratis,        (edukasi, referral,
                      dampak, bukti ilmiah)           WA langsung, mitra KUD)     komunitas)
      |                        |                              |                            |
      v                        v                              v                            v
  utm_source              cta_click                      sample_form_start          newsletter/artikel
  page_view               scroll_75                      sample_form_submit         referral_click
                                                                                            |
                                                                                            v
                                                                                    Phase 2: portal peternak
```

Event yang direkam Phase 1 (nama tetap, dipakai lintas fase):
`page_view`, `cta_click` (`cta_id`, `placement`), `scroll_75`, `outbound_wa_click`, `sample_form_start`, `sample_form_submit`, `article_read_75`, `referral_click`.

Pencatatan dilakukan tanpa data pribadi: `lead_id` hanya dihubungkan setelah pengguna mengisi form, dan atribusi kanal memakai `utm_*` yang tidak sensitif.

---

## 7. Spesifikasi Halaman Beranda (S1)

Urutan bagian, tujuan tiap bagian, dan bukti yang wajib ada:

| # | Bagian | Tujuan | Elemen wajib | Bukti/angka |
|---|---|---|---|---|
| 1 | Hero | Menyatakan siapa kami dan apa untungnya dalam 5 detik | Judul manfaat, subjudul, 2 CTA (Sampel Gratis, Lihat Produk), badge legalitas | Harga Rp160.000/50 kg sebagai jangkar |
| 2 | Masalah | Membuat peternak merasa dipahami | 3 kartu masalah: harga konsentrat, musim kemarau, buangan limbah | 60%–65% biaya produksi (Hajar, 2025); 3,45–4,6 juta ton/tahun (BPS, 2022) |
| 3 | Solusi | Menjelaskan ReCob.id dalam 1 kalimat + 3 pilar | Pilar: biaya, nutrisi/palatabilitas, ekonomi sirkular | — |
| 4 | Produk & formulasi | Menjawab "ini terbuat dari apa" | Tabel komposisi (3 bahan, proporsi, fungsi), spesifikasi kemasan, cara pakai/transisi | Bonggol jagung terfermentasi 50%–55%; ampas tahu terfermentasi 35%–40%; molase 5%–10% (formulasi mengacu Rumondang et al., 2023; Halawa, 2026) |
| 5 | Perbandingan biaya | Membuktikan penghematan dengan aritmetika terbuka | Tabel ReCob.id vs pabrikan + kolom asumsi | Rp160.000 vs Rp180.000–200.000/karung → hemat Rp20.000–40.000/karung (11%–20%) |
| 6 | Dampak | Menunjukkan skala misi (gaya LOCOL) | 3–4 angka besar + sumber | Lihat Bagian 7.1 |
| 7 | Kemitraan KUD | Menjelaskan jalur distribusi & pembayaran | Diagram 4 langkah alur potong setoran susu | KPBS Pangalengan, KUD Mojosongo/Cepogo, KUD Setia Kawan |
| 8 | Validasi | Menurunkan risiko persepsi "pakan murahan" | Uji laboratorium nutrisi, pendampingan transisi, referensi ilmiah | Sitasi 6 referensi dari dokumen sumber; status NPP apa adanya |
| 9 | Edukasi | Menangkap pencarian informasi | 4 kartu artikel terbaru | MDX, sitemap, OG image |
| 10 | FAQ | Menghilangkan keberatan terakhir | ≥ 6 pertanyaan (keamanan pakan, jamur/aflatoksin, cara transisi, pembayaran, pengiriman, garansi) | Jawaban merujuk prosedur QC |
| 11 | CTA akhir | Konversi | Form sampel 2–3 kg (4 kolom) + WhatsApp | Program sampel gratis 2–3 kg |
| 12 | Footer | Legitimasi & navigasi | Alamat, kontak, sosial, legal, NPP | — |

### 7.1 Model angka dampak (wajib ditampilkan sebagai ilustrasi berasumsi)

Angka dampak tidak boleh dikarang. Phase 1 memakai model berikut, dihitung di server dari data seed bertanda `is_demo = true`, dan disajikan dengan label "ilustrasi berbasis asumsi".

| Metrik | Nilai | Sumber / asumsi |
|---|---:|---|
| Potensi limbah bonggol jagung nasional | 3,45–4,6 juta ton/tahun | BPS (2022) |
| Penghematan biaya per karung 50 kg | Rp20.000–Rp40.000 | Harga dokumen: Rp160.000 vs Rp180.000–200.000 |
| Penghematan per ekor per bulan | Rp48.000–Rp96.000 | Asumsi konsumsi konsentrat 4 kg/ekor/hari, 30 hari |
| Penghematan per peternak 10 ekor per bulan | Rp480.000–Rp960.000 | Turunan dari baris di atas |
| Potensi kenaikan produksi susu | 1–2 liter/ekor/hari | **Klaim dokumen sumber — wajib dilabeli sebagai klaim yang menunggu validasi lapangan** |
| Emisi pembakaran terbuka yang dihindari | Perlu koefisien emisi resmi | Kosongkan sampai ada basis perhitungan yang dapat dikutip (jangan diisi angka estimasi liar) |

Setiap metrik di UI wajib menampilkan: nilai, satuan, periode, dan sumber. Metrik tanpa sumber yang dapat dikutip **tidak ditampilkan**.

---

## 8. Konten & Kepatuhan Klaim

Ini bagian paling berisiko pada produk pakan ternak. Aturan yang mengikat seluruh konten:

1. **Pemisahan klaim vs capaian.** Setiap klaim dari dokumen sumber (mis. "peningkatan produksi susu 1–2 liter/ekor/hari") ditampilkan sebagai klaim yang sedang diuji, bukan hasil terbukti. Blok penanda: label "klaim berbasis kajian" + tanggal validasi terakhir.
2. **Status legalitas apa adanya.** Nomor Pendaftaran Pakan (NPP) dari Kementerian Pertanian wajib ditampilkan: bila sudah terbit, cantumkan nomornya; bila belum, tulis "dalam proses pendaftaran". Dilarang menampilkan lencana legalitas yang belum dimiliki.
3. **Tidak ada klaim kesehatan hewan.** Dilarang menyatakan produk "menyembuhkan", "mencegah penyakit", atau "meningkatkan imunitas" tanpa izin edar yang relevan. Narasi imunitas dari dokumen sumber diturunkan menjadi "dukungan nutrisi" dan hanya di halaman edukasi dengan sitasi.
4. **Data QC disebutkan sebagai prosedur.** Pengujian kadar air, konsistensi nutrisi, dan risiko aflatoksin ditampilkan sebagai prosedur berjalan beserta frekuensinya, dengan siapa yang melakukan (lab pihak ketiga bila sudah ada).
5. **Sitasi selalu melekat.** Setiap angka ilmiah di UI memuat sitasi ringkas dan tautan ke daftar Referensi. Daftar lengkap 6 referensi dari dokumen sumber dipindahkan apa adanya.
6. **Kontak & identitas nyata.** Halaman kontak wajib memuat entitas hukum, alamat, dan kanal resmi yang benar-benar aktif sebelum rilis publik.
7. **Tanpa emoji.** Berlaku untuk UI, ikon, label, dan seluruh teks konten. Ikon memakai `lucide-react`; kategori/status memakai bentuk, teks, atau warna, bukan emoji.

---

## 9. Kebutuhan Non-Fungsional

| Area | Persyaratan | Verifikasi |
|---|---|---|
| Performa | LCP ≤ 2,0 s (mobile 4G), INP ≤ 200 ms, CLS ≤ 0,1, JS terkirim halaman beranda ≤ 180 KB gzip | Lighthouse CI + Speed Insights |
| Rendering | Konten marketing di-prerender statis dengan revalidasi berkala; hanya form dan data dinamis yang di-render server | inspeksi build output |
| Aksesibilitas | WCAG 2.1 AA: kontras ≥ 4,5:1 untuk teks normal, navigasi keyboard penuh, target sentuh ≥ 44 px, `prefers-reduced-motion` dihormati | axe + Lighthouse + checklist manual |
| SEO | Metadata per halaman, Open Graph, JSON-LD `Organization` + `Product`, `sitemap.xml`, `robots.txt` | audit Lighthouse SEO ≥ 95 |
| Keamanan | RLS aktif di setiap tabel, kunci `service_role` hanya di server, validasi input ganda (klien + server) dengan Zod, rate limit endpoint form | uji coba insert ilegal ditolak |
| Privasi | Hanya data minimum (nama, WhatsApp, jumlah ternak, lokasi); tidak ada token analitik pihak ketiga yang menjual data; halaman Kebijakan Privasi | review manual |
| Ketahanan | Pemakaian eksternal (Supabase, WhatsApp, Sentry) memiliki timeout eksplisit dan jalur gagal yang ramah (pesan error + tautan WhatsApp) | uji matikan jaringan/kunci salah |
| Observabilitas | Sentry (error + trace sample), Vercel Analytics (funnel), structured log di route handler | error uji memunculkan event di Sentry dalam < 60 s |
| i18n readiness | Tidak ada teks UI yang tertanam langsung di komponen; seluruh salinan terpusat di lapisan konten | pencarian string literal di `components/` saat review |
| Skalabilitas | Skema data Phase 2 sudah ada sebelum dibutuhkan (lihat `SCHEMA.md`), jalur naik dari Vercel Hobby → Pro tanpa perubahan kode | review arsitektur |

---

## 10. Risiko & Mitigasi

| # | Risiko | Dampak | Probabilitas | Mitigasi |
|---|---|---|---|---|
| R1 | Jaringan venue pitching buruk | Demo gagal di depan juri | Sedang | Mode demo lokal (`pnpm dev` tanpa dependensi jaringan), data dampak di-prerender, video fallback |
| R2 | Data lapangan belum ada, halaman Dampak terasa kosong | Kredibilitas turun | Tinggi | Semua metrik ilustrasi diberi label "is_demo" + asumsi terbuka; siapkan 3 skenario (konservatif/basis/optimis) |
| R3 | Klaim berlebihan memicu masalah regulasi/etika | Reputasi dan legal | Sedang | Aturan Bagian 8 ditegakkan sebagai gerbang review sebelum publish |
| R4 | Nomor WhatsApp belum siap di tahap pitch | Form tanpa tindak lanjut | Sedang | Notifikasi internal lewat email/Supabase; WhatsApp opsional dengan fallback form |
| R5 | Supabase gratis masuk mode jeda proyek (inactivity) | Form mati saat demo | Sedang | Ping terjadwal sebelum acara; seed ulang 1 hari sebelum demo; fallback simpan ke Vercel Function log |
| R6 | Scope creep 2 minggu (kalkulator, portal, dashboard) | Prototype tidak selesai | Tinggi | Bagian 5.2 ditetapkan menolak; perubahan lingkup harus tertulis |
| R7 | Kuota Vercel/Supabase terlampaui saat kampanye | Situs turun | Rendah | Cache statis, pemantauan kuota, jalur naik ke paket berbayar sudah dipetakan |
| R8 | Ketergantungan tunggal pada Supabase | Biaya pindah tinggi | Sedang | Semua akses data lewat modul `lib/data/*`; tipe DB digenerate; skema adalah Postgres standar (pindah ke Neon/RDS = tukar adaptor, bukan tulis ulang) |
| R9 | Ikon/emoji tercampur di UI | Inkonsistensi merek | Sedang | Gate lint: aturan `no-emoji` di CI (regex pada string di `components/` dan `content/`) |

---

## 11. Roadmap & Jalur Skalabilitas

```text
Phase 1  Prototype pitching        2 minggu          1 domain, konten statis, lead capture
   |
   v
Phase 2  Portal peternak + KUD     +6-8 minggu       Auth, order konsinyasi, ledger potong setoran, dashboard KUD
   |
   v
Phase 3  Ledger & integrasi mitra  +3-4 bulan       Rekonsiliasi otomatis, ekspor ke sistem KUD, notifikasi WA, referral terukur
   |
   v
Phase 4  Skala nasional            +6-12 bulan      Multi-region, multi-bahasa, bulk B2B, analitik dampak terverifikasi, IoT produksi susu
```

| Phase | Kapabilitas kunci | Kebutuhan arsitektur (sudah disiapkan di dokumen ini) |
|---|---|---|
| 1 | Situs marketing, lead capture, metrik berdasar asumsi | Next.js App Router + Supabase (Postgres/RLS), konten MDX, ISR |
| 2 | Akun peternak, order, riwayat potong setoran, dashboard KUD | Tabel `farms`, `orders`, `milk_deduction_entries`, RLS berbasis peran, view saldo |
| 3 | Rekonsiliasi periode, ekspor mitra, notifikasi | Tabel `settlement_periods`, mesin status, job terjadwal, kolom idempotensi |
| 4 | Multi-region, volume besar, pelaporan dampak | Partisi tabel event per bulan, materialized view agregat, read replica, i18n penuh |

Prinsip skala yang dipegang sejak Phase 1: **konten dan transaksi dipisah; perhitungan agregat tidak dilakukan di klien; setiap mutasi punya kunci idempotensi; tidak ada kueri yang memindai tabel besar.**

---

## 12. Rencana Eksekusi 14 Hari

| Hari | Workstream | Keluaran |
|---|---|---|
| 1 | Fondasi | Repositori, Next.js 16 + TypeScript, Tailwind v4, token desain dari `DESIGN.md`, CI (lint, tipe, test), proyek Vercel + preview deploy |
| 2 | Fondasi data | Proyek Supabase, migrasi tabel Phase 1, RLS, seed KUD/produk/metrik, klien Supabase server/browser |
| 3–4 | Beranda bagian 1–5 | Hero, masalah, solusi, produk, tabel biaya; copy final dari BMC; aset visual |
| 5 | Beranda bagian 6–8 | Dampak (metrik + sumber), kemitraan KUD, validasi |
| 6 | Beranda 9–12 + form | Edukasi, FAQ, CTA, footer, form sampel end-to-end + notifikasi |
| 7 | Halaman sekunder | Produk, Dampak, Mitra/KUD, Kontak, Kebijakan Privasi |
| 8 | Edukasi | 4 artikel MDX, sitemap, OG image, JSON-LD |
| 9 | Stretch | Kalkulator penghematan (hanya jika seluruh item di atas selesai) |
| 10 | Kualitas | Playwright smoke, audit Lighthouse, perbaikan aksesibilitas, uji jaringan lambat, uji form gagal |
| 11 | Observabilitas & keamanan | Sentry, event funnel, review RLS, rate limit, uji insert ilegal |
| 12 | Konten & kepatuhan | Review Bagian 8 (klaim, NPP, sitasi, tanpa emoji), finalisasi copy |
| 13 | Latihan pitch | Skenario demo 5 menit, mode offline, seed ulang, ukur waktu muat |
| 14 | Rilis | Deploy produksi, domain, cek pasca-rilis, arsip tag rilis |

Dua hari terakhir sebelum pitch dijadwalkan **buffer** — tidak ada fitur baru, hanya perbaikan.

---

## 13. Tim & Peran

| Peran | Tanggung jawab | Fase |
|---|---|---|
| Pemilik produk | Keputusan lingkup, validasi klaim, kontak KUD | 1–4 |
| Tech lead | Arsitektur, skema data, RLS, rilis | 1–4 |
| Frontend engineer | Komponen, halaman, aksesibilitas, performa | 1–3 |
| Content & copywriter | Naskah halaman, artikel edukasi, kepatuhan klaim | 1–4 |
| Ahli nutrisi ternak | Validasi angka, uji laboratorium, jawaban FAQ teknis | 1–4 |

Bila dikerjakan solo, urutan prioritas: fondasi (hari 1–2) → beranda (3–6) → halaman sekunder (7–8) → kualitas (10–12) → rilis (14). Item stretch dan observabilitas lanjutan dijatuhkan lebih dulu bila waktu mendesak.

---

## Lampiran A — Pemetaan BMC ke Fitur Digital

| Blok BMC | Fitur/bagian situs yang mengeksekusi |
|---|---|
| Customer Segments | Pesan berjenjang: peternak kecil-menengah (beranda), KUD (halaman Mitra), commercial farm (bulk) |
| Value Propositions | Bagian 5–8 beranda: biaya, nutrisi/palatabilitas, skema pembayaran, ekonomi sirkular, jaminan kualitas |
| Channels | Situs sebagai pusat konversi; tautan bio TikTok/IG/FB/WA mengarah ke halaman ini dengan UTM |
| Customer Relationships | Program sampel gratis (form S6), konten pendampingan transisi, halaman edukasi sebagai wadah komunitas |
| Revenue Streams | Halaman produk (karung 50 kg) dan halaman bulk; belum ada check-out di Phase 1 |
| Key Resources | Bagian validasi: formula, fasilitas, status sertifikasi |
| Key Activities | Bagian QC dan alur konsinyasi pada halaman Mitra |
| Key Partnerships | Halaman Mitra/KUD, daftar lembaga riset sebagai bukti validasi |
| Cost Structure | Tidak ditampilkan sebagai halaman; hanya tercermin di tabel perbandingan biaya |

---

## Lampiran B — Referensi

1. Badan Pusat Statistik. (2022, 16 Desember). *Analisis produktivitas jagung dan kedelai di Indonesia 2021*. BPS RI.
2. Hajar. (2025). *Perubahan pola konsumsi pakan ternak dan dampaknya terhadap ketahanan sosial-ekonomi peternak tradisional*. JHUSE.
3. MadaniTec. (n.d.). *Jenis limbah pertanian yang bisa jadi pakan ternak*.
4. Halawa, E. H. (2026). *Efektivitas pakan fermentasi ampas tahu terhadap efisiensi pakan dan pertumbuhan ikan patin*. PERAUT, 3(1), 71–78.
5. Rumondang, A., Pamukas, N. A., Huda J, M. A., & Safitri, M. (2023). *Pengaruh pemberian ampas tahu yang difermentasi menggunakan probiotik EM4 terhadap pertambahan populasi Daphnia magna*. Jurnal Perikanan, 13(3), 775–782.
6. Zulaikhah, S. R., Sidhi, A. H., Rohmat, N., & Irawati, N. (2026). *Pembuatan silase sebagai solusi kelangkaan pakan di musim kemarau*. JPPIPA, 9(2), 614–618.

Catatan metodologis: referensi 4 dan 5 adalah studi pada ikan (patin, Daphnia), bukan sapi perah. Situs **tidak boleh** menyajikannya sebagai bukti langsung efektivitas pada sapi perah; keduanya hanya boleh dikutip sebagai dasar mekanisme fermentasi ampas tahu, dengan keterangan konteks studi.
