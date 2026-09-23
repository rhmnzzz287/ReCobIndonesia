import { expect, test } from "@playwright/test";
import { copy } from "../../content/copy";

test.describe("prototipe ReCob.id", () => {
  test("enam halaman balas 200 dan punya judul utama", async ({ page }) => {
    for (const route of ["/", "/produk", "/kalkulator", "/mitra", "/edukasi", "/kontak"]) {
      const response = await page.goto(route);
      expect(response?.status(), `${route} harus balas 200`).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("beranda memuat seksi naratif dan tanpa emoji", async ({ page }) => {
    await page.goto("/");

    for (const id of [
      "hero",
      "tantangan",
      "solusi",
      "produk-ringkas",
      "jelajahi",
      "mutu",
      "faq",
      "form-sampel",
    ]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }

    // Bagian "Metrik Dampak" dihapus atas keputusan pemilik produk.
    await expect(page.locator("#dampak")).toHaveCount(0);

    const body = (await page.locator("body").innerText()).normalize("NFC");
    expect(/[\u{1F000}-\u{1FAFF}\u2600-\u27BF]/u.test(body)).toBe(false);
  });

  test("menu navigasi memindahkan pengunjung antar halaman", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("navigation").first().getByRole("link", { name: "Kalkulator" }).click();
    await expect(page).toHaveURL(/\/kalkulator$/u);
    await expect(page.locator("#kalkulator")).toBeVisible();

    await page.getByRole("navigation").first().getByRole("link", { name: "Produk" }).click();
    await expect(page).toHaveURL(/\/produk$/u);
    await expect(page.locator("#formulasi")).toBeVisible();
  });

  test("halaman produk menyusun seksi pendarat dan chip bahan yang bisa diklik", async ({ page }) => {
    await page.goto("/produk");

    // Panggung pembuka menggantikan kepala halaman biasa: tetap harus ada satu H1.
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    for (const id of ["produk-hero", "formulasi", "cara-pakai", "perbandingan"]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }

    // Bilah angka naik dari nol; setelah animasi selesai nilainya harus angka akhir yang sama
    // dengan naskah, bukan angka yang tertinggal di tengah jalan.
    await expect(page.locator("#angka-produk + dl")).toContainText("50 kg");

    // Tab bahan: memilih bahan lain harus mengganti isi panel, bukan sekadar memindahkan penanda.
    const tabs = page.locator('#formulasi [role="tab"]');
    await expect(tabs).toHaveCount(3);
    await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
    const panel = page.getByTestId("panel-bahan");
    const firstPanel = await panel.innerText();
    await tabs.nth(1).click();
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
    await expect.poll(async () => panel.innerText()).not.toBe(firstPanel);

    // Tidak ada emoji di halaman baru (PRD Bagian 8).
    const body = (await page.locator("body").innerText()).normalize("NFC");
    expect(/[\u{1F000}-\u{1FAFF}\u2600-\u27BF]/u.test(body)).toBe(false);
  });

  test("hero produk editorial dengan foto dan ajakan", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/produk");

    const hero = page.locator("#produk-hero");
    await expect(hero).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

    const photo = hero.getByRole("img", { name: "Produk ReCob.id", exact: true });
    await expect(photo).toBeVisible();
    await expect(hero.getByRole("link", { name: /Klaim Sampel Gratis/i })).toBeVisible();
    await expect(hero.getByRole("link", { name: /Kalkulator/i })).toBeVisible();

    // Panggung editorial terang: bukan lagi foto berlatar gelap dengan selubung.
    const luminance = await hero.evaluate((node) => {
      const channels = (getComputedStyle(node).backgroundColor.match(/\d+/gu) ?? []).map(Number);
      const [r = 0, g = 0, b = 0] = channels;
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    });
    expect(luminance).toBeGreaterThan(0.5);

    // Desktop: salinan dan foto berdampingan.
    const heading = await hero.getByRole("heading", { level: 1 }).boundingBox();
    const photoBox = await photo.boundingBox();
    expect(photoBox?.x ?? 0).toBeGreaterThan((heading?.x ?? 0) + (heading?.width ?? 0));

    // Ponsel: foto turun ke bawah salinan, tidak berdesakan di belakang teks.
    await page.setViewportSize({ width: 390, height: 844 });
    await expect
      .poll(async () => (await photo.boundingBox())?.y ?? 0)
      .toBeGreaterThan((await hero.getByRole("heading", { level: 1 }).boundingBox())?.y ?? 0);
  });

  test("alur editorial produk: hero, pita, manfaat, penawaran", async ({ page }) => {
    await page.goto("/produk");

    // Urutan DOM yang dibaca pengunjung dari atas ke bawah.
    const urutan = await page
      .locator("main > *")
      .evaluateAll((nodes) => nodes.map((node) => node.id));
    expect(urutan).toEqual([
      "produk-hero",
      "pita-alur",
      "formulasi",
      "cara-pakai",
      "perbandingan",
    ]);

    // Manfaat dan formulasi tetap bersumber dari data produk, bukan angka baru.
    await expect(page.locator("#formulasi [role=\"tab\"]")).toHaveCount(3);
    await expect(page.locator("#cara-pakai")).toContainText("Rp160.000");

    // Penawaran mudah ditemukan: harga, syarat sampel, dan dua ajakan penutup.
    const penutup = page.locator("#perbandingan");
    await expect(penutup.getByRole("link", { name: /Klaim Sampel Gratis/i })).toBeVisible();
    await expect(penutup.getByRole("link", { name: /Halaman Kontak/i })).toBeVisible();

    // Tidak ada testimoni atau logo mitra yang dikarang: halaman ini tidak memuat keduanya.
    await expect(page.locator("blockquote")).toHaveCount(0);
    await expect(page.locator("#mitra")).toHaveCount(0);
  });

  test("pita proses terbaca sekali dan berhenti saat gerak dikurangi", async ({ page }) => {
    await page.goto("/produk");

    const pita = page.locator("#pita-alur");
    await expect(pita).toHaveCount(1);

    // Daftar aksesibel: pembaca layar mendengar alur proses lengkap, tepat sekali.
    const daftar = page.locator("#pita-alur-daftar li");
    await expect(daftar).toHaveCount(copy.productStory.marquee.length);
    await expect(daftar.first()).toContainText(copy.productStory.marquee[0] ?? "");

    // Salinan yang bergerak hanya hiasan: disembunyikan dari pembaca layar.
    const trek = page.locator("#pita-alur-trek");
    await expect(trek).toHaveAttribute("aria-hidden", "true");
    expect(await trek.evaluate((node) => getComputedStyle(node).animationName)).toBe("marquee");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    expect(await trek.evaluate((node) => getComputedStyle(node).animationName)).toBe("none");
  });

  test("bilah kemajuan gulir hanya ada di halaman produk dan lebarnya bertambah", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator('div[aria-hidden="true"] > span.bg-accent')).toHaveCount(0);

    await page.goto("/produk");
    const bar = page.locator('div[aria-hidden="true"].fixed > span.bg-accent');
    await expect(bar).toHaveCount(1);

    const before = await bar.evaluate((node) => (node as HTMLElement).style.width);
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await expect
      .poll(async () => bar.evaluate((node) => (node as HTMLElement).style.width))
      .not.toBe(before);
  });

  test("kalkulator menghitung ulang dan membawa jumlah ternak ke formulir sampel", async ({
    page,
  }) => {
    await page.goto("/kalkulator");

    const cattle = page.locator("#kalkulator input[type='number']").first();
    await cattle.fill("10");

    // 10 ekor, 120 kg/ekor/bulan, Rp160.000 vs Rp200.000 per 50 kg -> hemat Rp960.000/bulan.
    await expect(page.locator("#kalkulator")).toContainText("Rp960.000");

    await page
      .locator("#kalkulator")
      .getByRole("link", { name: /Klaim Sampel Gratis 2-3 kg/i })
      .click();
    await expect(page).toHaveURL(/\/kontak#form-sampel$/u);
    await expect(page.locator("#cattleCount")).toHaveValue("10");
  });

  test("kalkulator menolak harga pembanding yang mustahil", async ({ page }) => {
    await page.goto("/kalkulator");

    const compare = page.locator("#kalkulator input[type='number']").nth(1);
    await compare.fill("123");

    await expect(page.locator("#kalkulator")).toContainText("Harga pakan pabrik antara");
    // Angka turunan dari masukan yang salah tidak boleh muncul sama sekali.
    await expect(page.locator("#kalkulator")).not.toContainText("-130.069%");
  });

  test("navigasi ke formulir dari hero", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Klaim Sampel/i }).first().click();
    await expect(page).toHaveURL(/\/kontak#form-sampel$/u);
    await expect(page.locator("#form-sampel")).toBeInViewport();
  });

  test("menolak nomor WhatsApp yang tidak sah sebelum mengirim", async ({ page }) => {
    await page.goto("/kontak#form-sampel");
    // Selektor eksak: /Nama/i juga cocok dengan "Nama KUD Terdekat", sehingga ambigu.
    await page.locator("#fullName").fill("Uji E2E");
    await page.locator("#phoneWa").fill("123");
    await page.locator("#cattleCount").fill("3");
    await page.locator("#regionCode").selectOption("jabar");
    await page.locator("#consent").check();
    await page.getByRole("button", { name: /Kirim Permintaan/i }).click();
    await expect(page.locator("#phoneWa")).toHaveAttribute("aria-invalid", "true");
  });

  test("melayani health check dan berkas SEO", async ({ request }) => {
    const health = await request.get("/api/health");
    expect([200, 503]).toContain(health.status());

    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    const robotsBody = await robots.text();
    expect(robotsBody).toContain("sitemap");
    // AEO/GEO: crawler mesin jawaban harus diizinkan, bukan hanya wildcard pasif.
    expect(robotsBody).toContain("GPTBot");
    expect(robotsBody).toContain("PerplexityBot");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const sitemapBody = await sitemap.text();
    // Keenam halaman prototipe harus terdaftar.
    for (const route of ["/produk", "/kalkulator", "/mitra", "/edukasi", "/kontak"]) {
      expect(sitemapBody).toContain(route);
    }
  });

  test("menyajikan metadata pencarian, pratinjau tautan, dan ringkasan mesin jawaban", async ({
    page,
    request,
  }) => {
    await page.goto("/");

    // Kanonik dan pratinjau tautan.
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /localhost|recob/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /opengraph/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index/);

    // Data terstruktur: satu blok @graph berisi lima node yang saling bertaut.
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(blocks).toHaveLength(1);
    const graph = JSON.parse(blocks[0] ?? "{}")["@graph"] as Array<Record<string, unknown>>;
    expect(graph.map((node) => node["@type"])).toEqual([
      "Organization",
      "WebSite",
      "FAQPage",
      "HowTo",
      "Product",
    ]);

    // Klaim tanpa dasar dilarang muncul di data terstruktur (PRD Bagian 8).
    const serialized = JSON.stringify(graph);
    expect(serialized).not.toContain("aggregateRating");
    expect(serialized).not.toContain("sameAs");

    // Gambar pratinjau dan ikon benar-benar ada, bukan tautan mati.
    const ogImage = await request.get("/opengraph-image");
    expect(ogImage.status()).toBe(200);
    expect(ogImage.headers()["content-type"]).toContain("image/png");

    const icon = await request.get("/icon");
    expect(icon.status()).toBe(200);

    // Ringkasan untuk mesin jawaban memuat fakta yang dapat dikutip.
    const llms = await request.get("/llms.txt");
    expect(llms.status()).toBe(200);
    const llmsBody = await llms.text();
    expect(llmsBody).toContain("Rp160.000");
    expect(llmsBody).toContain("Pertanyaan yang Sering Diajukan");
  });

  test("setiap halaman sekunder menetapkan kanoniknya sendiri", async ({ page }) => {
    for (const route of ["/produk", "/kalkulator", "/mitra", "/edukasi", "/kontak"]) {
      await page.goto(route);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical, `${route} kanonik salah`).toContain(route);
    }
  });

  test("menyimpan lead nyata dan menolak duplikat secara idempoten", async ({ request }) => {
    test.skip(
      process.env.NEXT_PUBLIC_SUPABASE_URL === undefined ||
        process.env.NEXT_PUBLIC_SUPABASE_URL === "",
      "Kredensial Supabase tidak tersedia; skenario ini dijalankan pada CI ber-secrets.",
    );

    // Kontrak: source hanya menerima nilai enum lead_source; utm memakai objek (bukan null).
    const body = {
      fullName: "Uji E2E Idempoten",
      phoneWa: "081234567891",
      cattleCount: 5,
      regionCode: "jabar",
      source: "other",
      utm: {},
      idempotencyKey: `e2e-${Date.now()}`,
    };

    const first = await request.post("/api/lead", { data: body });
    expect(first.status()).toBe(200);
    expect((await first.json()).status).toBe("created");

    const second = await request.post("/api/lead", { data: body });
    expect(second.status()).toBe(200);
    expect((await second.json()).status).toBe("duplicate");
  });
});
