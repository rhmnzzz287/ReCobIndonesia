/**
 * Log terstruktur satu baris JSON. Tidak boleh memuat PII (nama, nomor telepon, alamat):
 * hanya kunci yang terdaftar di bawah yang diteruskan.
 */

export type LogFields = Partial<
  Record<
    | "request_id"
    | "path"
    | "status"
    | "duration_ms"
    | "lead_created"
    | "duplicate"
    | "event_name"
    | "notify"
    | "code"
    | "rate_limited",
    string | number | boolean
  >
>;

const ALLOWED_KEYS = new Set<string>([
  "request_id",
  "path",
  "status",
  "duration_ms",
  "lead_created",
  "duplicate",
  "event_name",
  "notify",
  "code",
  "rate_limited",
]);

function sanitize(fields: LogFields): Record<string, string | number | boolean> {
  const clean: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    if (!ALLOWED_KEYS.has(key)) continue;
    clean[key] = value;
  }
  return clean;
}

function write(level: "info" | "error", event: string, fields: LogFields): void {
  const line = JSON.stringify({ level, event, at: new Date().toISOString(), ...sanitize(fields) });
  // Aturan lint mengizinkan warn/error saja; keduanya tetap satu baris JSON.
  if (level === "error") {
    console.error(line);
    return;
  }
  console.warn(line);
}

export function logInfo(event: string, fields: LogFields = {}): void {
  write("info", event, fields);
}

export function logError(event: string, fields: LogFields = {}): void {
  write("error", event, fields);
}
