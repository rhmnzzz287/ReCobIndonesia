import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseHost = supabaseOrigin.length > 0 ? new URL(supabaseOrigin).host : "";
const supabaseRealtimeOrigin = supabaseOrigin.replace(/^https:/u, "wss:");

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  `connect-src 'self'${supabaseHost.length > 0 ? ` ${supabaseOrigin} ${supabaseRealtimeOrigin}` : ""}`,
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@recobid/shared"],
  // Keluaran standalone hanya dibangun untuk image kontainer (Dockerfile.vercel).
  // Build biasa tetap memakai keluaran default agar `npm run verify` tidak berubah.
  ...(process.env.BUILD_STANDALONE === "true"
    ? {
        output: "standalone" as const,
        // Wajib di monorepo: tanpa ini Next hanya menelusuri apps/web, sehingga
        // packages/shared tidak ikut masuk keluaran standalone dan image gagal saat start.
        outputFileTracingRoot: fileURLToPath(new URL("../../", import.meta.url)),
      }
    : {}),
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
