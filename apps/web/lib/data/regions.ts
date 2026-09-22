import { REGION_CODES, type RegionCode } from "@recobid/shared/constants/regions";
import { demoRegions } from "@/lib/data/demo-data";
import { env } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface RegionOption {
  code: RegionCode;
  name: string;
}

const FALLBACK_NAMES: Record<RegionCode, string> = {
  jabar: "Jawa Barat",
  jateng: "Jawa Tengah",
  jatim: "Jawa Timur",
};

function fromDemo(): ReadonlyArray<RegionOption> {
  return demoRegions.map((region) => ({ code: region.code, name: region.name }));
}

/**
 * Daftar wilayah untuk pemilih di formulir. Jatuh ke bundel demo bila basis data tidak
 * terjangkau, sehingga formulir tidak pernah kosong.
 */
export async function getRegions(): Promise<ReadonlyArray<RegionOption>> {
  if (env.demoMode) return fromDemo();

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("region")
      .select("code, name")
      .order("name", { ascending: true });

    if (error !== null || data === null) {
      throw new Error(error?.message ?? "respons kosong");
    }

    const rows = data
      .map((row) => ({ code: row.code, name: row.name }))
      .filter((row): row is RegionOption => (REGION_CODES as readonly string[]).includes(row.code));

    return rows.length > 0 ? rows : fromDemo();
  } catch {
    return fromDemo();
  }
}

export function regionLabel(code: RegionCode, options: ReadonlyArray<RegionOption>): string {
  return options.find((option) => option.code === code)?.name ?? FALLBACK_NAMES[code];
}
