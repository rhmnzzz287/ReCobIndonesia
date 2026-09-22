---
version: alpha
name: ReCob.id
description: Nutrisi dari limbah jadi — hijau jerami, angka jujur, dan ketenangan hasil bumi. Sistem desain untuk platform digital ReCob.id (pelet konsentrat sapi perah dari bonggol jagung terfermentasi).
colors:
  surface: "#FFFFFF"
  cream: "#FFF8EE"
  paper: "#F4F8F0"
  ink: "#0D1216"
  ink-deep: "#123326"
  primary: "#0B6E3B"
  primary-strong: "#084F2A"
  primary-soft: "#E7F1E4"
  accent: "#7DBE35"
  accent-ink: "#61A33C"
  corn: "#EDC22E"
  tan: "#D9C89A"
  text: "#1F2A24"
  text-secondary: "#4A5A52"
  border: "#DDEBD2"
  amber-soft: "#FFF3D1"
  amber-ink: "#7A5C12"
typography:
  display:
    fontFamily: Rubik
    fontSize: clamp(2.5rem, 8vw, 4.5rem)
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.035em"
  display-xl:
    fontFamily: Rubik
    fontSize: clamp(2rem, 5.5vw, 3.5rem)
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  h1:
    fontFamily: Rubik
    fontSize: clamp(2rem, 5.5vw, 3.5rem)
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  h2:
    fontFamily: Rubik
    fontSize: clamp(1.625rem, 4vw, 2.5rem)
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  h3:
    fontFamily: Rubik
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.3
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.65
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.55
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.8125rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.08em"
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1.45
  metric-lg:
    fontFamily: Rubik
    fontSize: clamp(2.5rem, 8vw, 4.5rem)
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "tnum"
  metric-md:
    fontFamily: Rubik
    fontSize: clamp(1.75rem, 4.5vw, 2rem)
    fontWeight: 700
    lineHeight: 1.05
    fontFeature: "tnum"
  mono-data:
    fontFamily: IBM Plex Mono
    fontSize: 0.8125rem
    fontWeight: 500
    lineHeight: 1.4
rounded:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 18px
  xl: 28px
  arc: 48px
  pill: 999px
spacing:
  2xs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  section: 96px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: 14px
  button-primary-hover:
    backgroundColor: "{colors.primary-strong}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: 14px
  button-accent-hover:
    backgroundColor: "{colors.accent-ink}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: 14px
  link:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
  nav-link:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body-sm}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 24px
  card-cream:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 24px
  badge-neutral:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.text}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 8px
  badge-primary:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 8px
  badge-partner:
    backgroundColor: "{colors.tan}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 8px
  metric-highlight:
    backgroundColor: "{colors.corn}"
    textColor: "{colors.ink}"
    typography: "{typography.metric-md}"
    rounded: "{rounded.xl}"
    padding: 32px
  stat-panel:
    backgroundColor: "{colors.ink-deep}"
    textColor: "{colors.accent}"
    typography: "{typography.metric-lg}"
    rounded: "{rounded.xl}"
    padding: 32px
  alert-warn:
    backgroundColor: "{colors.amber-soft}"
    textColor: "{colors.amber-ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: 16px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 14px
  caption-note:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.caption}"
  divider:
    backgroundColor: "{colors.border}"
    textColor: "{colors.ink}"
  section-cream:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    typography: "{typography.body-lg}"
    padding: 96px
  section-paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body-lg}"
    padding: 96px
  footer:
    backgroundColor: "{colors.ink-deep}"
    textColor: "{colors.surface}"
    typography: "{typography.body-sm}"
    padding: 64px
---

# ReCob.id Design System

Sistem desain ini adalah satu-satunya sumber kebenaran nilai visual platform ReCob.id. Bagian
YAML di atas bersifat normatif (itulah yang dibaca mesin dan diekspor ke Tailwind); bagian prosa
di bawah menjelaskan alasan di balik setiap nilai agar agen dan anggota tim dapat menerapkannya
tanpa menebak.

Versi dokumen: 1.0.0. Dokumen terkait: `PRD.md` (produk), `SCHEMA.md` (data).

## Overview

**Konsep:** *Nutrisi dari limbah jadi.*

ReCob.id mengubah bonggol jagung dan ampas tahu — dua hal yang biasanya dibuang — menjadi pakan
yang membuat sapi berproduksi. Identitas visual harus menyampaikan tiga hal sekaligus: **humus**
(tanah, hasil bumi, jerami), **presisi** (formulasi terukur, angka yang bisa diaudit), dan
**ketenangan** (peternak ingin kepastian, bukan sensasi).

**Titik tolak:** lambang `logo.png` — emblem sirkular dengan cincin bergaya anyaman yang
sekaligus berfungsi sebagai tanduk, kepala sapi bergaris tipis seragam di tengah, tongkol jagung
di kiri atas, dedaunan di kanan atas, dan karung pakan sebagai dudukan. Karakter emblem ini
*hand-etched*: garis seragam, tanpa gradien, tanpa bayangan. Seluruh bahasa visual produk
digital diturunkan dari situ: **garis tipis konsisten, bidang solid, ruang kosong sebagai
pemisah, tanpa tekstur palsu.**

**Referensi yang dipelajari (bukan untuk ditiru mentah-mentah):**

| Sumber | Yang diambil | Yang tidak diambil |
|---|---|---|
| `nufeed.co.id` | Struktur yayasan pakan: kredibilitas produk, keunggulan berbasis kebutuhan ternak, blok artikel edukasi, ajakan konsultasi WhatsApp | Toko warna hijau-lime penuh dengan kartu produk; ReCob.id lebih datar dan lebih gelap di bagian metrik |
| `locol.company` | Spesifikasi dampak: angka besar, satuan, periode, sumber — narasi misi diterjemahkan menjadi metrik | Gaya "tech-climate" gelap penuh; ReCob.id memakai panel gelap hanya sebagai aksen metrik agar tetap terbaca di bawah matahari |

**Prinsip operasional:**

1. **Angka lebih dahulu, kata-kata belakangan.** Di mana konten berbicara tentang penghematan,
   produksi, atau limbah, angka muncul sebagai elemen visual utama — bukan tersembunyi dalam
   paragraf.
2. **Setiap angka membawa sumber.** Tipografi angka selalu berpasangan dengan `caption-note`
   berisi asumsi/sitasi. Tidak ada angka telanjang di UI.
