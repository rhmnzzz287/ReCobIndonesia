import tseslint from "typescript-eslint";

/**
 * Flat config minimal untuk paket bersama.
 *
 * Paket ini tidak memuat JSX atau React, jadi konfigurasi Next tidak berlaku. Aturan yang
 * ditegakkan di sini adalah aturan yang sama dengan aplikasi web pada kode TypeScript murni.
 */
export default [
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    ignores: ["node_modules/**"],
  },
];
