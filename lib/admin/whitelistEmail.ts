import type { SupabaseClient } from "@supabase/supabase-js";

/** Try in this order so the real table is found first. */
export const WHITELIST_TABLE_CANDIDATES = [
  "whitelisted_emails",
  "whitelisted_email_addresses",
  "whitelist_email_addresses",
] as const;

function isMissingColumnError(error: { message?: string; code?: string }): boolean {
  const m = (error.message ?? "").toLowerCase();
  return (
    error.code === "PGRST204" ||
    (m.includes("column") && (m.includes("schema cache") || m.includes("does not exist")))
  );
}

export function getWhitelistEmailFromRow(row: Record<string, unknown>): string {
  const v = row.email ?? row.email_address ?? row.whitelisted_email ?? row.address;
  return v != null ? String(v) : "";
}

export function getWhitelistIdForRow(row: Record<string, unknown>): string {
  if (row.id != null && String(row.id).length > 0) return String(row.id);
  return getWhitelistEmailFromRow(row);
}

type TryFn = (table: string) => Promise<{ error: { message: string; code?: string } | null }>;

export async function tryWhitelistTables(
  fn: TryFn
): Promise<{ error: { message: string; code?: string } | null }> {
  let lastError: { message: string; code?: string } | null = null;
  for (const table of WHITELIST_TABLE_CANDIDATES) {
    const { error } = await fn(table);
    if (!error) return { error: null };
    lastError = error;
    if (error.code === "42P01") continue;
    break;
  }
  return { error: lastError };
}

export async function insertWhitelistedEmailRow(
  supabase: SupabaseClient,
  email: string,
  notes: string | null,
  extra: Record<string, unknown> = {}
): Promise<{ error: { message: string; code?: string } | null }> {
  const n = notes || null;
  const payloads: Record<string, unknown>[] = [
    { email, notes: n, ...extra },
    { email_address: email, notes: n, ...extra },
    { whitelisted_email: email, notes: n, ...extra },
  ];

  return tryWhitelistTables(async (table) => {
    let last: { message: string; code?: string } | null = null;
    for (const insert of payloads) {
      const { error } = await supabase.from(table).insert(insert);
      if (!error) return { error: null };
      last = error;
      if (isMissingColumnError(error)) continue;
      return { error };
    }
    return { error: last };
  });
}