3. **Hijau untuk tindakan, bukan hiasan.** Warna primer hanya untuk aksi dan tautan; warna aksen
   hanya untuk penekanan energi. Permukaan netral mendominasi.
4. **Bidang, bukan bayangan.** Struktur halaman dibentuk oleh bidang warna (`cream`, `paper`,
   `ink-deep`) dan garis pemisah, bukan oleh bayangan tebal.
5. **Datar dan jujur.** Tanpa gradien dekoratif, tanpa ilustrasi 3D, tanpa emoji di mana pun.
   Ikon memakai `lucide-react` dengan ketebalan garis seragam — memperpanjang karakter
   *line-art* emblem.

---

## Colors

Palet diturunkan dari lambang: hijau jerami, kuning jagung, krem karung. Peran tiap token
dikunci di bawah ini — aturan ini yang mencegah warna aksen bocor menjadi warna teks.

### Permukaan

- **`surface` (#FFFFFF):** Kanvas utama. Kartu, input, dan latar navbar.
- **`cream` (#FFF8EE):** Bagian hangat bernuansa karung gandum. Dipakai untuk bagian formulasi
  produk dan kemitraan KUD.
- **`paper` (#F4F8F0):** Bagian sejuk bernuansa kertas daur. Dipakai untuk bagian dampak dan
  edukasi agar beranda bergantian irama tanpa garis tebal.
- **`ink-deep` (#123326):** Hijau malam untuk panel metrik dampak dan footer. Satu-satunya
  permukaan gelap; rasio teks putih di atasnya 13,75:1.

### Aksi

- **`primary` (#0B6E3B):** Hijau pekat. Tombol utama, tautan, dan ikon pada permukaan terang.
  Dibandingkan lambang (#4E8B3A) warna ini digelapkan agar lolos kontras teks putih 6,35:1.
- **`primary-strong` (#084F2A):** Keadaan `:hover`/`:active` tombol utama.
- **`primary-soft` (#E7F1E4):** Latar lencana dan blok sorotan. Juga satu-satunya warna teks
  aksen di atas bidang `primary` (5,47:1) — dipakai untuk label mata dan angka pahlawan di
  pita hero serta pita ajakan.
- **`accent` (#7DBE35):** Hijau jerami cerah. Tombol aksen (klaim sampel gratis) dan angka besar
  di panel `ink-deep`. **Tidak pernah** dipakai sebagai warna teks di atas putih (2,26:1),
  dan **tidak pernah** di atas `primary` (2,81:1 — gagal ambang teks besar 3:1).
- **`accent-ink` (#61A33C):** Hanya untuk `:hover` tombol aksen dan garis grafik (bukan teks di
  atas putih — 3,08:1).

### Aksen dan netral

- **`corn` (#EDC22E):** Kuning tongkol. Hanya sebagai bidang (latar kartu sorotan, grafik,
  ilustrasi) dengan teks `ink` di atasnya. Rasio 11,08:1 saat dipakai begitu.
- **`tan` (#D9C89A):** Warna karung. Latar lencana mitra/KUD dengan teks `ink` (11,37:1).
- **`ink` (#0D1216):** Teks utama pada permukaan terang (17,86:1 di atas `cream`).
- **`text` (#1F2A24):** Teks antarmuka yang lebih ringan dari `ink` (navigasi, uraian panjang).
- **`text-secondary` (#4A5A52):** Teks pendukung, keterangan tabel, dan **garis batas kontrol
  formulir** (7,3:1 di atas putih, memenuhi syarat batas kontrol 3:1).
- **`border` (#DDEBD2):** Hijau sangat muda untuk **pemisah dekoratif saja** (1,24:1 — jangan
  pernah dipakai sebagai batas kontrol formulir atau indikator status).
- **`amber-soft` (#FFF3D1) / `amber-ink` (#7A5C12):** Pasangan peringatan (5,64:1) — dipakai
  untuk penanda "ilustrasi berbasis asumsi", status "dalam proses pendaftaran" NPP, dan pesan
  galat ringan.

### Aturan kontras yang mengikat

| Kombinasi | Rasio | Boleh? |
|---|---:|---|
| `surface` di atas `primary` (teks tombol utama) | 6,35:1 | Ya |
| `ink` di atas `accent` (teks tombol aksen) | 8,33:1 | Ya |
| `primary` di atas `primary-soft` (lencana) | 5,47:1 | Ya |
| `text-secondary` di atas `paper` (keterangan) | 6,93:1 | Ya |
| `amber-ink` di atas `amber-soft` (peringatan) | 5,64:1 | Ya |
| `accent` di atas `ink-deep` (angka metrik) | 6,08:1 | Ya |
| `primary-soft` di atas `primary` (label mata, angka pahlawan) | 5,47:1 | Ya |
| `surface/90` di atas `primary` (teks pita hero) | 5,46:1 | Ya |
| `surface/85` di atas `primary` (teks pita hero) | 5,06:1 | Ya |
| `primary` di atas `surface` (tautan, tombol sekunder) | 6,35:1 | Ya |
| `surface` di atas `ink-deep` (footer) | 13,75:1 | Ya |
| `accent` sebagai teks di atas `surface` | 2,26:1 | **Tidak** |
| `accent` sebagai teks di atas `primary` | 2,81:1 | **Tidak** — pakai `primary-soft` |
| `corn` sebagai teks di atas `surface` | 1,70:1 | **Tidak** |
| `border` sebagai batas input | 1,24:1 | **Tidak** — pakai `text-secondary` |
| Hijau lambang mentah (#4E8B3A) sebagai teks | 4,14:1 | **Tidak** — pakai `primary` |

### Penggunaan warna semantik

| Keperluan | Nilai | Catatan |
|---|---|---|
| Sukses / terverifikasi | `primary` | Ikon `check` + teks, bukan warna saja |
| Peringatan / menunggu validasi | `amber-ink` di `amber-soft` | Wajib disertai ikon `triangle-alert` |
| Galat formulir | `amber-ink` di `amber-soft` | Ditemani ikon dan teks; tidak memakai merah agar tidak melampaui batas merek |
| Data intraktif | `accent-ink` untuk garis/kolom, `text-secondary` untuk sumbu | Label sumbu minimal `caption` |

---

## Typography

Dua keluarga huruf saja, dengan satu tambahan monospaced untuk data legal. Emblem memakai garis
seragam tanpa serif, jadi tipografi pun memakai sans yang tegas tanpa lekukan dekoratif.

- **Rubik (500/600/700/800):** Judul dan **semua angka metrik**. Peran ganda ini disengaja:
  angka dampak harus terasa seperti bagian dari identitas, bukan keluaran tabel. `fontFeature:
  "tnum"` pada token metrik memastikan angka rata kolom saat ditumpuk dalam panel.
- **Plus Jakarta Sans (400/500/600):** Teks isi, tombol, label, navigasi. Bentuk hurufnya
  ramah untuk pembaca Indonesia dan bobot 400-nya sangat terbaca di layar ponsel kelas menengah.
- **IBM Plex Mono (500):** Hanya untuk data legal dan teknis: nomor NPP, kode LOT, rentang
  proporsi di tabel formulasi, serta label daftar pustaka. Penggunaannya sengaja jarang agar
  sinyal "ini angka resmi" tetap kuat.

### Skala

| Token | Ukuran | Berat | Penggunaan |
|---|---:|---:|---|
| `display` | 40–72 px | 800 | Angka pahlawan di hero beranda, satu per halaman |
| `display-xl` | 32–56 px | 800 | Judul bagian besar, satu per halaman |
| `h1` | 32–56 px | 800 | Judul halaman bagian dalam |
| `h2` | 26–40 px | 700 | Judul bagian beranda |
| `h3` | 20 px | 600 | Judul kartu, pertanyaan FAQ |
| `body-lg` | 18 px | 400 | Paragraf pembuka bagian, jawaban FAQ |
| `body-md` | 16 px | 400 | Teks isi standar; ukuran minimum untuk teks panjang |
| `body-sm` | 14 px | 400 | Keterangan tabel, catatan kaki, meta artikel |
| `label-md` | 13 px | 600 | Tombol dan label huruf kapital dengan `letter-spacing: 0.08em` |
| `caption` | 12 px | 500 | Sumber metrik, asumsi, stempel waktu |
| `metric-lg` | 40–72 px | 800 | Angka utama panel dampak |
| `metric-md` | 28–32 px | 700 | Angka sekunder, angka dalam kartu |
| `mono-data` | 13 px | 500 | NPP, KODE, nomor rujukan |

Ukuran judul dan angka memakai `clamp()` sehingga menyusut proporsional di lebar 360 px;
batas bawah adalah nilai di ponsel, batas atas nilai di desktop ≥1024 px. Tanpa ini judul
56 px meluap keluar viewport pada layar ponsel.

Aturan: maksimum 65 karakter per baris untuk teks isi; `caption` tidak pernah dipakai untuk
paragraf panjang; angka tidak pernah ditulis dalam bentuk huruf ("dua puluh" salah, "20" benar).

---

## Layout

- **Lebar konten:** 1200 px maksimum, gutter 24 px (mobile) / 32 px (desktop), kolom 12.
- **Ritme bagian:** padding vertikal `section` (96 px) di desktop, 64 px di tablet, 48 px di
  mobile. Irama warna bagian: `surface` → `cream` → `surface` → `ink-deep` (dampak) →
  `paper` → `surface`.
- **Pita hero:** bidang `primary` penuh lebar dengan lengkung bawah `arc` (48 px), tipografi
  `display` untuk angka pahlawan, dan lencana kredibilitas di bawahnya. Pita ini pengganti
  foto hero: identitas dibawa oleh bidang warna dan tipografi, bukan citra.
- **Titik henti:** 480 / 768 / 1024 / 1280 px. Rentang 768–1024 px adalah prioritas karena
  perangkat lapangan sering berada di ukuran tablet kecil dan ponsel lanskap.
- **Grid kartu:** 3 kolom ≥1024 px, 2 kolom 768–1023 px, 1 kolom <768 px. Ketinggian kartu
  dalam satu baris wajib sama (flex/grid `stretch`), isi tumbuh ke bawah.
- **Panel metrik:** 2 kolom di ≥768 px dengan angka rata kiri; di mobile menjadi tumpukan
  dengan pemisah `border`, bukan bayangan.
- **Formulir sampel:** satu kolom penuh, label di atas input, lebar input penuh, jarak antar
  kolom `md` (16 px), tombol utama selebar kolom. Maksimum 4 kolom data wajib.
- **Target sentuh:** minimum 44 × 44 px untuk semua tautan dan tombol — peternak sering
  mengoperasikan dengan sarung tangan.
- **Sticky CTA mobile:** bilah bawah setinggi 64 px berisi tombol "Klaim Sampel Gratis" dan
  tautan WhatsApp, muncul setelah pengguna melewati bagian produk, hilang saat formulir masuk
  layar.

---

## Elevation & Depth

Kedalaman dibatasi empat tingkatan; pada permukaan gelap, kedalaman diungkapkan dengan garis
`1px` berwarna `primary-soft` pada opasitas 20%, bukan bayangan.

| Tingkat | Nilai | Penggunaan |
|---|---|---|
| `flat` | tanpa bayangan, batas `1px` `border` | Kartu di dalam bagian berwarna (`cream`/`paper`) |
| `raised` | `0 1px 2px rgba(13,18,22,0.06), 0 8px 24px rgba(13,18,22,0.06)` | Kartu di atas `surface` |
| `sticky` | `0 -2px 12px rgba(13,18,22,0.08)` | Bilah CTA lengket |
| `focus` | `0 0 0 3px rgba(125,190,53,0.35)` + `outline-offset: 2px` | Keadaan fokus tombol/tautan/input |

Keadaan fokus tidak boleh dihapus. Fokus di atas bidang gelap memakai warna `accent` penuh.

---

## Shapes

- Sudut: `xs` 4 px untuk elemen sebaris kecil, `sm` 8 px untuk input dan lencana persegi,
  `md` 12 px untuk tombol, `lg` 18 px untuk kartu, `xl` 28 px untuk panel metrik, `arc` 48 px
  untuk bidang besar (hero, pita ajakan) sebagai lengkung bawah, `pill` untuk lencana status.
- Ikon: `lucide-react`, `strokeWidth` 1,75 (konsisten di seluruh aplikasi), ukuran 20 px dalam
  teks/daftar, 24 px dalam tombol, 32 px dalam kartu fitur.
- Motif emblem: lingkaran bergaris dan kepala sapi bergaris dipakai sebagai elemen dekoratif
  (mis. penanda bagian dengan cincin `border` putus-putus) — selalu `aria-hidden`, tidak pernah
  menjadi satu-satunya pembawa makna.
- Proporsi tabel formulasi divisualkan sebagai bilah bertumpuk horizontal (55% / 38% / 7%
  ternormalisasi) dengan label persentase langsung di dalam bilah untuk lebar ≥768 px.
- Tanpa gradien dekoratif. Gradien hanya boleh sebagai *scrim* di atas foto (hitam ke
  transparan) untuk menjaga keterbacaan teks putih.

---

## Components

Komponen di bawah ini adalah kontrak visual minimum; implementasinya ada sebagai komponen React
di `components/ui/*` dengan `class-variance-authority` untuk varian dan `cn()` untuk penggabungan
kelas.

| Komponen | Perilaku yang dikunci |
|---|---|
| `button-primary` | Aksi utama halaman. Satu maksimum per layar. `hover` → `button-primary-hover`; `active` tekan 1 px turun; `disabled` opasitas 45% tanpa bayangan; tinggi minimum 48 px; label maksimum 3 kata |
| `button-accent` | Aksi "Klaim Sampel Gratis". Ditempatkan di hero, bagian produk, dan bilah lengket. `hover` → `button-accent-hover`; wajib punya ikon `lucide` di kanan |
| `button-secondary` | Aksi alternatif di atas bidang berwarna. Batas `1px` `text-secondary` |
| `link` | Selalu bergaris bawah saat `hover`, tanpa garis bawah saat `idle` di navigasi, dengan garis bawah saat `idle` di dalam paragraf |
| `nav-link` | Tinggi 44 px, keadaan aktif ditandai teks `primary` + batas bawah 2 px |
| `card` | Permukaan putih, sudut `lg`, jarak `lg`, tanpa bayangan di dalam bagian berwarna; konten: ikon 32 px, `h3`, `body-sm` |
| `card-cream` | Varian kartu di atas `surface`, dipakai untuk blok formulasi produk |
| `badge-neutral` / `badge-primary` / `badge-partner` | Tinggi 28 px, tanpa ikon kecuali `badge-partner` (ikon `handshake`) |
| `metric-highlight` | Panel `corn` untuk satu angka kunci per bagian; angka `metric-md` + `caption` sumber di bawahnya, selalu berpasangan |
| `stat-panel` | Panel `ink-deep` untuk kumpulan metrik dampak; angka `accent`, label `surface` pada opasitas 80%, sumber `caption` |
| `alert-warn` | Penanda asumsi/disclaimer & status legal. Wajib memuat ikon `triangle-alert` 20 px dan tidak boleh lebih dari 3 baris |
| `input` | Tinggi 48 px, batas `1px` `text-secondary`, label di atas (`body-sm`), teks galat `amber-ink` dengan ikon `circle-alert`, `inputMode` yang tepat untuk nomor WhatsApp (`tel`) dan jumlah ternak (`numeric`) |
| `caption-note` | Blok asumsi/sumber di bawah angka: `caption` pada `paper`, diakhiri titik, bukan tanda seru |
| `divider` | Garis 1 px `border`; tidak ada garis di antara bagian berwarna berbeda (perbedaan warna sudah cukup) |
| `section-cream` / `section-paper` | Pembungkus bagian berirama; padding vertikal token `section` |
| `footer` | Empat kolom di desktop (produk, perusahaan, kontak, legal), satu kolom di mobile; memuat status NPP dan nomor kontak aktif |

Semua komponen wajib: (a) dapat dioperasikan keyboard, (b) menyatakan keadaan `focus-visible`
memakai token `focus`, (c) menghormati `prefers-reduced-motion` dengan menghilangkan animasi
transformasi, (d) tidak pernah memakai emoji sebagai ikon atau penanda.

---

## Do's and Don'ts

### Do

- Turunkan setiap keputusan visual dari lambang: garis seragam, bidang solid, ruang kosong.
- Tampilkan sumber di bawah setiap angka (`caption-note`) — nilai, satuan, periode, sumber.
- Pakai ikon `lucide-react` dengan `strokeWidth` 1,75 dan ukuran konsisten.
- Gunakan `primary` untuk teks di atas permukaan terang; simpan `accent` untuk bidang dan panel gelap.
- Uji setiap halaman di lebar 360 px dan di 4G lambat sebelum dianggap selesai.
- Beri label jelas pada metrik ilustrasi (lencana `amber` "ilustrasi berbasis asumsi").
- Pertahankan satu aksi utama per layar.
- Tulis angka dengan digit (`160000` atau `Rp160.000`), bukan huruf.

### Don't

- **Jangan pakai emoji di mana pun** — UI, konten, label, alt text, pesan galat. Pakai ikon.
- Jangan pakai `accent`, `accent-ink`, atau `corn` sebagai warna teks di atas permukaan terang.
- Jangan pakai `border` (#DDEBD2) sebagai batas kontrol formulir atau satu-satunya penanda status.
- Jangan tambahkan gradien dekoratif, glassmorphism, atau bayangan berlapis.
- Jangan pakai biru/ungu "SaaS" bawaan; seluruh keluarga warna adalah hijau-kuning-krem untuk
  alasan yang dapat dijelaskan dari lambang.
- Jangan gunakan foto berbayar bergaya korporat dengan orang bersetelan rapi; pakai foto kandang,
  tongkol jagung, dan peternak nyata (dengan izin).
- Jangan bungkus tabel formulasi dalam carousel atau akordeon — informasi ini adalah inti produk.
- Jangan tulis klaim tanpa sumber; ambang ini bukan preferensi estetika melainkan syarat
  kepatuhan (`PRD.md` Bagian 8).

---

## Tech Stack

Pilihan di bawah ini dioptimalkan untuk dua hal sekaligus: selesai dalam 2 minggu, dan tidak
perlu ditulis ulang saat masuk Phase 2–4. Versi dipatok langsung saat inisialisasi proyek.

| Lapisan | Pilihan | Versi saat penulisan | Alasan ringkas |
|---|---|---|---|
| Bahasa | TypeScript (strict) | 7.0.x | Pengetikan statis; `strict: true` wajib, tanpa `any` eksplisit |
| Kerangka | Next.js App Router | 16.3.x | Rendering hibrida (statis untuk konten, server untuk form) dalam satu runtime |
| UI | React | 19.3.x | Server Components mengurangi JavaScript yang dikirim ke ponsel |
| Gaya | Tailwind CSS | 4.3.x | Token dari `DESIGN.md` diekspor ke `@theme`; tanpa CSS runtime |
| Komponen | `class-variance-authority` + `tailwind-merge` + `clsx` | 0.7 / 3.7 / 2.1 | Varian komponen bertipe; tanpa mengambil dependensi UI besar |
| Ikon | `lucide-react` | 1.47.x | Garis seragam 1,75 px; menegakkan larangan emoji |
| Animasi | `motion` (Framer Motion) | 13.4.x | Animasi masuk hemat; menghormati `prefers-reduced-motion` |
| Data & Auth | Supabase (Postgres 17, Auth, Storage) | SDK 2.116.x, `@supabase/ssr` 0.12.x | Postgres relasional + RLS + cabang basis data per PR (Phase 2) |
| Validasi | Zod | 4.6.x | Satu skema dipakai di form, Server Action, dan uji |
| Konten | MDX (`next-mdx-remote` + `gray-matter`) | 6.0 / 4.0 | Artikel edukasi sebagai berkas di repo, tervalidasi saat build |
| Uji | Vitest, Testing Library, Playwright | 5.0 / 16.3 / 1.63 | Unit → integrasi → smoke E2E di build produksi |
| Kualitas | ESLint, Prettier, `tsc --noEmit`, `check-no-emoji.mjs` | ESLint 10 | Empat gerbang yang sama di lokal dan CI |
| Observabilitas | `@sentry/nextjs`, `@vercel/analytics`, `@vercel/speed-insights` | 10.75 / 2.0 / 2.0 | Galat, funnel, dan Web Vitals tanpa membebani halaman |
| Hosting | Vercel (Fluid Compute, Image Optimization, Edge CDN) | — | Preview per PR, CDN global, tanpa penyiapan infrastruktur |

Yang **tidak** dipakai dan alasannya: CMS eksternal (4 artikel, 1 penulis — tidak sepadan),
Redux/Zustand (belum ada state klien lintas halaman yang kompleks), komponen UI pihak ketiga
berbobot besar (Tailwind + CVA sudah cukup dan lebih mudah dijaga konsisten dengan token ini),
Google Analytics (bobot + privasi; analitik funnel ditulis sendiri ke `lead_event`).

---

## Arsitektur Sistem

```text
                        +-----------------------------------------+
   TikTok / Instagram   |            Vercel Edge CDN              |
   / Facebook / WA ---> |  (cache statis, WIB timezone, header)   |
                        +--------------------+--------------------+
                                             |
                    +------------------------+------------------------+
                    |                                                 |
        +-----------v-----------+                        +------------v-------------+
        |  Rute Statis (ISR)    |                        |   Fungsi Server (Node)   |
        |  - beranda            |                        |  - Server Action form    |
        |  - produk             |                        |  - /api/lead (fallback)  |
        |  - dampak             |                        |  - /api/health           |
        |  - edukasi/[slug]     |                        |  - middleware sesi       |
        |  - mitra, kontak      |                        +------------+-------------+
        +-----------+-----------+                                     |
                    |                                                 |
                    |  revalidate: 3600s                              |  batas tepercaya:
                    |  tag: 'impact', 'product'                       |  validasi Zod + rate limit
                    v                                                 v
        +----------------------------------------------------------------------------------+
        |                          Supabase (ap-southeast-1)                                |
        |  Postgres: region, kud, product, product_ingredient, impact_metric(+_reference),   |
        |            lead, lead_event        |  RLS aktif  |  Fungsi: submit_sample_lead     |
        |  Auth (Phase 2)  |  Storage (foto produk & kandang, Phase 1 untuk aset statis)     |
        +----------------------------------------------------------------------------------+
                                             ^
                                             | notifikasi internal (email/WA gateway)
                                             |
                              +--------------+---------------+
                              |  Operator ReCob.id (admin)   |
                              +------------------------------+
```

Batas kepercayaan (yang menentukan seluruh desain keamanan):

1. **Peramban = tidak tepercaya.** Tidak ada `service_role` di bundel klien. Form dikirim ke
   Server Action yang memvalidasi ulang dengan skema Zod yang sama.
2. **Basis data = otoritas akhir.** RLS + constraint adalah gerbang terakhir, bukan validasi
   aplikasi. Bahkan bila Server Action keliru, `lead_phone_active_idx` dan
   `submit_sample_lead` tetap mencegah duplikat.
3. **Batas fase dijaga skema.** Tabel Phase 2 sudah dirancang (`SCHEMA.md` Bagian 5) tetapi tidak
   dibuat; tidak ada `ALTER` destruktif yang dibutuhkan saat naik fase.

### Keputusan Arsitektur (ADR)

**ADR-001 — Next.js 16 App Router sebagai satu-satunya runtime.**
*Konteks:* konten pemasaran butuh SEO dan muat cepat; form butuh render server; Phase 2–3 butuh
autentikasi, dasbor, dan endpoint.
*Alternatif:* (a) Astro + pulau interaktif — unggul untuk konten statis, tetapi Phase 2 memaksa
penambahan backend kedua; (b) SPA Vite (pengalaman tim) — cepat dibuat, SEO lemah untuk 4 artikel
edukasi yang menjadi kanal akuisisi; (c) Next.js App Router.
*Keputusan:* (c).
*Konsekuensi negatif yang diterima:* kurva belajar Server/Client Component, batas `"use client"`
mudah salah tempat, dan analisis bundel lebih rumit. Mitigasi: aturan bahwa hanya komponen
interaktif (akordeon, form, animasi) yang menandai `"use client"`.

**ADR-002 — Supabase sebagai backend terpadu.**
*Konteks:* jendela 2 minggu, butuh Postgres relasional (ledger potong setoran), RLS, unggah
berkas, dan realtime untuk Phase 2. Tim kecil.
*Alternatif:* (a) Neon + Drizzle + Auth.js — kontrol lebih besar dan portabilitas maksimal,
tetapi penulisan lebih banyak (auth, sesi, middleware, penyimpanan); (b) Firebase — sudah dikenal
tim, tetapi Firestore lemah untuk agregasi saldo dan transaksi multi-dokumen; (c) Supabase.
*Keputusan:* (c).
*Konsekuensi negatif yang diterima:* ketergantungan pada satu vendor (lock-in sedang), RLS
menjadi satu-satunya perimeter keamanan sehingga wajib diuji, dan proyek gratis dapat dijeda
karena tidak aktif. Mitigasi: seluruh akses data lewat `lib/data/*`; tipe digenerate; skema
adalah Postgres standar sehingga pindah ke Neon/RDS = menukar adaptor. **Catatan skala:** pada
anggaran kecil, penyimpanan foto produk/kandang di Storage gratis akan menjadi biaya pertama yang
naik — Phase 2 memindahkan aset ke penyimpanan objek eksternal tanpa mengubah skema.

**ADR-003 — Skema Postgres ternormalisasi dengan ledger append-only.**
*Konteks:* potong setoran susu adalah sistem keuangan; kesalahan saldo berarti konflik dengan KUD
dan peternak.
*Alternatif:* (a) saldo disimpan sebagai kolom dan di-`UPDATE`; (b) tabel event/dokumen tanpa
constraint; (c) ledger append-only + saldo dihitung.
*Keputusan:* (c).
*Konsekuensi:* lebih banyak SQL manual, kebutuhan materialized view saat volume naik, dan
koreksi wajib berupa baris pembalik (tidak bisa "hapus dan tulis ulang").

**ADR-004 — Konten edukasi sebagai MDX di repositori.**
*Konteks:* 4 artikel, 1 penulis, butuh sitasi dan tinjauan ahli (`reviewedBy`).
*Alternatif:* CMS terkelola (Sanity), tabel artikel di basis data, MDX.
*Keputusan:* MDX dengan front matter tervalidasi; build gagal bila artikel berklaim nutrisi
tanpa `reviewedBy`.
*Konsekuensi:* perubahan konten = commit (butuh akses repo). Bila tim non-teknis bertambah di
Phase 3, migrasi ke CMS menjadi pekerjaan tersendiri — disengaja agar tidak membayar biayanya
sekarang.

**ADR-005 — Token desain sebagai sumber tunggal.**
*Konteks:* konsistensi visual antara brosur pitching, situs, dan (nantinya) dasbor.
*Keputusan:* YAML di `DESIGN.md` adalah normatif; `theme.css` Tailwind v4 **dihasilkan** dari
file ini, bukan ditulis tangan. CI gagal bila hasil ekspor berbeda dari yang ada di repo.
*Konsekuensi:* setiap perubahan warna harus lewat `DESIGN.md` → ekspor → commit; menambal kelas
Tailwind secara ad hoc dilarang.

**ADR-006 — Auth ditunda sampai Phase 2.**
*Konteks:* demo pitching butuh satu jalur konversi yang bisa dibuktikan, bukan sistem akun.
*Keputusan:* Phase 1 hanya lead capture; tidak ada halaman login (mode demo peternak/KUD
menunggu Phase 2).
*Konsekuensi:* tidak ada login di demo; sisi positifnya tidak ada permukaan autentikasi yang
dapat diserang maupun membocorkan data.

**ADR-007 — Idempotensi dan pembatasan laju sejak Phase 1.**
*Konteks:* form sampel akan dibanjiri setelah kampanye TikTok; jaringan lapangan sering putus
sehingga peternak menekan kirim dua kali.
*Keputusan:* setiap pengiriman membawa `idempotencyKey`; Server Action menegakkan batas 5
pengiriman/10 menit per IP + honeypot; `submit_sample_lead` idempoten di basis data.
*Konsekuensi:* debounce dan penanganan galat 429 harus ditulis sejak awal; tidak ada penyimpanan
IP jangka panjang (hanya hitungan sementara di memori edge).

**ADR-008 — Analitik funnel milik sendiri, bukan pihak ketiga.**
*Konteks:* butuh bukti funnel (`view → cta_click → form_submit`) untuk pitch tanpa membebani
halaman atau melanggar minimalisasi data.
*Keputusan:* event funnel dikirim ke `lead_event` (pihak pertama) + Vercel Analytics untuk
kunjungan dan Web Vitals. Tanpa Google Analytics, tanpa piksel pihak ketiga.
*Konsekuensi:* laporan lebih dangkal (tidak ada demografi/atribusi lintas perangkat); jumlah event
yang tersimpan bertambah sehingga partisi tabel dijadwalkan di Phase 3.

**ADR-009 — Deployment Vercel dengan promosi dari `main`.**
*Konteks:* satu basis kode, satu lingkungan produksi, demo pitching harus dapat diulang.
*Keputusan:* Preview Deployment per PR (dipakai sebagai lingkungan latihan demo), produksi dari
`main`, variabel lingkungan per lingkungan, kunci Supabase anon sebagai satu-satunya yang
berprefiks `NEXT_PUBLIC_`.
*Konsekuensi:* biaya saat trafik kampanye naik (Hobby → Pro direncanakan sebelum kampanye);
pembatasan cabang basis data Supabase adalah fitur paket berbayar — Phase 1 memakai satu proyek
dengan seed terpisah.

---

## Struktur Proyek

```text
recobid-web/
├─ app/
│  ├─ layout.tsx                  # font, tema, metadata dasar, JSON-LD Organization
│  ├─ page.tsx                    # S1 beranda (statis + revalidasi tag)
│  ├─ (marketing)/
│  │  ├─ produk/page.tsx          # S2
│  │  ├─ dampak/page.tsx          # S3
│  │  ├─ mitra/page.tsx           # S5
│  │  ├─ kontak/page.tsx          # S7
│  │  └─ privasi/page.tsx         # S7
│  ├─ edukasi/
│  │  ├─ page.tsx                 # daftar artikel
│  │  └─ [slug]/page.tsx          # artikel MDX + metadata OG
│  ├─ api/
│  │  ├─ lead/route.ts            # fallback bila JS mati (progressive enhancement)
│  │  └─ health/route.ts          # cek siap pakai untuk pemantauan
│  ├─ actions/
│  │  └─ submit-lead.ts           # Server Action: validasi Zod, rate limit, RPC Supabase
│  ├─ sitemap.ts
│  ├─ robots.ts
│  └─ opengraph-image.tsx
├─ components/
│  ├─ ui/                         # button, badge, input, card, alert (CVA + cn)
│  ├─ sections/                   # hero, problem, solution, product, cost-compare,
│  │                              # impact, partnership, validation, education, faq, cta, footer
│  └─ blocks/                     # site-header, composition-bar, metric-panel, kud-map, sample-form
├─ content/edukasi/*.mdx          # artikel + front matter tervalidasi
├─ lib/
│  ├─ data/                       # products.ts, impact.ts, kud.ts, leads.ts  (satu pintu ke Supabase)
│  ├─ supabase/                   # client.ts (browser), server.ts (RSC/Action), types.ts (digenerate)
│  ├─ schema/                     # zod: lead.ts, content.ts
│  ├─ analytics.ts                # track() -> lead_event + Vercel Analytics
│  ├─ env.ts                      # validasi variabel lingkungan saat boot (gagal cepat)
│  └─ utils/cn.ts
├─ styles/theme.css               # DIHASILKAN dari DESIGN.md (jangan diedit tangan)
├─ supabase/migrations/*.sql      # sumber kebenaran skema (SCHEMA.md)
├─ scripts/check-no-emoji.mjs
├─ tests/{unit,e2e}/
└─ .github/workflows/ci.yml
```

Aturan lapisan: `app/*` boleh mengimpor `components/*` dan `lib/*`; `components/*` boleh
mengimpor `lib/utils` dan `lib/analytics`; **hanya `lib/data/*` yang boleh memanggil Supabase.**
Komponen tidak pernah menulis kueri; ini yang membuat penggantian basis data di masa depan
menjadi pekerjaan satu modul.

---

## Data Flow

| Alur | Jalur | Catatan |
|---|---|---|
| Baca konten (beranda, produk, dampak) | RSC → `lib/data/*` → Supabase (dengan tag cache `product`/`impact`) → HTML statis + revalidasi 3600 s | Tanpa JavaScript klien untuk konten; data dampak di-prerender sehingga demo tetap jalan bila jaringan venue buruk |
| Baca artikel | `content/edukasi/*.mdx` dibaca saat build | Tidak menyentuh basis data |
| Kirim form sampel | Komponen klien (Zod klien) → Server Action → Zod server → rate limit → `submit_sample_lead` → respons + notifikasi | Balasan idempoten: pengiriman kedua mengembalikan sukses dengan `created: false` |
| Event funnel | `lib/analytics.ts` → `insert lead_event` (anon, INSERT-saja) | `session_id` anonim di `sessionStorage`; tanpa PII |
| Perubahan konten dampak | Operator memperbarui `impact_metric` → revalidasi tag `impact` | Tanpa deploy ulang |

Penanganan galat: setiap panggilan keluar (Supabase, notifikasi, Sentry) memakai `AbortSignal`
dengan batas waktu 5 detik. Bila Supabase gagal saat kirim form, pengguna menerima pesan yang
dapat ditindaklanjuti beserta tautan WhatsApp — form tidak pernah gagal dalam diam.

---

## Struktur Halaman Beranda (pemetaan PRD → komponen → token)

| # | Bagian (PRD §7) | Komponen | Permukaan | Catatan visual |
|---|---|---|---|---|
| 1 | Hero | `sections/hero` | `surface` | `display-xl`, dua tombol (`primary` + `accent`), foto tongkol jagung dengan *scrim* |
| 2 | Masalah | `sections/problem` | `surface` | 3 `card` `flat`, angka 60–65% dan 3,45–4,6 juta ton sebagai `metric-md` |
| 3 | Solusi | `sections/solution` | `cream` | 3 pilar dengan ikon 32 px (`recycle`, `flask-conical`, `wallet`) |
| 4 | Produk & formulasi | `sections/product` + `blocks/composition-bar` | `cream` | Bilah proporsi 55/38/7 ternormalisasi, `card-cream` |
| 5 | Perbandingan biaya | `sections/cost-compare` | `surface` | Tabel dua kolom + kolom asumsi `caption`; nominal `mono-data` |
| 6 | Dampak | `sections/impact` + `blocks/metric-panel` | `ink-deep` | `stat-panel` dengan `metric-lg` `accent`; setiap angka punya `caption` sumber |
| 7 | Kemitraan KUD | `sections/partnership` + `blocks/kud-map` | `paper` | Diagram 4 langkah alur potong setoran; lencana `badge-partner` |
| 8 | Validasi | `sections/validation` | `paper` | Status NPP dengan `alert-warn` bila masih diproses; daftar sitasi `mono-data` |
| 9 | Edukasi | `sections/education` | `surface` | 4 `card` artikel |
| 10 | FAQ | `sections/faq` | `surface` | Akordeon (`"use client"`), target sentuh 44 px |
| 11 | CTA + form sampel | `sections/cta` + `blocks/sample-form` | `cream` | 4 kolom wajib; galat `amber-ink`; sukses menampilkan langkah berikutnya |
| 12 | Footer | `sections/footer` | `ink-deep` | Status NPP, kontak aktif, tautan legal |

---

## Motion

Aturan: animasi harus menjelaskan, bukan menghibur. Total durasi animasi satu halaman < 1,2 s.

| Kejadian | Gerakan | Durasi | Token |
|---|---|---:|---|
| Bagian masuk viewport | `opacity 0→1`, `y 12px→0` | 320 ms | `easeOut` |
| Angka metrik terlihat | Hitung naik dari 0 ke nilai | 700 ms, sekali saja | `linear` |
| Klik tombol | Skala 1 → 0,98 → 1 | 120 ms | `easeOut` |
| Akordeon FAQ | Tinggi otomatis + rotasi ikon 180° | 220 ms | `easeInOut` |
| Bilah CTA lengket muncul | `y 64px→0` | 200 ms | `easeOut` |

Dilarang: animasi berulang tanpa akhir, paralaks saat gulir di perangkat mobile, animasi yang
menunda LCP. `prefers-reduced-motion: reduce` mematikan seluruh transformasi dan animasi hitung
naik (nilai langsung tampil).

---

## Anggaran Performa

| Metrik | Anggaran | Batas keras |
|---|---:|---:|
| LCP (mobile 4G) | ≤ 1,6 s | 2,0 s |
| INP | ≤ 150 ms | 200 ms |
| CLS | ≤ 0,05 | 0,1 |
| JavaScript awal beranda (gzip) | ≤ 140 KB | 180 KB |
| Berat halaman penuh beranda (compressed) | ≤ 900 KB | 1,5 MB |
| Font yang diunduh | 3 keluarga, 6 berkas (subset latin) | — |

Cara mencapai: konten dirender server, hanya 3 pulau klien (akordeon, form, bilah lengket),
gambar `next/image` dengan `sizes` eksplisit dan prioritas hanya untuk gambar hero, font
lewat `next/font` tanpa permintaan jaringan pihak ketiga, tanpa pustaka animasi di jalur kritis
(`motion` dimuat dinamis setelah interaksi atau bagian terlihat).

---

## Security & Privacy

| Area | Ketetapan |
|---|---|
| Header keamanan | `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`; `X-Content-Type-Options: nosniff`; `Referrer-Policy: strict-origin-when-cross-origin`; `Permissions-Policy` menolak kamera, mikrofon, geolokasi; CSP ketat dengan daftar izin eksplisit (self, `*.supabase.co`, `*.sentry.io`, `va.vercel-scripts.com`) |
| Kunci rahasia | Hanya `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` yang boleh berada di klien; `SUPABASE_SERVICE_ROLE_KEY` hanya di lingkungan server Vercel (encrypted) dan tidak pernah diimpor berkas klien |
| Validasi | Skema Zod tunggal dipakai ulang di klien, Server Action, dan uji; constraint Postgres sebagai gerbang akhir |
| Pembatasan laju | 5 pengiriman/10 menit per IP; honeypot bernama tidak mencurigakan; respons sukses idempoten untuk duplikat |
| PII | Hanya nama, WhatsApp, jumlah ternak, wilayah. Tidak dicatat ke Sentry (`beforeSend` menyaring), tidak dikirim ke analitik, tidak masuk URL |
| Data pribadi di log | Structured log JSON memuat `request_id`, `path`, `status`, `duration_ms`, `lead_created` — tanpa nama/nomor |
| Kepatuhan | UU PDP No. 27/2022: dasar pemrosesan = persetujuan (kotak centang tidak dicentang otomatis), retensi 24 bulan, permintaan hapus lewat kanal kontak resmi |
| Pemantauan ketergantungan | `npm audit` + Dependabot mingguan; penambahan dependensi baru wajib melewati tinjauan (bundel + permukaan serang) |

---

## Observability & Operasional

- **Sentry:** menangkap galat Server Action, `onRequestError`, dan batas galat klien; `traceSampleRate` 0,1 di produksi; PII disaring; rilis ditandai dengan SHA commit.
- **Vercel Analytics & Speed Insights:** trafik, halaman populer, Web Vitals per rute; dasar untuk metrik di `PRD.md` §3.2.
- **`/api/health`:** memeriksa konektivitas Supabase dengan batas 2 detik; dipakai oleh pemeriksa uptime eksternal (sebelum jadwal kelas, bukan setiap menit).
- **Log terstruktur:** satu baris JSON per permintaan Server Action; tanpa string gabungan.
- **Uji pasca-deploy:** `curl -fsS <domain>/sitemap.xml`, `/api/health`, satu pengiriman form nyata dengan `idempotencyKey` tetap (dijalankan sebelum demo dan dihapus setelahnya).

---

## Deployment

| Aspek | Ketetapan |
|---|---|
| Alur | `git push` cabang → Preview Deploy (URL unik) → tinjauan visual + Lighthouse → merge ke `main` → Production Deploy |
| Promosi | Produksi hanya dari `main`; tag rilis `v1.0.0-pitch` menyertai demo |
| Variabel lingkungan | Divalidasi saat boot oleh `lib/env.ts`; salah/absen = gagal cepat saat build, bukan saat jam pitching |
| Basis data | Migrasi dijalankan lewat `supabase db push --linked` sebelum deploy kode yang membutuhkannya; urutan expand-first |
| Rollback | `vercel rollback` ke deployment sebelumnya + migrasi bersifat menambah sehingga tidak perlu dibalik untuk pengembalian kode |
| Praktik pra-demo | Seed ulang (`supabase/seed/pitch.sql`), cek `/api/health`, uji form dengan idempotency tetap, unduh aset hero secara lokal (mode offline) |
| Biaya | Hobby selama pitching; rencana naik ke Pro saat kampanye dimulai (batas fungsi + analitik) — dipicu metrik, bukan tanggal |

---

## Kesiapan Phase 2

Pekerjaan yang **sudah** diselesaikan oleh desain ini agar Phase 2 berjalan sebagai penambahan,
bukan penulisan ulang:

1. **Skema lengkap** untuk akun, peternakan, pesanan, ledger, referral, dan produksi susu
   (`SCHEMA.md` Bagian 5) — termasuk `v_farm_balance` dan strategi materialized view.
2. **Pintu data tunggal** (`lib/data/*`) sehingga penambahan peran pengguna tidak menyentuh
   komponen.
3. **Peran RLS** (`app_role()`) sudah didefinisikan untuk `kud_officer`, `staff`, `admin`;
   Phase 2 hanya menambah policy, bukan merombak model keamanan.
4. **Idempotensi** sudah menjadi kebiasaan penulisan kode (form hari ini, order dan pembayaran
   besok).
5. **Token desain** sudah mencakup kebutuhan dasbor (panel gelap, tabel, lencana status) sehingga
   halaman portal peternak dan KUD tidak akan terlihat seperti produk berbeda.
6. **Tabel `lead` tidak diubah** saat menjadi `farm`: konversi memakai tabel penghubung.

Yang **belum** disiapkan dan karenanya menjadi pekerjaan Phase 2: autentikasi (Supabase Auth
dengan alur server-side `getUser()`), otorisasi berbasis KUD, cabang basis data per PR, notifikasi
WhatsApp otomatis, serta pemantauan saldo (alarm bila saldo mendekati batas kredit).

---

## Lampiran — Sumber dan Aturan Tambahan

**Rujukan visual:** `logo.png` (emblem), `nufeed.co.id` (yayasan pakan, blok edukasi),
`locol.company` (spesifikasi dampak berbasis angka besar).

**Aturan turunan yang perlu diingat saat menulis kode UI:**

1. Emoji dilarang; ikon wajib `lucide-react` (`strokeWidth` 1,75). Ditegakkan oleh
   `scripts/check-no-emoji.mjs` di CI.
2. Setiap angka di UI wajib punya `caption-note` (nilai, satuan, periode, sumber).
3. `theme.css` dihasilkan dari `DESIGN.md`; menambal warna langsung di kelas Tailwind dilarang.
4. Komponen tidak boleh memanggil Supabase; hanya `lib/data/*`.
5. Semua teks UI melewati lapisan konten (`content/` dan objek salinan), bukan string literal di
   dalam JSX — persiapan i18n Phase 3.
6. Waktu ditampilkan dalam WIB (UTC+7) dengan label zona; penyimpanan tetap UTC.
7. Uji di 360 px dan jaringan lambat sebelum menandai tugas selesai.
