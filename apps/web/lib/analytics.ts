import type { FunnelEventName } from "@recobid/shared/constants/funnel-events";
import { logInfo } from "@/lib/logging";

export interface FunnelPayload {
  readonly regionCode?: string;
  readonly path?: string;
}

/**
 * Funnel internal memakai `lead_event` di basis data dan log terstruktur di server.
 * Tidak ada penyimpanan di sisi peramban: tanpa cookie pihak ketiga (Docs/PRD.md Bagian 9).
 * Hanya kunci yang diizinkan `lib/logging` yang diteruskan, sehingga tidak ada PII.
 */
export function trackEvent(name: FunnelEventName, payload: FunnelPayload = {}): void {
  logInfo("funnel", {
    event_name: name,
    ...(payload.path === undefined ? {} : { path: payload.path }),
  });
}
