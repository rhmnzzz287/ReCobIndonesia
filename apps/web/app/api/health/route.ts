import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Pemeriksaan kesiapan: menjawab 200 hanya bila tabel `region` dapat dibaca.
 * Dipakai sebelum demo di lokasi (Docs/PRD.md risiko R1).
 */
export async function GET(): Promise<NextResponse> {
  if (env.demoMode) {
    return NextResponse.json({ db: "ok", mode: "demo" }, { status: 200 });
  }

  try {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.from("region").select("code").limit(1);
    if (error !== null) {
      return NextResponse.json({ db: "down" }, { status: 503 });
    }
    return NextResponse.json({ db: "ok" }, { status: 200 });
  } catch {
    return NextResponse.json({ db: "down" }, { status: 503 });
  }
}
