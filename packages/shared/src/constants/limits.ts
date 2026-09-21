export const LIMITS = {
  fullNameMin: 2,
  fullNameMax: 120,
  messageMax: 1000,
  cattleMin: 1,
  cattleMax: 10_000,
  idempotencyKeyMin: 16,
  idempotencyKeyMax: 64,
  rateLimitWindowMs: 600_000,
  rateLimitMax: 5,
} as const;

export type Limits = typeof LIMITS;
