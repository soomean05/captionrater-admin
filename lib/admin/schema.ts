import type { SupabaseClient } from "@supabase/supabase-js";

type CacheKey = `${string}.${string}`;

const hasColumnCache = new Map<CacheKey, boolean>();

function isMissingColumnError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const m = (error.message ?? "").toLowerCase();
  return (
    error.code === "PGRST204" ||
    error.code === "42703" ||
    (m.includes("column") && (m.includes("does not exist") || m.includes("schema cache")))
  );
}

export async function tableHasColumn(
  supabase: SupabaseClient,
  table: string,
  column: string
): Promise<boolean> {
  const key: CacheKey = `${table}.${column}`;
  if (hasColumnCache.has(key)) return hasColumnCache.get(key) === true;

  const { error } = await supabase.from(table).select(column).limit(1);
  if (!error) {
    hasColumnCache.set(key, true);
    return true;
  }

  if (isMissingColumnError(error)) {
    hasColumnCache.set(key, false);
    return false;
  }

  // Unknown error: do not cache as false; fail closed for optional behavior.
  return false;
}

export async function pickExistingColumns(
  supabase: SupabaseClient,
  table: string,
  candidates: string[]
): Promise<string[]> {
  const checks = await Promise.all(
    candidates.map(async (c) => ({ column: c, exists: await tableHasColumn(supabase, table, c) }))
  );
  return checks.filter((c) => c.exists).map((c) => c.column);
}

export async function withAuditFields(
  supabase: SupabaseClient,
  table: string,
  payload: Record<string, unknown>,
  userId: string,
  mode: "create" | "update"
): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = { ...payload };
  if (mode === "create" && (await tableHasColumn(supabase, table, "created_by_user_id"))) {
    out.created_by_user_id = userId;
  }
  if (await tableHasColumn(supabase, table, "modified_by_user_id")) {
    out.modified_by_user_id = userId;
  }
  return out;
}

export async function withModifiedDatetime(
  supabase: SupabaseClient,
  table: string,
  payload: Record<string, unknown>
): Promise<Record<string, unknown>> {
  if (await tableHasColumn(supabase, table, "modified_datetime_utc")) {
    return {
      ...payload,
      modified_datetime_utc: new Date().toISOString(),
    };
  }
  return payload;
}

