import { NextResponse, type NextRequest } from "next/server";
import { submitLeadInput } from "@recobid/shared/contracts/lead";
import { submitLead } from "@/lib/data/leads";
import { logError, logInfo } from "@/lib/logging";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Jalur cadangan bila Server Action tidak dapat dijangkau. Kontrak hasilnya sama dengan
 * `submitLeadAction`: created | duplicate -> 200, invalid -> 400, rate_limited -> 429,
 * unavailable -> 503.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const forwarded = request.headers.get("x-forwarded-for");
  const key =
    forwarded !== null && forwarded.length > 0
      ? (forwarded.split(",")[0]?.trim() ?? "unknown")
      : "unknown";

  const limit = checkRateLimit(key);
  if (!limit.allowed) {
    return NextResponse.json({ status: "rate_limited" }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ status: "invalid" }, { status: 400 });
  }

  const parsed = submitLeadInput.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ status: "invalid" }, { status: 400 });
  }

  const result = await submitLead(parsed.data);
  if (result.status === "error") {
    logError("lead_api_failed", { code: result.code });
    return NextResponse.json({ status: "unavailable" }, { status: 503 });
  }

  logInfo("lead_api_accepted", {
    lead_created: result.status === "created",
    duplicate: result.status === "duplicate",
  });
  return NextResponse.json({ status: result.status }, { status: 200 });
}
