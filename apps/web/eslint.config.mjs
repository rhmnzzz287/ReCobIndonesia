import next from "eslint-config-next/core-web-vitals";
import tseslint from "typescript-eslint";

/**
 * Flat config: `eslint-config-next@16` sudah berupa array `Linter.Config[]` dengan plugin
 * `@typescript-eslint` terdaftar di elemennya sendiri. Aturan tambahan diletakkan pada blok
 * terpisah yang mendaftarkan ulang plugin tersebut, karena flat config tidak mewarisi plugin
 * antar objek konfigurasi.
 *
 * Catatan kompatibilitas: `eslint-config-next@16` menarik `eslint-plugin-react@7`, yang peer-nya
 * berhenti di `eslint@^9.7`. Jangan naikkan ESLint ke 10 sebelum plugin itu mendukungnya.
 */
const config = [
  ...next,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: { "@typescript-eslint": tseslint.plugin },
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "tests/e2e/**", "next-env.d.ts"],
  },
];

export default config;
