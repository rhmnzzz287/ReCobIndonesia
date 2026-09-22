import { describe, expect, it } from "vitest";
import {
  computeSignature,
  verifySignature,
} from "../../supabase/functions/notify-lead/signature";

const SECRET = "rahasia-uji-minimal-32-karakter-panjang";

describe("tanda tangan notify-lead", () => {
  it("menghasilkan HMAC-SHA256 heksadesimal 64 karakter", async () => {
    const signature = await computeSignature('{"leadId":"a"}', SECRET);
    expect(signature).toMatch(/^[0-9a-f]{64}$/u);
  });

  it("menerima tanda tangan yang benar", async () => {
    const body = '{"leadId":"a","regionCode":"jabar"}';
    const signature = await computeSignature(body, SECRET);
    await expect(verifySignature(body, signature, SECRET)).resolves.toBe(true);
  });

  it("menolak tanda tangan yang salah", async () => {
    const body = '{"leadId":"a","regionCode":"jabar"}';
    await expect(verifySignature(body, "0".repeat(64), SECRET)).resolves.toBe(false);
  });

  it("menolak badan yang diubah setelah ditandatangani", async () => {
    const signature = await computeSignature('{"leadId":"a"}', SECRET);
    await expect(verifySignature('{"leadId":"b"}', signature, SECRET)).resolves.toBe(false);
  });

  it("menolak panjang tanda tangan yang berbeda tanpa melempar", async () => {
    await expect(verifySignature("{}", "abc", SECRET)).resolves.toBe(false);
  });

  it("menolak tanda tangan sah yang ditandatangani dengan rahasia lain", async () => {
    const body = '{"leadId":"a","regionCode":"jabar"}';
    const signature = await computeSignature(body, "rahasia-lain-yang-juga-32-karakter-ok");
    await expect(verifySignature(body, signature, SECRET)).resolves.toBe(false);
  });

  it("tanda tangan cocok dengan HMAC yang dihitung kode pemanggil (Task 13)", async () => {
    // Kontrak lintas-runtime: submitLeadAction menandatangani dengan Web Crypto yang sama.
    const body = '{"leadId":"11111111-1111-1111-1111-111111111111","regionCode":"jabar"}';
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
    const manual = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    await expect(computeSignature(body, SECRET)).resolves.toBe(manual);
  });
});
