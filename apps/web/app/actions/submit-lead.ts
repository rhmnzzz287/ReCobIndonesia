"use server";

import { headers } from "next/headers";
import { submitLeadInput, type SubmitLeadInput } from "@recobid/shared/contracts/lead";
import { submitLead } from "@/lib/data/leads";
import { logError, logInfo } from "@/lib/logging";
import { checkRateLimit } from "@/lib/rate-limit";

export type SubmitLeadActionResult =
  | { status: "created" | "duplicate" }
  | { status: "rate_limited" }
  | { status: "invalid" }
  | { status: "unavailable" };

/**
 * `companyWebsite` adalah honeypot dan sengaja berada di luar `SubmitLeadInput` yang
 * bersifat `.strict()`: memasukkannya ke dalam skema akan membuat SETIAP pengiriman gagal
 * validasi. Diperiksa lebih dulu, sebelum validasi ketat dijalankan.
 */
export type SubmitLeadActionInput = SubmitLeadInput & { readonly companyWebsite: string };

function clientKey(headerList: Headers): string {
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded !== null && forwarded.length > 0) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return headerList.get("x-real-ip") ?? "unknown";
}

export async function submitLeadAction(input: SubmitLeadActionInput): Promise<SubmitLeadActionResult> {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();

  // Honeypot: bot mengisi kolom tersembunyi. Dibalas seperti sukses agar tidak membocorkan.
  if (input.companyWebsite.trim().length > 0) {
    logInfo("lead_honeypot", { request_id: requestId });
    return { status: "created" };
  }

  const { companyWebsite: _honeypot, ...leadFields } = input;
  const parsed = submitLeadInput.safeParse(leadFields);
  if (!parsed.success) {
    logInfo("lead_invalid", {
      request_id: requestId,
      code: parsed.error.issues.map((issue) => issue.path.join(".")).join(","),
    });
    return { status: "invalid" };
  }

  const headerList = await headers();
  const limit = checkRateLimit(clientKey(headerList));
  if (!limit.allowed) {
    logInfo("lead_rate_limited", { request_id: requestId, rate_limited: true });
    return { status: "rate_limited" };
  }

  const result = await submitLead(parsed.data);
  const durationMs = Date.now() - startedAt;

  if (result.status === "error") {
    logError("lead_failed", { request_id: requestId, code: result.code, duration_ms: durationMs });
    return { status: "unavailable" };
  }

  logInfo("lead_accepted", {
    request_id: requestId,
    lead_created: result.status === "created",
    duplicate: result.status === "duplicate",
    duration_ms: durationMs,
  });

  if (result.status === "created") {
    // Fire-and-forget: kegagalan notifikasi tidak pernah menggagalkan penerimaan lead
    // (spec ADR-016).
    void notifyLead(requestId, result.leadId, parsed.data);
  }

  return { status: result.status };
}

async function notifyLead(
  requestId: string,
  leadId: string,
  input: SubmitLeadInput,
): Promise<void> {
  const [{ env }, { fetchWithTimeout }] = await Promise.all([
    import("@/lib/env"),
    import("@/lib/http"),
  ]);
  if (env.notifyHookUrl === null || env.notifyHookSecret === null) return;

  try {
    const body = JSON.stringify({ leadId, regionCode: input.regionCode });
    const signature = await signBody(body, env.notifyHookSecret);
    const response = await fetchWithTimeout(
      env.notifyHookUrl,
      {
        method: "POST",
        headers: { "content-type": "application/json", "x-recbob-signature": signature },
        body,
      },
      2_000,
    );
    if (!response.ok) {
      logError("notify_failed", { request_id: requestId, status: response.status });
    }
  } catch (error) {
    logError("notify_failed", {
      request_id: requestId,
      code: error instanceof Error ? error.message : "unknown",
    });
  }
}

/** HMAC-SHA256 heksadesimal; Edge Function memverifikasi tanda tangan yang sama. */
async function signBody(body: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
