import { verifySignature } from "./signature.ts";

interface NotifyPayload {
  readonly leadId: string;
  readonly regionCode: string;
}

interface Env {
  readonly hookSecret: string;
  readonly resendKey: string | null;
  readonly emailFrom: string | null;
  readonly emailTo: string | null;
  readonly waGatewayUrl: string | null;
  readonly waToken: string | null;
}

/**
 * Nama variabel mengikuti apps/backend/.env.example. `NOTIFY_WA_GATEWAY_TOKEN` (bukan
 * `NOTIFY_WA_TOKEN`) agar sejalan dengan kontrak variabel yang sudah ditegakkan gate
 * `check:env`.
 */
function readEnv(): Env {
  const optional = (name: string): string | null => {
    const value = Deno.env.get(name);
    return value === undefined || value.length === 0 ? null : value;
  };
  return {
    hookSecret: optional("NOTIFY_HOOK_SECRET") ?? "",
    resendKey: optional("RESEND_API_KEY"),
    emailFrom: optional("NOTIFY_EMAIL_FROM"),
    emailTo: optional("NOTIFY_EMAIL_TO"),
    waGatewayUrl: optional("NOTIFY_WA_GATEWAY_URL"),
    waToken: optional("NOTIFY_WA_GATEWAY_TOKEN"),
  };
}

function parsePayload(value: unknown): NotifyPayload | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  const leadId = record.leadId;
  const regionCode = record.regionCode;
  if (typeof leadId !== "string" || leadId.length === 0) return null;
  if (typeof regionCode !== "string" || regionCode.length === 0) return null;
  return { leadId, regionCode };
}

async function sendEmail(env: Env, payload: NotifyPayload, signal: AbortSignal): Promise<boolean> {
  if (env.resendKey === null || env.emailFrom === null || env.emailTo === null) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal,
    headers: {
      authorization: `Bearer ${env.resendKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.emailFrom,
      to: [env.emailTo],
      subject: `Lead sampel baru (${payload.regionCode})`,
      text: `Lead ${payload.leadId} dari wilayah ${payload.regionCode}. Buka dasbor Supabase untuk detail.`,
    }),
  });
  return response.ok;
}

async function sendWhatsapp(
  env: Env,
  payload: NotifyPayload,
  signal: AbortSignal,
): Promise<boolean> {
  if (env.waGatewayUrl === null) return false;
  const response = await fetch(env.waGatewayUrl, {
    method: "POST",
    signal,
    headers: {
      "content-type": "application/json",
      ...(env.waToken === null ? {} : { authorization: `Bearer ${env.waToken}` }),
    },
    body: JSON.stringify({ leadId: payload.leadId, regionCode: payload.regionCode }),
  });
  return response.ok;
}

Deno.serve(async (request: Request): Promise<Response> => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  const env = readEnv();
  if (env.hookSecret.length < 32) {
    return new Response(JSON.stringify({ error: "not_configured" }), {
      status: 503,
      headers: { "content-type": "application/json" },
    });
  }

  const rawBody = await request.text();
  const provided = request.headers.get("x-recbob-signature") ?? "";
  const valid = await verifySignature(rawBody, provided, env.hookSecret);
  if (!valid) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const payload = parsePayload(parsed);
  if (payload === null) {
    return new Response(JSON.stringify({ error: "invalid_payload" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const signal = AbortSignal.timeout(5_000);
  const results = await Promise.allSettled([
    sendEmail(env, payload, signal),
    sendWhatsapp(env, payload, signal),
  ]);

  const channels: string[] = [];
  for (const [index, result] of results.entries()) {
    const name = index === 0 ? "email" : "whatsapp";
    if (result.status === "fulfilled" && result.value) channels.push(name);
  }

  // Notifikasi bersifat best-effort (spec ADR-016): kanal yang tidak dikonfigurasi atau
  // gagal tidak membuat permintaan dianggap gagal.
  return new Response(JSON.stringify({ ok: true, channels }), {
    status: 202,
    headers: { "content-type": "application/json" },
  });
});
