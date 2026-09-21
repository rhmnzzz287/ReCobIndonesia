export const REGION_CODES = ["jabar", "jateng", "jatim"] as const;

export type RegionCode = (typeof REGION_CODES)[number];

export const REGION_LABELS: Record<RegionCode, string> = {
  jabar: "Jawa Barat",
  jateng: "Jawa Tengah",
  jatim: "Jawa Timur",
};
