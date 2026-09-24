/**
 * Salinan beranda (Bahasa Indonesia) — satu-satunya sumber teks UI.
 *
 * Naskah ditranskripsikan dari Docs/stitch/code.html, disesuaikan dengan aturan kepatuhan
 * Docs/PRD.md Bagian 8. Tidak boleh ada teks tampilan di JSX (spec ADR-015).
 *
 * Aturan yang mengikat (PRD Bagian 8):
 *  1. Setiap angka melekat pada sumbernya: nilai metrik dan klaim disertai caption berisi nilai,
 *     satuan, periode, dan sumber. Daftar lengkapnya tetap ada di `validation.citations` dan
 *     dipakai `/llms.txt`.
 *  2. Klaim kenaikan produksi susu wajib berlabel "klaim berbasis kajian" dan "validasi lapangan".
 *  3. Status NPP dinyatakan apa adanya; nomor tidak dikarang.
 *  4. Tanpa emoji. Tanpa tanda seru pada caption.
 *  5. Nomor kontak belum final di Phase 1.
 */

export const idCopy = {
  hero: {
    badge:
      "Status Legalitas: Nomor Pendaftaran Pakan (NPP) Kementerian Pertanian RI dalam proses pendaftaran resmi",
    eyebrow: "Pakan Sapi Perah",
    title:
      "Pakan Konsentrat Sapi Perah Hemat 11%–20%, Pasokan Pasti Sepanjang Tahun",
    subtitle:
      "Pelet pakan sapi perah dari bonggol jagung dan ampas tahu yang difermentasi. Rp160.000 per karung 50 kg lewat kemitraan KUD penampung susu, dibayar dengan potong setoran susu mingguan.",
    statLeadLabel: "Penghematan",
    statLeadValue: "20%",
    statLeadUnit: "lebih hemat per karung 50 kg",
    statLeadCaption:
      "Perbandingan Rp160.000 dengan harga pakan pabrik Rp180.000–Rp200.000 di sentra susu Jawa.",
    priceAnchorLabel: "Harga Resmi",
    priceAnchorUnit: "Karung 50 kg",
    priceAnchorValue: "Rp160.000",
    priceCompareLabel: "Harga Pakan Pabrik:",
    priceCompareValue: "Rp180.000 - Rp200.000",
    priceSavingLabel: "Penghematan:",
    priceSavingValue: "Hemat Rp20.000 - Rp40.000",
    priceCaption:
      "Angka ini dihitung dari harga di gudang KUD mitra di sentra susu Jawa Barat dan Jawa Tengah, per karung isi 50 kg.",
    highlightFormulationLabel: "Bahan",
    highlightFormulationValue: "3 Bahan",
    highlightFormulationNote: "Bonggol, tahu, tetes tebu",
  },
  solution: {
    eyebrow: "Solusi ReCob.id",
    title: "Limbah Jagung Jadi Pakan Bernutrisi",
    intro:
      "Bonggol jagung yang biasanya dibuang kami olah jadi pelet pakan dengan proses fermentasi yang terukur.",
    assurance: "Aman • Stabil • Terukur",
    pillars: [
      {
        title: "Tidak Perlu Uang di Awal",
        body: "Pembayaran pakan dipotong langsung dari slip setoran susu mingguan di KUD. Peternak tidak perlu menyiapkan uang tunai untuk membeli pakan.",
        note: "Bayar Lewat Setoran Susu",
      },
      {
        title: "Disukai Sapi, Nutrisi Terukur",
        body: "Proses fermentasi memecah serat keras bonggol jagung dan menghasilkan aroma manis tetes tebu, sehingga sapi langsung mau makan sejak hari pertama.",
        note: "Kadar Serat ADF/NDF Terkelola",
      },
      {
        title: "Mengurangi Limbah dan Asap",
        body: "Bonggol jagung yang biasanya dibakar kini jadi pakan, dan ampas tahu dari pabrik lokal ikut terpakai. Limbah jadi bernilai.",
        note: "Mengurangi Asap Pembakaran",
      },
    ],
  },
  product: {
    eyebrow: "Bahan & Kemasan",
    compositionTitle: "Tiga Bahan Utama",
    compositionCaption: "Total Formula: 100% Terfermentasi",
    compositionReference:
      "Rujukan Ilmiah: Mengacu pada metodologi biokonversi Rumondang et al. (2023) dan evaluasi efektivitas ampas tahu terfermentasi Halawa (2026).",
    photoAlt:
      "Karung pakan ReCob.id isi 50 kg berisi pelet konsentrat sapi perah.",
    specs: [
      {
        label: "Isi Karung:",
        value:
          "50 kg dalam karung anyaman plastik berlapis kedap udara.",
      },
      {
        label: "Masa Simpan:",
        value: "Sampai 6 bulan di gudang pakan yang terlindung dan berventilasi.",
      },
      {
        label: "Tahan Jamur:",
        value:
          "Kadar air akhir di bawah 12%, sehingga tidak ditumbuhi jamur beracun.",
      },
    ],
    transitionTitle: "Cara Ganti Pakan (7 Hari)",
    transitionIntro:
      "Ganti pakan bertahap supaya mikroba rumen sapi terbiasa dulu:",
    transitionSteps: [
      { day: "H 1–2", share: "25%", label: "ReCob" },
      { day: "H 3–4", share: "50%", label: "ReCob" },
      { day: "H 5–6", share: "75%", label: "ReCob" },
      { day: "H 7+", share: "100%", label: "Penuh" },
    ],
  },
  productStory: {
    heroBadge: "Pakan Pelet Sapi Perah",
    heroTitle: "Tiga Bahan Lokal, Satu Karung Pelet Bernutrisi",
    heroLead:
      "Bonggol jagung dan ampas tahu difermentasi, dicetak jadi pelet, lalu dikirim ke pos penampungan susu terdekat.",
    heroCaption:
      "Satu karung 50 kg, satu harga tetap, dibayar dengan potong setoran susu mingguan.",
    heroScrollLabel: "Turun untuk melihat bahan",
    /*
     * Nama berkas dan teks alternatif sengaja netral. Dua foto ini berasal dari `Docs/sapi/5.svg`
     * dan `Docs/sapi/6.svg`, dan isinya belum diverifikasi pemilik produk; menulis "karung 50 kg"
     * di alt akan mengarang keterangan bagi pembaca layar bila gambarnya ternyata hal lain.
     */
    heroPhotoAlt: "Produk ReCob.id",
    usagePhotoAlt: "Produk ReCob.id dalam penyimpanan gudang",
    figuresTitle: "Produk dalam Angka",
    figuresCaption:
      "Empat angka ini adalah spesifikasi kemasan yang dirinci pada bagian cara pakai, bukan klaim hasil.",
    figures: [
      { value: 3, label: "Bahan utama" },
      { value: 50, suffix: " kg", label: "Isi satu karung" },
      { value: 6, suffix: " bulan", label: "Daya simpan gudang" },
      { value: 12, prefix: "< ", suffix: "%", label: "Batas kadar air" },
    ],
    marqueeTitle: "Alur Singkat",
    marquee: [
      "Bonggol jagung dikumpulkan dari petani sekitar",
      "Difermentasi bersama ampas tahu",
      "Dicetak jadi pelet dan dikeringkan",
      "Dikemas dalam karung 50 kg",
      "Diantar ke pos penampungan susu KUD",
      "Tagihan dipotong dari slip susu mingguan",
    ],
    ingredientsTitle: "Bahan dan Fungsinya",
    ingredientsIntro:
      "Tiga bahan, tiga peran. Pilih satu bahan untuk melihat fungsinya di dalam ransum.",
    ingredientSelectLabel: "Pilih bahan",
    ingredientShareLabel: "Porsi dalam formula:",
    usageTitle: "Cara Memberi ke Sapi",
    usageIntro: "Lima langkah, dari membuka karung sampai menakar untuk satu ekor.",
    usageSteps: [
      {
        title: "Buka Karung di Tempat Kering",
        body: "Simpan karung di gudang pakan yang terlindung dan berventilasi. Tutup rapat kembali setelah dipakai.",
      },
      {
        title: "Takaran per Ekor",
        body: "Mulai dari 4 kg per ekor per hari untuk sapi perah produktif. Sesuaikan dengan bobot dan produksi susu.",
      },
      {
        title: "Sediakan Air Minum",
        body: "Pastikan air bersih tersedia terus-menerus. Pelet kering membuat sapi minum lebih banyak.",
      },
      {
        title: "Beri Bersama Hijauan",
        body: "ReCob.id adalah konsentrat penguat, bukan pengganti hijauan. Sapi tetap butuh serat panjang.",
      },
      {
        title: "Amati 3 Hari Pertama",
        body: "Perhatikan nafsu makan dan kotoran sapi. Hentikan dan hubungi tim kami bila ada perubahan yang mengkhawatirkan.",
      },
    ],
    specTitle: "Spesifikasi Kemasan",
    storageTitle: "Cara Menyimpan",
    storageIntro:
      "Pelet menyerap uap air. Empat kebiasaan berikut menjaga mutunya sampai karung terakhir.",
    storageSteps: [
      "Simpan di alas kayu atau palet, jangan langsung di lantai.",
      "Jauhkan dari dinding dan sumber air.",
      "Tutup kembali karung yang sudah dibuka.",
      "Pakai karung yang lebih lama terlebih dahulu.",
    ],
    comparisonTitle: "Perbandingan Sederhana",
    comparisonColumns: ["Yang Dibandingkan", "ReCob.id", "Pakan Pabrik"],
    comparisonRows: [
      { criteria: "Harga karung 50 kg", recob: "Rp160.000", conventional: "Rp180.000 - Rp200.000" },
      { criteria: "Setara per kilogram", recob: "Rp3.200", conventional: "Rp3.600 - Rp4.000" },
      { criteria: "Waktu tunggu stok", recob: "Diantar ke pos susu", conventional: "Antre di toko pakan" },
    ],
    comparisonCaption:
      "Harga pakan pabrik diambil dari titik penampungan susu KUD di Pulau Jawa. Rinciannya ada di halaman kalkulator.",
    comparisonCta: "Buka Kalkulator Penghematan",
    closingTitle: "Siap Diuji di Kandang Anda",
    closingBody:
      "Ajukan sampel gratis 2-3 kg atau preorder karung pertama. Tim ReCob.id menghubungi Anda untuk jadwal dan ketersediaan; belum ada konfirmasi pembayaran di tahap ini.",
  },
  costCompare: {
    eyebrow: "Harga Pakan Dibandingkan",
    title: "Perbandingan Harga Pakan",
    intro:
      "Harga ReCob.id dibandingkan pakan pabrik, dihitung per karung, per kilogram, dan per ekor sapi.",
    tableHead: {
      criteria: "Yang Dibandingkan",
      recob: "ReCob.id (Bonggol Jagung)",
      conventional: "Pakan Pabrik",
      difference: "Selisih",
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
    assumptionTitle: "Angka yang Dipakai",
    assumptions: [
      "Sapi makan konsentrat 4 kg per ekor per hari (120 kg per ekor per bulan).",
      "Perhitungan memakai 30 hari per bulan.",
      "Harga diambil dari titik penampungan susu KUD di Pulau Jawa.",
    ],
    closing: "STATUS: KALKULASI RESMI",
  },
  calculator: {
    eyebrow: "Hitung Sendiri",
    title: "Hitung Penghematan Anda",
    intro:
      "Isi jumlah sapi dan harga pakan pabrik di kandang Anda. Harga ReCob.id tetap, jadi Anda bisa memeriksa sendiri hasilnya.",
    cattleLabel: "Jumlah Sapi Perah Produktif",
    cattleUnit: "ekor",
    comparePriceLabel: "Harga Pakan Pabrik",
    comparePriceUnit: "per karung 50 kg",
    intakeLabel: "Asupan Konsentrat per Ekor",
    intakeUnit: "kg/ekor/hari",
    anchorTitle: "Harga ReCob.id (tetap)",
    inputsTitle: "Angka yang Bisa Anda Ubah",
    anchorPriceLabel: "Harga ReCob.id",
    anchorPriceUnit: "per karung 50 kg",
    anchorPricePerKgLabel: "Setara per kilogram",
    anchorNote:
      "Harga ReCob.id tidak bisa diubah di sini. Angkanya diambil dari data produk resmi.",
    resultTitle: "Hasil",
    savingPerCowLabel: "Hemat per ekor per bulan",
    savingMonthlyLabel: "Hemat total per bulan",
    savingYearlyLabel: "Hemat per tahun",
    savingPctLabel: "Persentase penghematan",
    recobCostLabel: "Biaya ReCob.id per bulan",
    compareCostLabel: "Biaya pakan pabrik per bulan",
    resultUnit: "per bulan",
    noSavingTitle: "Pakan pabrik lebih murah pada angka ini",
    noSavingBody:
      "Dengan harga yang Anda isi, ReCob.id belum lebih hemat. Angkanya tetap kami tampilkan apa adanya supaya Anda bisa memeriksa sendiri.",
    invalidTitle: "Angka belum lengkap",
    invalidBody: "Isi jumlah sapi, harga pakan pabrik, dan asupan harian dengan angka lebih dari nol.",
    mathTitle: "Cara Hitungnya",
    mathLine:
      "{kg} kg/ekor/bulan x {recobPerKg}/kg = {recobPerCow} per ekor per bulan, dibandingkan {comparePerKg}/kg = {comparePerCow}.",
    mathNote:
      "Silakan cek dengan kalkulator ponsel Anda. Semua angka berasal dari isian Anda sendiri.",
    errors: {
      compareRange: "Harga pakan pabrik antara Rp50.000 dan Rp1.000.000 per karung.",
      cattleRange: "Jumlah sapi antara 1 dan 10.000 ekor.",
      intakeRange: "Asupan harian antara 0,5 dan 15 kg per ekor.",
    },
    claimNotice:
      "Simulasi ini menghitung selisih biaya pakan, bukan jaminan kenaikan produksi susu. Klaim produksi susu masih menunggu uji lapangan.",
    ctaNote: "Jumlah sapi yang Anda isi akan dibawa ke formulir permintaan sampel.",
    kudNote: "Perhitungan ini belum menghitung biaya hijauan dan tenaga kerja kandang.",
  },
  partnership: {
    eyebrow: "Alur Kemitraan",
    title: "Cara Bermitra dengan KUD",
    intro:
      "ReCob.id bekerja sama dengan KUD penampung susu, sehingga peternak tidak perlu menyiapkan uang tunai di awal.",
    steps: [
      {
        title: "Registrasi Peternak",
        body: "Verifikasi identitas nomor anggota aktif KUD dan kuota volume susu harian yang disetorkan ke tempat penampungan.",
      },
      {
        title: "Pengiriman Karung",
        body: "Pengantaran langsung ke titik Pos Penampungan Susu (PPS) terdekat saat jadwal peternak menyetor susu pagi.",
      },
      {
        title: "Potong Setoran Susu",
        body: "Pemotongan tagihan pakan secara otomatis pada slip pembayaran mingguan tanpa perlu menyiapkan uang kas tunai di awal.",
      },
      {
        title: "Pendampingan Rumen",
        body: "Pemantauan mingguan oleh tim lapangan ReCob.id bersama penyuluh KUD untuk mengukur berat jenis susu dan kesehatan feses.",
      },
    ],
    kudTitle: "Wilayah Fokus Fase Awal Kemitraan",
    kudSubtitle: "Sentra Sapi Perah Dataran Tinggi Jawa",
    kudNote:
      "Kesiapan logistik terverifikasi di Jawa Barat, Jawa Tengah, dan Jawa Timur",
    kudNames: [
      "KPBS Pangalengan (Bandung)",
      "KUD Mojosongo (Boyolali)",
      "KUD Cepogo (Boyolali)",
      "KUD Setia Kawan (Pasuruan)",
    ],
  },
  validation: {
    eyebrow: "Kendali Mutu",
    title: "Cara Kami Menjaga Mutu",
    intro:
      "Setiap bets produksi pakan diperiksa dan hasilnya kami buka, supaya mutu pakan bisa Anda lacak sendiri.",
    qcItems: [
      {
        title: "Pemeriksaan Kadar Air Harian",
        metric: "Batas Aman < 12% Kadar Air",
        body: "Kadar air pelet diukur setiap hari supaya pakan tahan disimpan sampai 6 bulan dan tidak berjamur.",
        note: "Bebas Risiko Jamur Simpan",
      },
      {
        title: "Pemeriksaan Aroma Tetes Tebu",
        metric: "100% Bebas Bau Tengik / Amonia",
        body: "Aroma manis karamel diperiksa untuk memastikan pakan disukai sapi perah saat dimakan.",
        note: "Tingkat Palatabilitas Teruji",
      },
      {
        title: "Pendampingan Ganti Pakan 7 Hari",
        metric: "Protokol Transisi Terstandarisasi",
        body: "Pakan diganti bertahap dengan pendampingan langsung di kandang supaya pencernaan sapi tidak kaget dan produksi susu tetap stabil.",
        note: "Tanpa Penurunan Produksi Susu",
      },
    ],
    // Dipakai `/llms.txt` sebagai daftar sumber untuk mesin jawaban. Blok "Sumber Rujukan" di
    // beranda dihapus atas keputusan pemilik produk, tetapi daftarnya tetap jadi bagian lapisan
    // konten selama ringkasan mesin masih mengutipnya.
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
    eyebrow: "Panduan Kandang",
    title: "Panduan Beternak Sapi Perah",
    intro:
      "Empat panduan praktis dari tim lapangan ReCob.id untuk anggota KUD.",
    ctaLabel: "Lihat Semua Panduan",
    items: [
      {
        title: "Panduan 7 Hari Uji Palatabilitas",
        body: "Langkah bertahap mencampur konsentrat baru dengan pakan lama agar saliva dan mikroba rumen tidak terkejut.",
        action: "Baca Tata Cara Transisi",
      },
      {
        title: "Menghitung HPP Pakan Mandiri",
        body: "Formula kalkulasi biaya riil pakan per liter susu yang dihasilkan, memisahkan biaya hijauan dan konsentrat harian.",
        action: "Unduh Lembar Hitung",
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
  pages: {
    produk: {
      eyebrow: "Produk",
      title: "Katalog Produk ReCob.id",
      intro: "Pilih produk Pakan ReCob.id, lalu lihat bahan, isi karung, dan cara pemakaiannya.",
      catalog: {
        eyebrow: "Katalog",
        title: "Katalog Produk",
        intro: "Lihat produk ReCob.id sesuai kebutuhan peternakan Anda.",
        priceLabel: "Harga",
        priceUnit: "per",
        weightUnit: "kg",
        cta: "Kalkulator Penghematan",
        specificationCta: "Lihat spesifikasi",
        emptyTitle: "Belum ada produk",
        emptyBody: "Katalog produk sedang disiapkan.",
      },
    },
    spesifikasiProduk: {
      eyebrow: "Detail Produk",
      title: "Spesifikasi Produk",
      intro: "Lihat cara memberi pakan, isi karung, dan cara menyimpan ReCob.id.",
    },
    kalkulator: {
      eyebrow: "Hitung Sendiri",
      title: "Hitung Penghematan Anda",
      intro:
        "Bandingkan harga pakan pabrik dengan ReCob.id memakai jumlah sapi Anda sendiri. Semua angkanya bisa Anda periksa.",
    },
    mitra: {
      eyebrow: "Kemitraan",
      title: "Cara Bermitra dengan KUD",
      intro: "Alur pengambilan karung dan pemotongan setoran susu mingguan.",
    },
    edukasi: {
      eyebrow: "Panduan",
      title: "Panduan Beternak Sapi Perah",
      intro: "Empat panduan praktis dari tim lapangan ReCob.id untuk anggota KUD.",
    },
    kontak: {
      eyebrow: "Kontak",
      title: "Hubungi ReCob.id",
      intro: "Ajukan sampel gratis atau tanyakan ransum sapi Anda lewat WhatsApp.",
    },
  },
  contact: {
    channelsTitle: "Kanal Resmi",
    whatsappTitle: "WhatsApp Kemitraan",
    whatsappBody: "Tanya ransum, jadwal pengiriman, atau status permintaan sampel Anda.",
    whatsappCta: "Tanya via WhatsApp",
    whatsappText: "Halo ReCob.id, saya ingin bertanya soal pakan sapi perah.",
    whatsappUnavailable:
      "Nomor WhatsApp resmi belum tersedia. Isi formulir sampel di bawah, tim lapangan akan menghubungi Anda.",
    legalTitle: "Legalitas",
    legalBody: "Status izin edar dan standar mutu yang kami pegang.",
    identityTitle: "Identitas Resmi",
    legalNameLabel: "Entitas Hukum",
    addressLabel: "Alamat Operasional",
    formTitle: "Ajukan Sampel Gratis",
  },
  faq: {
    eyebrow: "Pertanyaan Peternak",
    title: "Pertanyaan yang Sering Ditanya",
    intro:
      "Jawaban soal mutu pakan, cara pembayaran lewat KUD, dan adaptasi sapi di kandang.",
    items: [
      {
        question: "Bagaimana jaminan bebas racun aflatoksin dan kapang?",
        answer:
          "ReCob.id menerapkan proses dehidrasi terstandar dengan kadar air akhir konsisten di bawah 12%. Selain itu, kemasan karung laminasi kedap udara mencegah kondensasi kelembapan selama transit gudang, memastikan total aflatoksin di bawah ambang batas ketat SNI (< 20 ppb).",
      },
      {
        question:
          "Apakah sapi akan mengalami stres pakan atau diare saat transisi?",
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
        question:
          "Apakah ReCob.id dapat menggantikan hijauan segar seluruhnya?",
        answer:
          "Tidak. ReCob.id berfungsi sebagai konsentrat penguat sumber energi dan protein fermentasi. Sapi ruminansia tetap membutuhkan hijauan serat panjang (seperti rumput gajah atau tebon) minimal 10% dari bobot badan untuk memelihara fungsi fisiologis rumen.",
      },
    ],
  },
  cta: {
    preorderLabel: "Preorder Sekarang",
    sampleLabel: "Klaim Sampel Gratis",
    compact: {
      eyebrow: "Langkah Berikutnya",
      title: "Siap Uji Pakan di Kandang?",
      intro:
        "Kirim permintaan sampel atau preorder. Tim ReCob.id akan menghubungi Anda untuk jadwal dan ketersediaan.",
    },
    eyebrow: "Uji Mutu di Kandang Sendiri",
    title: "Minta Sampel atau Preorder",
    intro:
      "Kirim permintaan sampel atau preorder. Tim ReCob.id akan menghubungi Anda untuk jadwal dan ketersediaan; belum ada konfirmasi pembayaran.",
    benefits: [
      "Gratis tanpa biaya pakan untuk peternak anggota KUD aktif",
      "Disertai lembar panduan takaran transisi hari ke-1 hingga ke-7",
      "Konsultasi ransum via WhatsApp bersama formulator nutrisi ternak",
    ],
    whatsappHelp:
      "Butuh bantuan pendaftaran? Hubungi Admin WhatsApp Kemitraan KUD",
    whatsappUnavailable:
      "Nomor WhatsApp resmi belum tersedia. Isi formulir di samping, tim lapangan akan menghubungi Anda.",
    form: {
      title: "Formulir Permintaan Sampel atau Preorder",
      intro:
        "Lengkapi data kandang Anda untuk verifikasi permintaan sampel atau preorder. Tim ReCob.id akan menghubungi Anda untuk jadwal dan ketersediaan; formulir ini bukan konfirmasi pembayaran.",
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
      messagePlaceholder:
        "Kondisi kandang, jadwal penyerahan, atau pertanyaan ransum",
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
  },
  footer: {
    brand: "ReCob.id",
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
      {
        name: "KUD Mojosongo Boyolali",
        location: "Kawasan Sentra Sapi Perah Jawa Tengah",
      },
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
    address:
      "Sentra Agribisnis Biokonversi Jawa Barat & Jawa Tengah, Indonesia",
    nppStatus: "NPP Kementan RI: dalam proses pendaftaran",
    copyright:
      "© 2025 ReCob.id • PT Biomasa Nutrisi Nusantara. Seluruh hak cipta dilindungi undang-undang.",
  },
  nav: {
    brand: "ReCob.id",
    home: "Beranda",
    product: "Produk",
    calculator: "Kalkulator",
    partnership: "Kemitraan KUD",
    education: "Panduan",
    contact: "Kontak",
    primaryCta: "Preorder Sekarang",
    sampleCta: "Klaim Sampel Gratis",
    menuLabel: "Buka menu navigasi",
    closeLabel: "Tutup menu navigasi",
    skipLabel: "Lewati ke konten utama",
  },
  meta: {
    title:
      "ReCob.id — Pakan Konsentrat Sapi Perah dari Bonggol Jagung Terfermentasi",
    description:
      "Pelet konsentrat sapi perah dari bonggol jagung dan ampas tahu terfermentasi. Rp160.000 per karung 50 kg dengan skema potong setoran susu melalui kemitraan KUD di Jawa Barat, Jawa Tengah, dan Jawa Timur.",
    ogAlt: "Karung pakan konsentrat ReCob.id 50 kg untuk sapi perah",
    /** Identitas entitas untuk structured data (GEO). Hanya fakta yang sudah pasti. */
    legalName: "PT Biomasa Nutrisi Nusantara",
    shortName: "ReCob.id",
    /** Ringkasan satu kalimat untuk `llms.txt`; dibaca mesin jawaban, bukan pengunjung. */
    summary:
      "ReCob.id memproduksi pelet konsentrat sapi perah dari limbah bonggol jagung dan ampas tahu terfermentasi, dijual Rp160.000 per karung 50 kg melalui kemitraan KUD dengan skema potong setoran susu mingguan.",
    /** Topik yang dikuasai entitas; memperkuat pencocokan semantik di mesin generatif. */
    knowsAbout: [
      "Pakan konsentrat sapi perah",
      "Fermentasi limbah bonggol jagung",
      "Ampas tahu terfermentasi",
      "Ekonomi sirkular peternakan",
      "Kemitraan Koperasi Unit Desa",
      "Potong setoran susu mingguan",
    ],
  },
} as const;

export type Copy = typeof idCopy;
