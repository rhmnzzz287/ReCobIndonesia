import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Alias `@` mengarah ke apps/web agar tes di `tests/e2e/lead-write.test.ts` dapat
 * mengimpor modul web sungguhan (`@/lib/data/leads`) — jalur tulis yang diuji adalah
 * kode produksi, bukan salinannya.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("../web/", import.meta.url)),
    },
  },
});
