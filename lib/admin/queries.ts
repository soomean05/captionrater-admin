import { createAdminClient } from "@/lib/supabase/admin";

const defaultOrderBy = "created_datetime_utc";

/**
 * Try multiple table names; return first successful result.
 * Use when the real table name might differ (e.g. whitelisted_emails vs whitelisted_email_addresses).
 */
export async function listTableWithFallback(
  tableNames: string[],
  orderBy?: string
): Promise<{ data: unknown[] | null; error: { message: string; code?: string; details?: string; hint?: string } | null; resolvedTable: string | null }> {
  const supabase = createAdminClient();
  let lastError: { message: string; code?: string; details?: string; hint?: string } | null = null;
  for (const table of tableNames) {
    let q = supabase.from(table).select("*");
    if (orderBy) q = q.order(orderBy, { ascending: false });
    const { data, error } = await q;
    if (!error) return { data: (data ?? []) as unknown[], error: null, resolvedTable: table };
    lastError = error;
    if (error.code === "42P01") continue;
    break;
  }
  return { data: null, error: lastError, resolvedTable: null };
}

export async function listProfiles() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order(defaultOrderBy, { ascending: false });
  return { data, error };
}

export async function listImages() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("images")
    .select("*")
    .order(defaultOrderBy, { ascending: false });
  return { data, error };
}

export async function listCaptions() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("captions")
    .select("*")
    .order(defaultOrderBy, { ascending: false });
  return { data, error };
}

export async function listTable(
  tableName: string,
  orderBy?: string
) {
  const supabase = createAdminClient();
  let q = supabase.from(tableName).select("*");
  if (orderBy) {
    q = q.order(orderBy, { ascending: false });
  }
  const { data, error } = await q;
  return { data, error };
}

export function getAdminClient() {
  return createAdminClient();
}
