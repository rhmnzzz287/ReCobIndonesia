"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowRight, Calculator as CalculatorIcon, Info } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { copy } from "@/content/copy";
import { cn } from "@/lib/utils/cn";
import { calculateFeedSavings, PERIOD_DAYS } from "@/lib/utils/feed-cost";
import { formatIdr, formatNumberId } from "@/lib/utils/format";
import { writeCattleCount } from "@/lib/utils/cattle-prefill";

export interface SavingsCalculatorProps {
  anchorPriceIdr: number;
  packWeightKg: number;
  /** Harga konsentrat pembanding bawaan, dibaca dari data produk resmi. */
  comparePriceIdr: number;
}

/** Rentang wajar; di luar ini hasilnya tetap dihitung, hanya ditandai sebagai tidak lazim. */
const CATTLE_MIN = 1;
const CATTLE_MAX = 10000;
const INTAKE_MIN = 0.5;
const INTAKE_MAX = 15;
/**
 * Batas harga pakan pabrik per karung 50 kg.
 *
 * Tanpa batas ini, satu digit yang salah ketik meledakkan persentase penghematan: masukan Rp123
 * menghasilkan "-130.069%" dan Rp1 menghasilkan "-19.199.900%", angka yang tidak berarti apa pun
 * bagi peternak dan membuat kartu hasil meluber keluar batasnya.
 */
const COMPARE_MIN = 50000;
const COMPARE_MAX = 1000000;

function rangeError(raw: string, min: number, max: number, message: string): string | null {
  if (raw.trim() === "") return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < min || value > max) return message;
  return null;
}

/**
 * Kalkulator penghematan: satu-satunya pulau interaktif baru di beranda.
 *
 * Semua aritmetika berada di `lib/utils/feed-cost.ts`, sehingga tidak ada rumus di dalam
 * komponen ini. `useState` menahan nilai sebagai string agar pengguna dapat mengosongkan
 * kolom tanpa nilai kolom melompat ke nol; konversi angka terjadi saat menghitung.
 */
