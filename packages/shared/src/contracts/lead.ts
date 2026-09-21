import { z } from "zod";
import { LIMITS } from "../constants/limits";
import { REGION_CODES } from "../constants/regions";

/**
 * Sumber perolehan lead. Daftar eksplisit: tidak bergantung pada konstanta lain agar perubahan
 * nama event funnel tidak diam-diam mengubah kontrak lead.
 */
export const LEAD_SOURCES = [
  "tiktok",
  "instagram",
  "facebook",
  "whatsapp",
  "referral",
  "field_visit",
  "other",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

export const phoneWaSchema = z
  .string()
  .trim()
  .regex(/^(\+?62|0)8[1-9][0-9]{6,11}$/u, "Nomor WhatsApp tidak valid");

/**
 * Kontrak lead (Docs/SCHEMA.md §8) dengan `.strict()`: properti tak dikenal ditolak, sehingga
 * klien tidak dapat menyelundupkan kolom ke RPC.
 *
 * `kudSlug` dan `message` bersifat opsional (bukan nullable) mengikuti SCHEMA.md §8; pemanggil
 * yang tidak punya nilai cukup menghilangkan propertinya.
 */
export const submitLeadInput = z
  .object({
    fullName: z.string().trim().min(LIMITS.fullNameMin).max(LIMITS.fullNameMax),
    phoneWa: phoneWaSchema,
    cattleCount: z.number().int().min(LIMITS.cattleMin).max(LIMITS.cattleMax),
    regionCode: z.enum(REGION_CODES),
    kudSlug: z.string().trim().min(2).max(64).optional(),
    message: z.string().trim().max(LIMITS.messageMax).optional(),
    source: z.enum(LEAD_SOURCES),
    utm: z
      .object({
        source: z.string().max(64).optional(),
        medium: z.string().max(64).optional(),
        campaign: z.string().max(64).optional(),
      })
      .default({}),
    idempotencyKey: z.string().min(LIMITS.idempotencyKeyMin).max(LIMITS.idempotencyKeyMax),
  })
  .strict();

export type SubmitLeadInput = z.infer<typeof submitLeadInput>;
