import { createAdminClient } from "@/lib/supabase/admin";

const defaultOrderBy = "created_datetime_utc";

function isOrderColumnError(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const m = (error.message ?? "").toLowerCase();
  return (
    error.code === "42703" ||
    m.includes("column") && (m.includes("does not exist") || m.includes("unknown"))
  );
}

const ORDER_FALLBACKS = [
  "created_datetime_utc",
  "created_at",
  "inserted_at",
  "updated_at",
  "id",
] as const;

/**
 * Select from a table with a working ORDER BY (tries common timestamp/id columns).
 */
export async function listTableWithSmartOrder(
  tableName: string,
  preferOrder?: string
): Promise<{ data: unknown[] | null; error: { message: string; code?: string } | null }> {
  const supabase = createAdminClient();
  const candidates = preferOrder
    ? [preferOrder, ...ORDER_FALLBACKS.filter((c) => c !== preferOrder)]
    : [...ORDER_FALLBACKS];

  for (const col of candidates) {
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .order(col, { ascending: false });
    if (!error) return { data: data ?? [], error: null };
    if (!isOrderColumnError(error)) return { data: null, error };
  }

  const { data, error } = await supabase.from(tableName).select("*");
  return { data: data ?? [], error };
}

/**
 * Paginated list with server-side range() and count.
 */
export async function listTablePaginated(
  tableName: string,
  page: number,
  pageSize: number,
  preferOrder?: string,
  selectColumns = "*"
): Promise<{
  data: unknown[] | null;
  error: { message: string; code?: string } | null;
  count: number | null;
}> {
  const supabase = createAdminClient();
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  const candidates = preferOrder
    ? [preferOrder, ...ORDER_FALLBACKS.filter((c) => c !== preferOrder)]
    : [...ORDER_FALLBACKS];

  for (const col of candidates) {
    const { data, error, count } = await supabase
      .from(tableName)
      .select(selectColumns, { count: "exact" })
      .order(col, { ascending: false })
      .range(from, to);
    if (!error) return { data: data ?? [], error: null, count: count ?? 0 };
    if (!isOrderColumnError(error)) return { data: null, error, count: null };
  }

  const { data, error, count } = await supabase
    .from(tableName)
    .select(selectColumns, { count: "exact" })
    .range(from, to);
  return { data: data ?? [], error, count: count ?? 0 };
}

/**
 * Paginated fallback across candidate table names (e.g. whitelisted email tables).
 */
export async function listTableWithFallbackPaginated(
  tableNames: string[],
  page: number,
  pageSize: number,
  orderBy?: string,
  selectColumns = "*"
): Promise<{
  data: unknown[] | null;
  error: { message: string; code?: string; details?: string; hint?: string } | null;
  resolvedTable: string | null;
  count: number | null;
}> {
  const supabase = createAdminClient();
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;
  let lastError: { message: string; code?: string; details?: string; hint?: string } | null =
    null;

  outer: for (const table of tableNames) {
    const prefer = orderBy ?? defaultOrderBy;
    const candidates = [prefer, ...ORDER_FALLBACKS.filter((c) => c !== prefer)];

    for (const col of candidates) {
      const { data, error, count } = await supabase
        .from(table)
        .select(selectColumns, { count: "exact" })
        .order(col, { ascending: false })
        .range(from, to);
      if (!error) {
        return { data: data ?? [], error: null, resolvedTable: table, count: count ?? 0 };
      }
      if (error.code === "42P01") {
        lastError = error;
        continue outer;
      }
      if (!isOrderColumnError(error)) {
        lastError = error;
        break;
      }
    }

    const { data, error, count } = await supabase
      .from(table)
      .select(selectColumns, { count: "exact" })
      .range(from, to);
    if (!error) {
      return { data: data ?? [], error: null, resolvedTable: table, count: count ?? 0 };
    }
    if (error.code === "42P01") {
      lastError = error;
      continue;
    }
    lastError = error;
  }

  return { data: null, error: lastError, resolvedTable: null, count: null };
}

/** humor_flavor_steps: stable sort by flavor + step when columns exist. */
export async function listHumorFlavorStepsPaginated(
  page: number,
  pageSize: number
): Promise<{
  data: unknown[] | null;
  error: { message: string; code?: string } | null;
  count: number | null;
}> {
  const supabase = createAdminClient();
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  let result = await supabase
    .from("humor_flavor_steps")
    .select("*", { count: "exact" })
    .order("humor_flavor_id", { ascending: true })
    .order("step_number", { ascending: true })
    .range(from, to);

  if (result.error?.code === "42703" || isOrderColumnError(result.error)) {
    result = await supabase
      .from("humor_flavor_steps")
      .select("*", { count: "exact" })
      .range(from, to);
  }

  const { data, error, count } = result;
  return { data: data ?? [], error, count: count ?? 0 };
}

/**
 * Try multiple table names; return first successful result with smart ordering per table.
 */
export async function listTableWithFallback(
  tableNames: string[],
  orderBy?: string
): Promise<{ data: unknown[] | null; error: { message: string; code?: string; details?: string; hint?: string } | null; resolvedTable: string | null }> {
  const supabase = createAdminClient();
  let lastError: { message: string; code?: string; details?: string; hint?: string } | null = null;

  outer: for (const table of tableNames) {
    const prefer = orderBy ?? defaultOrderBy;
    const candidates = [prefer, ...ORDER_FALLBACKS.filter((c) => c !== prefer)];

    for (const col of candidates) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order(col, { ascending: false });
      if (!error) {
        return { data: data ?? [], error: null, resolvedTable: table };
      }
      if (error.code === "42P01") {
        lastError = error;
        continue outer;
      }
      if (!isOrderColumnError(error)) {
        lastError = error;
        break;
      }
    }

    const { data, error } = await supabase.from(table).select("*");
    if (!error) {
      return { data: data ?? [], error: null, resolvedTable: table };
    }
    if (error.code === "42P01") {
      lastError = error;
      continue;
    }
    lastError = error;
  }

  return { data: null, error: lastError, resolvedTable: null };
}

export async function listProfiles() {
  return listTableWithSmartOrder("profiles");
}

export async function listImages() {
  return listTableWithSmartOrder("images");
}

export async function listCaptions() {
  return listTableWithSmartOrder("captions");
}

/** @deprecated Prefer listTableWithSmartOrder */
export async function listTable(tableName: string, orderBy?: string) {
  return listTableWithSmartOrder(tableName, orderBy);
}

export function getAdminClient() {
  return createAdminClient();
}
