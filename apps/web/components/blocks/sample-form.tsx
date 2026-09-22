"use client";

import { submitLeadInput, type SubmitLeadInput } from "@recobid/shared/contracts/lead";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { copy } from "@/content/copy";
import type { RegionOption } from "@/lib/data/regions";
import { readCattleCount, subscribeCattleCount } from "@/lib/utils/cattle-prefill";

export interface SampleFormProps {
  regions: ReadonlyArray<RegionOption>;
}

type FormState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; duplicate: boolean }
  | { kind: "error"; message: string };

/**
 * Formulir permintaan sampel.
 *
 * `source` diisi "other": enum `lead_source` di basis data tidak memuat nilai "web", dan
 * formulir ini memang bukan kanal perolehan. Kanal dicatat lewat `utm`, bukan `source`.
 */
export function SampleForm({ regions }: SampleFormProps): ReactNode {
  const [state, setState] = useState<FormState>({ kind: "idle" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /**
   * Jumlah ternak dari kalkulator dibaca lewat `useSyncExternalStore`, bukan efek: server tidak
   * memiliki `sessionStorage`, sehingga nilai render pertama wajib "" agar markup server dan
   * klien identik (tanpa hydration mismatch). Kolom tetap tak-terkendali; nilainya dibaca dari
   * `FormData` saat kirim.
   */
  const cattlePrefill = useSyncExternalStore(
    subscribeCattleCount,
    readCattleCount,
    () => "",
  );

  async function handleSubmit(formData: FormData): Promise<void> {
    const honeypot = String(formData.get("companyWebsite") ?? "");
    const optionalText = (name: string): string | undefined => {
      const value = String(formData.get(name) ?? "").trim();
      return value.length === 0 ? undefined : value;
    };

    // Honeypot diperiksa lebih dulu: kolom ini bukan bagian kontrak dan akan ditolak
    // oleh skema `.strict()` bila ikut divalidasi.
    if (honeypot.trim().length > 0) {
      setState({ kind: "success", duplicate: false });
      return;
    }

    const candidate: SubmitLeadInput = {
      fullName: String(formData.get("fullName") ?? ""),
      phoneWa: String(formData.get("phoneWa") ?? ""),
      cattleCount: Number(formData.get("cattleCount") ?? 0),
      regionCode: String(formData.get("regionCode") ?? "") as SubmitLeadInput["regionCode"],
      kudSlug: optionalText("kudSlug"),
      message: optionalText("message"),
      source: "other",
      utm: {},
      idempotencyKey: crypto.randomUUID().replace(/-/gu, "").slice(0, 32),
    };

    if (formData.get("consent") === null) {
      setFieldErrors({ consent: copy.cta.form.errors.consentRequired });
      return;
    }

    const parsed = submitLeadInput.safeParse(candidate);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "generic");
        errors[key] = copy.cta.form.errors.generic;
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setState({ kind: "submitting" });

    const { submitLeadAction } = await import("@/app/actions/submit-lead");
    const result = await submitLeadAction({ ...parsed.data, companyWebsite: honeypot });

    if (result.status === "created" || result.status === "duplicate") {
      setState({ kind: "success", duplicate: result.status === "duplicate" });
      return;
    }

    setState({
      kind: "error",
      message:
        result.status === "rate_limited"
          ? copy.cta.form.rateLimitBody
          : result.status === "invalid"
            ? copy.cta.form.errorBody
            : copy.cta.form.demoModeBody,
    });
  }

  if (state.kind === "success") {
    return (
      <div className="rounded-lg border border-border bg-surface p-xl" role="status">
        <Badge tone="primary">
          {state.duplicate ? copy.cta.form.duplicateTitle : copy.cta.form.successTitle}
        </Badge>
        <p className="mt-md type-body-md text-text-secondary">
          {state.duplicate ? copy.cta.form.duplicateBody : copy.cta.form.successBody}
        </p>
        <p className="mt-xs type-body-sm text-text-secondary">{copy.cta.form.successNextStep}</p>
      </div>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="grid gap-md rounded-lg border border-border bg-surface p-xl"
      noValidate
    >
      <div>
        <Label htmlFor="fullName" required>
          {copy.cta.form.nameLabel}
        </Label>
        <Input
          autoComplete="name"
          id="fullName"
          invalid={fieldErrors.fullName !== undefined}
          name="fullName"
          placeholder={copy.cta.form.namePlaceholder}
        />
        {fieldErrors.fullName !== undefined ? <FieldError>{fieldErrors.fullName}</FieldError> : null}
      </div>

      <div>
        <Label htmlFor="phoneWa" required>
          {copy.cta.form.phoneLabel}
        </Label>
        <Input
          autoComplete="tel"
          id="phoneWa"
          inputMode="tel"
          invalid={fieldErrors.phoneWa !== undefined}
          name="phoneWa"
          placeholder={copy.cta.form.phonePlaceholder}
        />
        <p className="mt-2xs type-caption text-text-secondary">{copy.cta.form.phoneHint}</p>
        {fieldErrors.phoneWa !== undefined ? <FieldError>{fieldErrors.phoneWa}</FieldError> : null}
      </div>

      <div>
        <Label htmlFor="cattleCount" required>
          {copy.cta.form.cattleLabel}
        </Label>
        <Input
          defaultValue={cattlePrefill}
          id="cattleCount"
          inputMode="numeric"
          invalid={fieldErrors.cattleCount !== undefined}
          key={cattlePrefill}
          name="cattleCount"
          placeholder={copy.cta.form.cattlePlaceholder}
          type="number"
        />
        {fieldErrors.cattleCount !== undefined ? (
          <FieldError>{fieldErrors.cattleCount}</FieldError>
        ) : null}
      </div>

      <div>
        <Label htmlFor="regionCode" required>
          {copy.cta.form.regionLabel}
        </Label>
        <select
          className="h-12 w-full rounded-sm border border-text-secondary bg-surface px-md type-body-md text-ink"
          defaultValue=""
          id="regionCode"
          name="regionCode"
        >
          <option disabled value="">
            {copy.cta.form.regionPlaceholder}
          </option>
          {regions.map((region) => (
            <option key={region.code} value={region.code}>
              {region.name}
            </option>
          ))}
        </select>
        {fieldErrors.regionCode !== undefined ? (
          <FieldError>{fieldErrors.regionCode}</FieldError>
        ) : null}
      </div>

      <div>
        <Label htmlFor="kudSlug">
          {copy.cta.form.kudLabel} ({copy.cta.form.kudOptional})
        </Label>
        <Input id="kudSlug" name="kudSlug" placeholder={copy.cta.form.kudPlaceholder} />
      </div>

      <div>
        <Label htmlFor="message">{copy.cta.form.messageLabel}</Label>
        <textarea
          className="min-h-24 w-full rounded-sm border border-text-secondary bg-surface p-md type-body-md text-ink"
          id="message"
          name="message"
          placeholder={copy.cta.form.messagePlaceholder}
        />
      </div>

      <div aria-hidden="true" className="hidden">
        <label htmlFor="companyWebsite">{copy.cta.form.honeypotLabel}</label>
        <input
          autoComplete="off"
          id="companyWebsite"
          name="companyWebsite"
          tabIndex={-1}
          type="text"
        />
      </div>

      <div className="flex items-start gap-xs">
        <input id="consent" name="consent" type="checkbox" value="true" />
        <Label htmlFor="consent">{copy.cta.form.consentLabel}</Label>
      </div>
      {fieldErrors.consent !== undefined ? <FieldError>{fieldErrors.consent}</FieldError> : null}

      {state.kind === "error" ? <FieldError>{state.message}</FieldError> : null}

      <Button disabled={state.kind === "submitting"} size="lg" type="submit" variant="accent">
        {state.kind === "submitting" ? copy.cta.form.submittingLabel : copy.cta.form.submitLabel}
      </Button>

      <p className="type-caption text-text-secondary">{copy.cta.form.consentLabel}</p>
    </form>
  );
}
