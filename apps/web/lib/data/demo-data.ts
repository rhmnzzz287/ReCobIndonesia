/**
 * BERKAS INI DIHASILKAN oleh `npm run demo:export` di apps/backend.
 * Sumber: basis data tertaut. Jangan diedit tangan.
 * Wajib dihasilkan ulang sebelum demo pitching (spec ADR-020).
 */

import type { RegionCode } from "@recobid/shared/constants/regions";

export interface DemoProduct {
  slug: string;
  name: string;
  description: string;
  unit: string;
  packWeightKg: number;
  priceIdr: number;
  comparePriceIdr: number | null;
  proteinPct: number | null;
  category: string;
  imagePath: string | null;
}

export interface DemoIngredient {
  name: string;
  shareMinPct: number;
  shareMaxPct: number;
  functionLabel: string;
  sortOrder: number;
}

export interface DemoMetricReference {
  citationLabel: string;
  citationUrl: string | null;
  assumptionNote: string;
}

export interface DemoMetric {
  code: string;
  label: string;
  valueNumeric: number;
  unit: "ton" | "kg" | "rupiah" | "liter" | "count" | "percent";
  period: "daily" | "weekly" | "monthly" | "yearly" | "cumulative";
  periodLabel: string;
  isDemo: true;
  references: ReadonlyArray<DemoMetricReference>;
}

export interface DemoMetricWithoutReference {
  code: string;
  label: string;
  isPublic: false;
  withheldReason: string;
}

export const demoRegions: ReadonlyArray<{ code: RegionCode; name: string }> = [
  {
    "code": "jabar",
    "name": "Jawa Barat"
  },
  {
    "code": "jateng",
    "name": "Jawa Tengah"
  },
  {
    "code": "jatim",
    "name": "Jawa Timur"
  }
];

export const demoProducts: ReadonlyArray<DemoProduct> = [
  {
    "slug": "recob-pelet-50kg",
    "name": "ReCob.id Pelet Konsentrat 50 kg",
    "description": "Pelet konsentrat sapi perah dari bonggol jagung dan ampas tahu terfermentasi, dikeringkan dan dipres menjadi pelet.",
    "unit": "karung",
    "packWeightKg": 50,
    "priceIdr": 160000,
    "comparePriceIdr": 200000,
    "proteinPct": 16,
    "category": "Sapi Perah",
    "imagePath": "/img/produk/karung-50kg.webp"
  }
];

export const demoProduct: DemoProduct = demoProducts[0]!;

export const demoIngredients: ReadonlyArray<DemoIngredient> = [
  {
    "name": "Bonggol jagung terfermentasi",
    "shareMinPct": 50,
    "shareMaxPct": 55,
    "functionLabel": "Sumber energi & serat, menekan biaya pakan",
    "sortOrder": 1
  },
  {
    "name": "Ampas tahu terfermentasi",
    "shareMinPct": 35,
    "shareMaxPct": 40,
    "functionLabel": "Sumber protein utama hasil biokonversi",
    "sortOrder": 2
  },
  {
    "name": "Molase (tetes tebu)",
    "shareMinPct": 5,
    "shareMaxPct": 10,
    "functionLabel": "Pengikat pelet, penambah palatabilitas",
    "sortOrder": 3
  }
];

export const demoMetrics: ReadonlyArray<DemoMetric> = [
  {
    "code": "corn_cob_potential_national",
    "label": "Potensi limbah bonggol jagung nasional",
    "valueNumeric": 4600000,
    "unit": "ton",
    "period": "yearly",
    "periodLabel": "2022",
    "isDemo": true,
    "references": [
      {
        "citationLabel": "BPS (2022), Analisis produktivitas jagung dan kedelai di Indonesia 2021",
        "citationUrl": "https://www.bps.go.id",
        "assumptionNote": "Rentang nasional 3,45-4,6 juta ton per tahun; angka yang ditampilkan memakai batas atas."
      }
    ]
  },
  {
    "code": "saving_per_sack_50kg",
    "label": "Penghematan biaya per karung 50 kg",
    "valueNumeric": 40000,
    "unit": "rupiah",
    "period": "monthly",
    "periodLabel": "per karung",
    "isDemo": true,
    "references": [
      {
        "citationLabel": "Harga dokumen sumber: Rp160.000 vs Rp180.000-200.000 per karung 50 kg",
        "citationUrl": null,
        "assumptionNote": "Selisih harga di gudang KUD mitra di sentra susu Jawa Barat dan Jawa Tengah, karung neto 50 kg."
      }
    ]
  },
  {
    "code": "saving_per_cow_month",
    "label": "Penghematan per ekor per bulan",
    "valueNumeric": 96000,
    "unit": "rupiah",
    "period": "monthly",
    "periodLabel": "per ekor",
    "isDemo": true,
    "references": [
      {
        "citationLabel": "Turunan dari penghematan per karung",
        "citationUrl": null,
        "assumptionNote": "Asumsi konsumsi konsentrat 4 kg per ekor per hari selama 30 hari."
      }
    ]
  },
  {
    "code": "saving_per_10_cow_month",
    "label": "Penghematan peternak 10 ekor per bulan",
    "valueNumeric": 960000,
    "unit": "rupiah",
    "period": "monthly",
    "periodLabel": "10 ekor",
    "isDemo": true,
    "references": [
      {
        "citationLabel": "Turunan dari penghematan per ekor per bulan",
        "citationUrl": null,
        "assumptionNote": "Asumsi populasi 10 ekor dengan konsumsi 4 kg per ekor per hari selama 30 hari."
      }
    ]
  },
  {
    "code": "milk_yield_claim",
    "label": "Potensi kenaikan produksi susu",
    "valueNumeric": 2,
    "unit": "liter",
    "period": "daily",
    "periodLabel": "per ekor",
    "isDemo": true,
    "references": [
      {
        "citationLabel": "Klaim dokumen sumber, menunggu validasi lapangan",
        "citationUrl": null,
        "assumptionNote": "Klaim berbasis kajian: 1-2 liter per ekor per hari. Bukan capaian terbukti; wajib dilabeli sebagai klaim yang sedang diuji."
      }
    ]
  }
];

/**
 * Metrik yang sengaja ditahan: tanpa sumber yang dapat dikutip, tidak ditampilkan di UI
 * (PRD Bagian 7.1). Dipisahkan dari demoMetrics agar tidak mungkin lolos ke tampilan.
 */
export const demoMetricsWithoutReference: ReadonlyArray<DemoMetricWithoutReference> = [
  {
    "code": "emission_avoided",
    "label": "Emisi pembakaran terbuka yang dihindari",
    "isPublic": false,
    "withheldReason": "Belum ada koefisien emisi resmi yang dapat dikutip. Metrik tanpa sumber tidak ditampilkan (PRD Bagian 7.1)."
  }
];

export const demoKudSlugs: readonly string[] = [
  "kpbs-pangalengan",
  "kud-cepogo",
  "kud-mojosongo",
  "kud-setia-kawan"
];
