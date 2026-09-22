"use server";

import { trackEventInput, type TrackEventInput } from "@recobid/shared/contracts/events";
import { trackEvent } from "@/lib/analytics";

/**
 * Funnel sisi server. Kunjungan halaman ditangani Vercel Analytics; aksi ini hanya
 * mencatat peristiwa funnel yang dikirim klien.
 */
export async function trackEventAction(input: TrackEventInput): Promise<{ ok: boolean }> {
  const parsed = trackEventInput.safeParse(input);
  if (!parsed.success) return { ok: false };
  trackEvent(parsed.data.eventName, { path: parsed.data.path });
  return { ok: true };
}
