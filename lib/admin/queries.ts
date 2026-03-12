import { createAdminClient } from "@/lib/supabase/admin";

const defaultOrderBy = "created_datetime_utc";

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
