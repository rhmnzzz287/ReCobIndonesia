/**
 * Salinan beranda (Bahasa Indonesia) — satu-satunya sumber teks UI.
 *
 * Naskah ditranskripsikan dari Docs/stitch/code.html, disesuaikan dengan aturan kepatuhan
 * Docs/PRD.md Bagian 8. Tidak boleh ada teks tampilan di JSX (spec ADR-015).
 *
 * Aturan yang mengikat (PRD Bagian 8):
 *  1. Setiap angka melekat pada sumbernya: nilai metrik dan klaim disertai caption berisi nilai,
 *     satuan, periode, dan sumber.
 *  2. Klaim kenaikan produksi susu wajib berlabel "klaim berbasis kajian" dan "validasi lapangan".
 *  3. Status NPP dinyatakan apa adanya; nomor tidak dikarang.
 *  4. Tanpa emoji. Tanpa tanda seru pada caption.
 *  5. Nomor kontak belum final di Phase 1.
 */

export const idCopy = {
  hero: {
    badge: "Status Legalitas: Nomor Pendaftaran Pakan (NPP) Kementerian Pertanian RI dalam proses pendaftaran resmi",
    standardBadge: "SNI 3148-1:2017 Ruminansia",
    eyebrow: "Biokonversi Pakan Ruminansia",
    title: "Pakan Konsentrat Sapi Perah Hemat 11%–20%, Kepastian Pasokan Sepanjang Tahun",
    subtitle:
      "Pelet konsentrat protein tinggi dari limbah bonggol jagung dan ampas tahu terfermentasi. Rp160.000 per karung 50 kg melalui kemitraan KUD penampung susu dengan sistem potong setoran mingguan.",
    ctaPrimary: "Klaim Sampel Gratis 2-3 kg",
    ctaSecondary: "Pelajari Formulasi & Nutrisi",
    priceAnchorLabel: "Harga Jangkar Resmi",
    priceAnchorUnit: "Karung 50 kg",
    priceAnchorValue: "Rp160.000",
    priceCompareLabel: "Rata-rata Konsentrat Lain:",
    priceCompareValue: "Rp180.000 - Rp200.000",
    priceSavingLabel: "Margin Penghematan:",
    priceSavingValue: "Hemat Rp20.000 - Rp40.000",
    priceCaption:
      "Asumsi: Harga loco gudang KUD mitra di sentra susu Jawa Barat & Jawa Tengah per karung netto 50 kg.",
    highlightFormulationLabel: "Formulasi Teruji",
    highlightFormulationValue: "3 Bahan",
    highlightFormulationNote: "Bonggol, tahu, molase",
    highlightPaymentLabel: "Sistem Bayar",
    highlightPaymentValue: "Potong KUD",
    highlightPaymentNote: "Tanpa uang muka",
    imageAlt: "Karung pakan konsentrat ReCob.id 50 kg dan pelet hasil fermentasi bonggol jagung",
  },
  problem: {
    eyebrow: "Dilema Ruminansia Nasional",
    title: "Tantangan Nyata Peternak Sapi Perah Tradisional",
    intro:
      "Berdasarkan kajian lapangan dan telaah literatur sosial-ekonomi peternakan rakyat di sentra produksi susu nasional.",
    items: [
      {
        title: "Beban Biaya Konsentrat Menyerap 60%–65%",
        body: "Struktur pengeluaran pakan komersial mendominasi biaya produksi harian susu, menekan marjin laba bersih peternak anggota koperasi saat harga bahan baku impor merangkak naik.",
        metric: "60%–65%",
        caption:
          "Sumber Data: Hajar (2025), telaah elastisitas biaya ransum terhadap margin susu peternakan rakyat.",
      },
      {
        title: "Kelangkaan & Fluktuasi Pakan di Musim Kemarau",
        body: "Ketersediaan hijauan segar merosot drastis hingga 40% setiap musim kering, memaksa peternak membeli jerami berkualitas rendah dengan harga spekulatif yang memicu asidosis rumen.",
        metric: "40%",
        caption:
          "Sumber Data: Zulaikhah et al. (2026), dinamika defisit biomassa basah ruminansia tropis laktasi.",
      },
      {
        title: "3,45–4,6 Juta Ton Bonggol Terbuang & Dibakar",
        body: "Biomassa tongkol jagung pascapanen menjadi polutan pembakaran terbuka di ladang tanpa nilai tambah ekonomis, menghasilkan emisi karbon dan partikulat asap bagi lingkungan perdesaan.",
        metric: "3,45–4,6 Juta Ton",
        caption: "Sumber Data: BPS RI (2022), Neraca Biomassa Jagung dan Serealia Agrikultur Nasional.",
      },
    ],
  },
  solution: {
    eyebrow: "Inovasi Bioproses Terpadu",
    title: "ReCob.id: Nutrisi dari Limbah Jadi",
    intro:
      "Mengubah biomassa pertanian yang melimpah menjadi pelet konsentrat bernutrisi stabil melalui proses fermentasi terstandar.",
    assurance: "Aman • Stabil • Terukur",
    pillars: [
      {
        title: "Arus Kas Aman",
        body: "Mekanisme pembayaran terintegrasi lewat pemotongan slip rekapitulasi setoran susu mingguan di KUD. Peternak memperoleh pakan tanpa membebani likuiditas kas operasional rumah tangga harian.",
        note: "Skema Nol Rupiah di Awal",
      },
      {
        title: "Nutrisi Terukur & Palatabilitas Tinggi",
        body: "Teknologi inokulasi mikrobial mengurai lignin keras bonggol jagung. Menghasilkan aroma karamel fermentasi molase yang harum sehingga langsung direspons lahap oleh sapi perah sejak transisi awal.",
        note: "Kadar Serat ADF/NDF Terkelola",
      },
      {
        title: "Sirkularitas Berdampak",
        body: "Memutus pembakaran terbuka limbah jagung sekaligus menyerap ampas industri tahu lokal. Menciptakan siklus nilai ekonomi baru bagi gabungan kelompok tani dan menjaga kelestarian hulu DAS.",
        note: "Mitigasi Emisi Metana & Partikulat",
      },
    ],
  },
  product: {
    eyebrow: "Formulasi Terstandar",
    title: "Komposisi Presisi & Spesifikasi Produk",
    intro:
      "Dikembangkan atas integrasi riset biokonversi limbah lignoselulosa untuk ransum komplit ruminansia perah produktif.",
    compositionTitle: "Rasio Proporsi Formulasi Utama",
    compositionCaption: "Total Formula: 100% Terfermentasi",
    compositionReference:
      "Rujukan Ilmiah: Mengacu pada metodologi biokonversi Rumondang et al. (2023) dan evaluasi efektivitas ampas tahu terfermentasi Halawa (2026).",
    specTitle: "Kemasan & Daya Simpan",
    specs: [
      {
        label: "Netto Karung:",
        value: "50 kg karung anyaman PP terlaminasi inner seal kedap udara.",
      },
      {
        label: "Masa Simpan Optimal:",
        value: "Hingga 6 bulan pada gudang pakan terlindung dan berventilasi.",
      },
      {
        label: "Ketahanan Jamur:",
        value: "Kadar air akhir < 12% mencegah pertumbuhan mikotoksin & aflatoksin.",
      },
    ],
    transitionTitle: "Prosedur Transisi Pakan 7 Hari",
    transitionIntro:
      "Wajib diterapkan demi adaptasi populasi mikroba rumen tanpa fluktuasi produksi susu:",
    transitionSteps: [
      { day: "H 1–2", share: "25%", label: "ReCob" },
      { day: "H 3–4", share: "50%", label: "ReCob" },
      { day: "H 5–6", share: "75%", label: "ReCob" },
      { day: "H 7+", share: "100%", label: "Penuh" },
    ],
  },
  costCompare: {
    eyebrow: "Aritmetika Penghematan Nyata",
    title: "Aritmetika Penghematan Transparan",
    intro:
      "Komparasi berbasis data empiris biaya pakan per karung dan simulasi riil beban operasional kandang peternak rakyat.",
    tableHead: {
      criteria: "Parameter Pakan Konsentrat",
      recob: "ReCob.id (Tongkol Jagung)",
      conventional: "Konsentrat Komersial Umum",
      difference: "Selisih Penghematan",
    },
    rows: [
      {
        criteria: "Harga Kemasan Karung 50 kg",
        recob: "Rp160.000",
        conventional: "Rp180.000 – Rp200.000",
        difference: "Hemat Rp20.000 – Rp40.000 (11%–20%)",
      },
      {
        criteria: "Harga Setara per Kilogram",
        recob: "Rp3.200 / kg",
        conventional: "Rp3.600 – Rp4.000 / kg",
        difference: "Hemat Rp400 – Rp800 / kg",
      },
      {
        criteria: "Beban Konsumsi per Ekor (120 kg / Bln)",
        recob: "Rp384.000",
        conventional: "Rp432.000 – Rp480.000",
        difference: "Hemat Rp48.000 – Rp96.000 / bln",
      },
      {
        criteria: "Kelompok Peternak Mandiri (8 Ekor)",
        recob: "Rp3.072.000",
        conventional: "Rp3.456.000 – Rp3.840.000",
        difference: "Hemat Rp384.000 – Rp768.000 / bln",
      },
      {
        criteria: "Skala Kandang Menengah (10 Ekor)",
        recob: "Rp3.840.000",
        conventional: "Rp4.320.000 – Rp4.800.000",
        difference: "Hemat Rp480.000 – Rp960.000 / bln",
      },
    ],
    assumptionTitle: "Asumsi Simulasi",
    assumptions: [
      "Rata-rata asupan konsentrat 4 kg per ekor laktasi per hari (120 kg/ekor/bulan).",
      "Periode uji 30 hari kalender.",
      "Harga loco pos penampung susu KUD di Pulau Jawa.",
    ],
    closing: "STATUS: KALKULASI RESMI",
  },
  impact: {
    eyebrow: "Ilustrasi Berbasis Asumsi (Kajian Rujukan Ilmiah)",
    title: "Metrik Dampak & Skala Misi Berkelanjutan",
    intro:
      "Target jangka menengah pemanfaatan residu pertanian sebagai sumber pakan bernilai gizi tinggi bagi peternakan rakyat.",
    demoBadge: "Data ilustrasi, bukan capaian terverifikasi",
    withheldTitle: "Metrik yang ditahan",
  },
  partnership: {
    eyebrow: "Distribusi Terintegrasi",
    title: "Jalur Distribusi & Skema Potong Setoran Susu",
    intro:
      "Mekanisme kemitraan mutualisme bersama Koperasi Unit Desa penampung susu perah tanpa risiko likuiditas peternak.",
    steps: [
      {
        title: "Registrasi Peternak",
        body: "Verifikasi identitas nomor anggota aktif KUD dan kuota volume susu harian yang disetorkan ke tempat penampungan.",
      },
      {
        title: "Pengiriman Karung",
        body: "Drop-point logistik langsung ke titik Pos Penampungan Susu (PPS) terdekat saat jadwal peternak menyetor susu pagi.",
      },
      {
        title: "Potong Setoran Susu",
        body: "Pemotongan tagihan pakan secara otomatis pada slip pembayaran mingguan tanpa perlu menyiapkan uang kas tunai di awal.",
      },
      {
        title: "Pendampingan Rumen",
        body: "Monitoring mingguan oleh tim lapangan ReCob.id bersama penyuluh KUD untuk mengukur berat jenis susu dan kesehatan feses.",
      },
    ],
    kudTitle: "Wilayah Fokus Fase Awal Kemitraan",
    kudSubtitle: "Sentra Sapi Perah Dataran Tinggi Jawa",
    kudNote: "Kesiapan logistik terverifikasi di Jawa Barat, Jawa Tengah, dan Jawa Timur",
    kudNames: [
      "KPBS Pangalengan (Bandung)",
      "KUD Mojosongo (Boyolali)",
      "KUD Cepogo (Boyolali)",
      "KUD Setia Kawan (Pasuruan)",
    ],
  },
  validation: {
    eyebrow: "Integritas Metodologi",
    title: "Kendali Mutu & Transparansi QC",
    intro:
      "ReCob.id berkomitmen mempublikasikan setiap batch produksi pakan secara berkala demi menjamin keamanan biologis dan keandalan nutrisi ternak perah.",
    qcItems: [
      {
        title: "Uji Kadar Air Harian",
        metric: "Batas Aman < 12% Moisture",
        body: "Pengukuran moisture content pelet harian secara berulang untuk menjamin daya tahan penyimpanan hingga 6 bulan dan mencegah perkembangbiakan kapang.",
        note: "Bebas Risiko Jamur Simpan",
      },
      {
        title: "Uji Organoleptik Aroma Molase",
        metric: "100% Bebas Bau Tengik / Amonia",
        body: "Pemeriksaan sensori aroma manis karamel khas tetes tebu fermentasi guna memastikan tingkat palatabilitas optimal saat pakan dikonsumsi sapi perah.",
        note: "Tingkat Palatabilitas Teruji",
      },
      {
        title: "Pendampingan Adaptasi Rumen 7 Hari",
        metric: "Protokol Transisi Terstandarisasi",
        body: "Metode pergantian ransum bertahap dengan pendampingan teknis di kandang untuk mencegah gangguan pencernaan dan menjaga kestabilan debit susu.",
        note: "Tanpa Penurunan Produksi Susu",
      },
    ],
    citationTitle: "Rujukan & Standar",
    citations: [
      "SNI 3148-1:2017 Ruminansia — standar pakan konsentrat sapi perah.",
      "BPS RI (2022), Neraca Biomassa Jagung dan Serealia Agrikultur Nasional.",
      "Hajar (2025), telaah elastisitas biaya ransum terhadap margin susu peternakan rakyat.",
      "Zulaikhah et al. (2026), dinamika defisit biomassa basah ruminansia tropis laktasi.",
      "Rumondang et al. (2023), metodologi biokonversi limbah lignoselulosa.",
      "Halawa (2026), evaluasi efektivitas ampas tahu terfermentasi.",
    ],
    nppLabel: "Status NPP Kementan RI",
    nppStatus:
      "Dalam proses pendaftaran resmi dengan pengujian mutu berkala di laboratorium uji pakan ruminansia terakreditasi nasional.",
    claimNotice:
      "Klaim peningkatan produksi susu 1–2 liter per ekor per hari adalah klaim berbasis kajian (Rumondang, 2023), bukan capaian terbukti, dan masih menunggu validasi lapangan multi-kandang.",
  },
  education: {
    eyebrow: "Praktik Kandang Higienis",
    title: "Edukasi Manajemen Ruminansia",
    intro:
      "Panduan teknis bagi anggota KUD untuk memaksimalkan efisiensi ransum dan menjaga kesehatan ambing susu.",
    ctaLabel: "Lihat Seluruh Modul",
    items: [
      {
        title: "Panduan 7 Hari Uji Palatabilitas",
        body: "Langkah bertahap mencampur konsentrat baru dengan pakan lama agar saliva dan mikroba rumen tidak terkejut.",
        action: "Baca Tata Cara Transisi",
      },
      {
        title: "Menghitung HPP Pakan Mandiri",
        body: "Formula kalkulasi biaya riil pakan per liter susu yang dihasilkan, memisahkan biaya hijauan dan konsentrat harian.",
        action: "Unduh Template Hitung",
      },
      {
        title: "Pakan di Musim Kemarau",
        body: "Strategi menjaga bobot kering ransum ketika rumput gajah menyusut drastis tanpa menurunkan berat jenis susu.",
        action: "Strategi Defisit Hijauan",
      },
      {
        title: "Penyimpanan Bebas Aflatoksin",
        body: "Standar tata letak gudang pakan menggunakan palet kayu berjarak 15 cm dari lantai semen agar terhindar dari jamur.",
        action: "Protokol Gudang Kering",
      },
    ],
  },
  faq: {
    eyebrow: "Pertanyaan Peternak",
    title: "Tanya Jawab Seputar ReCob.id",
    intro:
      "Jawaban komprehensif atas aspek mutu pakan, skema pembayaran KUD, dan adaptasi sapi perah di kandang.",
    items: [
      {
        question: "Bagaimana jaminan bebas racun aflatoksin dan kapang?",
        answer:
          "ReCob.id menerapkan proses dehidrasi terstandar dengan kadar air akhir konsisten di bawah 12%. Selain itu, kemasan karung laminasi kedap udara mencegah kondensasi kelembapan selama transit gudang, memastikan total aflatoksin di bawah ambang batas ketat SNI (< 20 ppb).",
      },
      {
        question: "Apakah sapi akan mengalami stres pakan atau diare saat transisi?",
        answer:
          "Tidak, selama peternak mematuhi Prosedur Transisi 7 Hari yang disyaratkan. Fermentasi mikroba pendegradasi serat telah memecah serat kasar menjadi bentuk yang mudah dicerna, didukung aroma molase harum yang merangsang sekresi saliva sapi perah.",
      },
      {
        question: "Bagaimana status legalitas dan izin edar NPP Kementan?",
        answer:
          "Saat ini Nomor Pendaftaran Pakan (NPP) Kementerian Pertanian Republik Indonesia sedang dalam proses pendaftaran resmi dengan pengujian mutu berkala di laboratorium uji pakan ruminansia terakreditasi nasional.",
      },
      {
        question: "Bagaimana mekanisme potong setoran susu di KUD bekerja?",
        answer:
          "Peternak cukup menunjukkan kartu anggota KUD saat mengambil karung di pos penampungan. Tagihan pakan akan tercatat pada sistem administrasi koperasi dan otomatis dipotong dari slip pembayaran susu mingguan atau 10 harian tanpa bunga.",
      },
      {
        question: "Berapa batas sampel gratis yang dapat diklaim peternak?",
        answer:
          "Setiap peternak yang memiliki minimal 2 ekor sapi perah produktif dan terdaftar sebagai anggota koperasi berhak mendapatkan 1 paket sampel gratis 2–3 kg untuk uji respons palatabilitas selama 2–3 hari pertama.",
      },
      {
        question: "Apakah ReCob.id dapat menggantikan hijauan segar seluruhnya?",
        answer:
          "Tidak. ReCob.id berfungsi sebagai konsentrat penguat sumber energi dan protein fermentasi. Sapi ruminansia tetap membutuhkan hijauan serat panjang (seperti rumput gajah atau tebon) minimal 10% dari bobot badan untuk memelihara fungsi fisiologis rumen.",
      },
    ],
  },
  cta: {
    eyebrow: "Uji Mutu di Kandang Sendiri",
    title: "Klaim Sampel Gratis 2–3 kg",
    intro:
      "Buktikan sendiri aroma harum molase dan tingginya palatabilitas konsentrat ReCob.id langsung pada sapi perah Anda sebelum memesan skala karung.",
    benefits: [
      "Gratis tanpa biaya pakan untuk peternak anggota KUD aktif",
      "Disertai lembar panduan takaran transisi hari ke-1 hingga ke-7",
      "Konsultasi ransum via WhatsApp bersama formulator nutrisi ternak",
    ],
    whatsappHelp: "Butuh bantuan pendaftaran? Hubungi Admin WhatsApp Kemitraan KUD",
    form: {
      title: "Formulir Permintaan Sampel Uji Coba",
      intro: "Lengkapi data kandang Anda untuk verifikasi pengiriman sampel gratis 2–3 kg.",
      nameLabel: "Nama Lengkap Peternak",
      namePlaceholder: "Nama sesuai kartu anggota KUD",
      phoneLabel: "Nomor WhatsApp Aktif",
      phoneHint: "Format: 08xxxxxxxxxx atau +628xxxxxxxxxx",
      phonePlaceholder: "081234567890",
      cattleLabel: "Jumlah Ekor Sapi Perah Produktif",
      cattlePlaceholder: "Contoh: 8",
      regionLabel: "Wilayah Operasi",
      regionPlaceholder: "Pilih wilayah",
      kudLabel: "Nama KUD Terdekat",
      kudOptional: "opsional",
      kudPlaceholder: "Pilih KUD Domisili",
      kudOther: "Lainnya / Non-KUD Terdaftar",
      messageLabel: "Catatan untuk Tim Lapangan",
      messagePlaceholder: "Kondisi kandang, jadwal penyerahan, atau pertanyaan ransum",
      consentLabel:
        "Saya menyetujui data ini digunakan untuk verifikasi keanggotaan KUD dan penjadwalan pengiriman sampel.",
      submitLabel: "Kirim Permintaan Sampel Gratis",
      submittingLabel: "Mengirim permintaan",
      honeypotLabel: "Jangan isi kolom ini",
      successTitle: "Permintaan Sampel Berhasil Diterima",
      successBody:
        "Petugas koordinasi lapangan ReCob.id akan menghubungi WhatsApp Anda dalam 1x24 jam kerja untuk jadwal penyerahan sampel di pos penampungan susu terdekat.",
      successNextStep: "Siapkan kartu anggota KUD saat petugas menghubungi.",
      duplicateTitle: "Permintaan Anda Sudah Tercatat",
      duplicateBody:
        "Nomor WhatsApp ini sudah pernah mengirim permintaan sampel. Tim lapangan akan menghubungi Anda pada jadwal penyerahan berikutnya.",
      errorTitle: "Permintaan Belum Terkirim",
      errorBody:
        "Terjadi gangguan saat menyimpan permintaan Anda. Coba beberapa saat lagi atau hubungi admin WhatsApp kemitraan.",
      rateLimitTitle: "Terlalu Banyak Permintaan",
      rateLimitBody:
        "Nomor ini sudah mengirim beberapa permintaan dalam waktu singkat. Tunggu beberapa menit sebelum mencoba lagi.",
      whatsappCta: "Hubungi Admin WhatsApp Kemitraan KUD",
      demoModeTitle: "Mode Demo Aktif",
      demoModeBody:
        "Formulir tidak tersambung ke basis data pada mode ini. Hubungi admin WhatsApp untuk permintaan sampel.",
      errors: {
        nameRequired: "Nama lengkap wajib diisi.",
        nameTooShort: "Nama minimal 2 karakter.",
        phoneRequired: "Nomor WhatsApp wajib diisi.",
        phoneInvalid: "Nomor WhatsApp tidak valid. Contoh: 081234567890.",
        cattleRequired: "Jumlah sapi perah wajib diisi.",
        cattleRange: "Jumlah sapi antara 1 dan 10.000 ekor.",
        regionRequired: "Pilih wilayah operasi.",
        consentRequired: "Persetujuan penggunaan data wajib dicentang.",
        generic: "Data belum dapat diproses. Periksa kembali isian Anda.",
      },
    },
    sticky: {
      ctaLabel: "Klaim Sampel Gratis",
      whatsappLabel: "Tanya via WhatsApp",
    },
  },
  footer: {
    tagline:
      "Pionir inovasi biokonversi limbah tongkol jagung menjadi pakan konsentrat fermentasi ruminansia. Solusi sirkular teruji untuk mendongkrak produksi susu dan profitabilitas peternak mandiri serta Koperasi Unit Desa (KUD).",
    badge: "Ekonomi Sirkular Peternakan Berkelanjutan",
    productTitle: "Produk & Solusi",
    productLinks: [
      "Spesifikasi Karung Pakan 50kg Kedap Udara",
      "Formulasi 3 Bahan: Tongkol Jagung, Molase, Isolat Bakteri",
      "Skema Potong Setoran Susu Anggota KUD",
      "Kalkulator Penghematan Biaya Pakan Harian",
      "Protokol Transisi Adaptasi Rumen Sapi Perah",
    ],
    companyTitle: "Wilayah Kemitraan KUD",
    regions: [
      { name: "KPBS Pangalengan", location: "Kabupaten Bandung, Jawa Barat" },
      { name: "KUD Mojosongo Boyolali", location: "Kawasan Sentra Sapi Perah Jawa Tengah" },
      { name: "KUD Cepogo Boyolali", location: "Lereng Merapi - Boyolali" },
      { name: "KUD Setia Kawan Pasuruan", location: "Nongkojajar, Jawa Timur" },
    ],
    contactTitle: "Kepatuhan & Legalitas",
    compliance: [
      "Status NPP Kementan RI: Dalam Proses Pendaftaran Resmi Mutu Pakan Nasional",
      "Sentra Produksi: Sentra Agribisnis Biokonversi Jawa Barat & Jawa Tengah",
      "Standar Uji: Bebas Aflatoksin B1/B2/G1/G2 (< 20 ppb)",
    ],
    legalTitle: "Legal",
    legalLinks: [
      "Kebijakan Mutu & Penjaminan Mutu Nutrisi Pakan",
      "Kebijakan Privasi & Data Kemitraan Peternak",
      "Syarat Layanan",
      "Standar Mutu Lab",
      "Kemitraan KUD",
    ],
    contactNotice:
      "Nomor telepon, alamat surel resmi, dan alamat kantor menyusul sebelum rilis publik.",
    address: "Sentra Agribisnis Biokonversi Jawa Barat & Jawa Tengah, Indonesia",
    nppStatus: "NPP Kementan RI: dalam proses pendaftaran",
    copyright: "© 2025 ReCob.id • PT Biomasa Nutrisi Nusantara. Seluruh hak cipta dilindungi undang-undang.",
  },
  nav: {
    home: "Beranda",
    product: "Produk",
    impact: "Dampak",
    partnership: "Kemitraan KUD",
    education: "Edukasi",
    contact: "Kontak",
    sampleCta: "Klaim Sampel Gratis",
  },
  meta: {
    title: "ReCob.id — Pakan Konsentrat Sapi Perah dari Bonggol Jagung Terfermentasi",
    description:
      "Pelet konsentrat sapi perah dari bonggol jagung dan ampas tahu terfermentasi. Rp160.000 per karung 50 kg dengan skema potong setoran susu melalui kemitraan KUD di Jawa Barat, Jawa Tengah, dan Jawa Timur.",
    ogAlt: "Karung pakan konsentrat ReCob.id 50 kg untuk sapi perah",
  },
} as const;

export type Copy = typeof idCopy;
