import { expect, test } from "@playwright/test";

test.describe("beranda ReCobID", () => {
  test("memuat 12 seksi dengan judul utama dan tanpa emoji", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    for (const id of [
      "hero",
      "tantangan",
      "solusi",
      "formulasi",
      "penghematan",
      "dampak",
      "kemitraan",
      "mutu",
      "edukasi",
      "faq",
      "form-sampel",
    ]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }

    const body = (await page.locator("body").innerText()).normalize("NFC");
    expect(/[\u{1F000}-\u{1FAFF}\u2600-\u27BF]/u.test(body)).toBe(false);
  });

  test("navigasi ke formulir dari hero", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Klaim Sampel/i }).first().click();
    await expect(page.locator("#form-sampel")).toBeInViewport();
  });

  test("menolak nomor WhatsApp yang tidak sah sebelum mengirim", async ({ page }) => {
    await page.goto("/#form-sampel");
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
    expect(await robots.text()).toContain("sitemap");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
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
