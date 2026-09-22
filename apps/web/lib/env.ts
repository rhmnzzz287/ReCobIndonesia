import { LIMITS } from "@recobid/shared/constants/limits";

function optional(name: string): string | null {
  const value = process.env[name];
  return value === undefined || value.trim().length === 0 ? null : value.trim();
}

function positiveInt(name: string, fallback: number): number {
  const raw = optional(name);
  if (raw === null) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const supabaseUrl = optional("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = optional("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const forcedDemo = optional("DEMO_MODE") === "true";

/** Hanya digit; spasi, tanda hubung, dan tanda plus dibuang supaya `wa.me` menerima tautannya. */
const whatsappNumber = (optional("NEXT_PUBLIC_WHATSAPP_NUMBER") ?? "").replace(/\D/gu, "");

/**
 * Konfigurasi runtime. `demoMode` menyala otomatis bila kredensial Supabase tidak ada, sehingga
 * beranda tetap utuh di venue tanpa jaringan (spec ADR-020).
 *
 * `whatsappUrl` bernilai null selama nomor resmi belum ada. Sebelumnya nomor contoh ditulis
 * langsung di komponen, dan itu melanggar PRD Bagian 8: nomor yang belum ada tidak boleh
 * dikarang. Antarmuka yang memakainya wajib menyembunyikan tombolnya saat null.
 */
export const env = {
  siteUrl: optional("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000",
  supabaseUrl,
  supabaseAnonKey,
  demoMode: forcedDemo || supabaseUrl === null || supabaseAnonKey === null,
  rateLimitWindowMs: positiveInt("LEAD_RATE_LIMIT_WINDOW_MS", LIMITS.rateLimitWindowMs),
  rateLimitMax: positiveInt("LEAD_RATE_LIMIT_MAX", LIMITS.rateLimitMax),
  notifyHookUrl: optional("NOTIFY_HOOK_URL"),
  notifyHookSecret: optional("NOTIFY_HOOK_SECRET"),
  whatsappUrl:
    whatsappNumber.length > 0 ? `https://wa.me/${whatsappNumber}` : null,
} as const;

export type Env = typeof env;
