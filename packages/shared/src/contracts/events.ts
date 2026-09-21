import { z } from "zod";
import { FUNNEL_EVENTS } from "../constants/funnel-events";

export const trackEventInput = z
  .object({
    eventName: z.enum(FUNNEL_EVENTS),
    path: z.string().min(1).max(256),
    placement: z.string().max(64).optional(),
    metadata: z
      .record(z.string(), z.union([z.string().max(64), z.number(), z.boolean()]))
      .default({}),
  })
  .strict();

export type TrackEventInput = z.infer<typeof trackEventInput>;