export function SavingsCalculator({
  anchorPriceIdr,
  comparePriceIdr,
  packWeightKg,
}: SavingsCalculatorProps): ReactNode {
  const [cattle, setCattle] = useState("8");
  const [comparePrice, setComparePrice] = useState(String(comparePriceIdr));
  const [intake, setIntake] = useState("4");
  const fieldId = useId();

  const cattleError = rangeError(cattle, CATTLE_MIN, CATTLE_MAX, copy.calculator.errors.cattleRange);
  const compareError = rangeError(
    comparePrice,
    COMPARE_MIN,
    COMPARE_MAX,
    copy.calculator.errors.compareRange,
  );
  const intakeError = rangeError(intake, INTAKE_MIN, INTAKE_MAX, copy.calculator.errors.intakeRange);
  const hasFieldError = cattleError !== null || compareError !== null || intakeError !== null;

  // Di luar rentang wajar, hasilnya tidak dihitung sama sekali: menampilkan angka turunan dari
  // masukan yang jelas salah lebih membingungkan daripada menyatakan masukan itu perlu diperbaiki.
  const result = hasFieldError
    ? null
    : calculateFeedSavings({
        anchorPriceIdr,
        packWeightKg,
        cattleCount: Number(cattle),
        comparePricePerSackIdr: Number(comparePrice),
        intakeKgPerCowPerDay: Number(intake),
      });

  const anchorPricePerKg = Math.round(anchorPriceIdr / packWeightKg);
  const mathLine =
    result === null
      ? ""
      : copy.calculator.mathLine
          .replace("{kg}", formatNumberId(result.kgPerCowMonth))
          .replace("{recobPerKg}", formatIdr(Math.round(result.recobPricePerKg)))
          .replace("{recobPerCow}", formatIdr(result.recobCostPerCowMonth))
          .replace("{comparePerKg}", formatIdr(Math.round(result.comparePricePerKg)))
          .replace("{comparePerCow}", formatIdr(result.compareCostPerCowMonth));

  return (
    <div className="mt-2xl grid gap-xl lg:grid-cols-2">
      <div className="min-w-0 rounded-lg border border-border bg-surface p-xl" data-reveal="">
        <h3 className="type-h3 text-ink">{copy.calculator.inputsTitle}</h3>

        <div className="mt-lg grid gap-md">
          <div className="min-w-0">
            <Label htmlFor={`${fieldId}-cattle`} required>
              {copy.calculator.cattleLabel}
            </Label>
            <div className="flex items-center gap-xs">
              <Input
                aria-describedby={cattleError === null ? undefined : `${fieldId}-cattle-error`}
                id={`${fieldId}-cattle`}
                inputMode="numeric"
                invalid={cattleError !== null}
                max={CATTLE_MAX}
                min={CATTLE_MIN}
                onChange={(event) => setCattle(event.target.value)}
                type="number"
                value={cattle}
              />
              <span className="type-body-sm text-text-secondary">
                {copy.calculator.cattleUnit}
              </span>
            </div>
            {cattleError === null ? null : (
              <p className="mt-xs" id={`${fieldId}-cattle-error`}>
                <FieldError>{cattleError}</FieldError>
              </p>
            )}
          </div>

          <div className="min-w-0">
            <Label htmlFor={`${fieldId}-compare`} required>
              {copy.calculator.comparePriceLabel}
            </Label>
            <div className="flex items-center gap-xs">
              <Input
                aria-describedby={compareError === null ? undefined : `${fieldId}-compare-error`}
                id={`${fieldId}-compare`}
                inputMode="numeric"
                invalid={compareError !== null}
                max={COMPARE_MAX}
                min={COMPARE_MIN}
                onChange={(event) => setComparePrice(event.target.value)}
                step={1000}
                type="number"
                value={comparePrice}
              />
              <span className="type-body-sm text-text-secondary">
                {copy.calculator.comparePriceUnit}
              </span>
            </div>
            {compareError === null ? null : (
              <p className="mt-xs" id={`${fieldId}-compare-error`}>
                <FieldError>{compareError}</FieldError>
              </p>
            )}
          </div>

          <div className="min-w-0">
            <Label htmlFor={`${fieldId}-intake`} required>
              {copy.calculator.intakeLabel}
            </Label>
            <div className="flex items-center gap-xs">
              <Input
                aria-describedby={intakeError === null ? undefined : `${fieldId}-intake-error`}
                id={`${fieldId}-intake`}
                inputMode="decimal"
                invalid={intakeError !== null}
                max={INTAKE_MAX}
                min={INTAKE_MIN}
                onChange={(event) => setIntake(event.target.value)}
                step={0.5}
                type="number"
                value={intake}
              />
              <span className="type-body-sm text-text-secondary">
                {copy.calculator.intakeUnit}
              </span>
            </div>
            {intakeError === null ? null : (
              <p className="mt-xs" id={`${fieldId}-intake-error`}>
                <FieldError>{intakeError}</FieldError>
              </p>
            )}
          </div>
        </div>

        <div className="mt-lg rounded-sm bg-paper p-md">
          <p className="type-label-md uppercase text-text-secondary">
            {copy.calculator.anchorTitle}
          </p>
          <p className="mt-xs type-body-md text-ink">
            {copy.calculator.anchorPriceLabel}:{" "}
            <span className="font-mono-data text-primary-strong">
              {formatIdr(anchorPriceIdr)}
            </span>{" "}
            <span className="type-body-sm text-text-secondary">
              {copy.calculator.anchorPriceUnit}
            </span>
          </p>
          <p className="type-body-sm text-text-secondary">
            {copy.calculator.anchorPricePerKgLabel}:{" "}
            <span className="font-mono-data">{formatIdr(anchorPricePerKg)}</span>/kg
          </p>
          <p className="mt-xs flex items-start gap-xs type-caption text-text-secondary">
            <Info aria-hidden="true" className="mt-2xs shrink-0" size={16} strokeWidth={1.75} />
            {copy.calculator.anchorNote}
          </p>
        </div>
      </div>

      <div aria-live="polite" className="min-w-0 rounded-lg border border-border bg-surface p-xl">
        <h3 className="type-h3 text-ink">{copy.calculator.resultTitle}</h3>

        {result === null ? (
          <div className="mt-lg">
            <p className="type-body-md text-ink">{copy.calculator.invalidTitle}</p>
            <p className="mt-xs type-body-sm text-text-secondary">
              {copy.calculator.invalidBody}
            </p>
          </div>
        ) : (
          <>
            <dl className="mt-lg grid auto-rows-fr gap-md sm:grid-cols-2">
              {[
                {
                  label: copy.calculator.savingMonthlyLabel,
                  value: formatIdr(result.savingMonthly),
                  primary: true,
                },
                {
                  label: copy.calculator.savingYearlyLabel,
                  value: formatIdr(result.savingYearly),
                  primary: false,
                },
                {
                  label: copy.calculator.savingPerCowLabel,
                  value: formatIdr(result.savingPerCowMonth),
                  primary: false,
                },
                {
                  label: copy.calculator.savingPctLabel,
                  value: `${formatNumberId(Math.round(result.savingPct))}%`,
                  primary: false,
                },
              ].map((item, index) => (
                <div
                  className="min-w-0 rounded-sm bg-paper p-md"
                  key={item.label}
                  style={{ "--reveal-delay": `${index * 70}ms` } as CSSProperties}
                >
                  <dt className="type-label-md uppercase text-text-secondary">{item.label}</dt>
                  {/* Satu ukuran untuk semua kartu hasil: nilai terpanjang ("Rp16.128.000") tidak
                      lagi membungkus dua baris. Kartu total dibedakan lewat bobot dan warna,
                      bukan ukuran. */}
                  <dd
                    className={cn(
                      "mt-xs break-words type-h3",
                      item.primary ? "font-bold text-primary-strong" : "text-ink",
                    )}
                  >
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-md type-caption text-text-secondary">
              {copy.calculator.resultUnit}. {copy.calculator.kudNote}
            </p>

            {result.hasSaving ? null : (
              <div className="mt-md rounded-sm border border-amber-ink p-md">
                <p className="type-body-sm text-ink">{copy.calculator.noSavingTitle}</p>
                <p className="mt-xs type-body-sm text-text-secondary">
                  {copy.calculator.noSavingBody}
                </p>
              </div>
            )}

            <div className="mt-lg border-t border-border pt-md">
              <p className="type-label-md uppercase text-text-secondary">
                {copy.calculator.mathTitle}
              </p>
              <p className="mt-xs font-mono-data type-body-sm text-ink">{mathLine}</p>
            </div>

            <div className="mt-lg flex flex-col gap-sm">
              <ButtonLink
                href="/kontak#form-sampel"
                onClick={() => {
                  writeCattleCount(String(Math.round(result.cattleCount)));
                }}
                size="lg"
                variant="accent"
              >
                <CalculatorIcon aria-hidden="true" size={18} strokeWidth={1.75} />
                {copy.calculator.ctaLabel}
                <ArrowRight aria-hidden="true" size={18} strokeWidth={1.75} />
              </ButtonLink>
              <p className="type-caption text-text-secondary">{copy.calculator.ctaNote}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Periode hari dipakai di uji silang; diekspor ulang agar komponen tidak menduplikasi angka. */
export { PERIOD_DAYS };
