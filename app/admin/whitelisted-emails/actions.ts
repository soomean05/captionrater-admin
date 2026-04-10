"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperadmin } from "@/lib/supabase/guards";
import { formatSupabaseError } from "@/lib/admin/formatError";
import {
  insertWhitelistedEmailRow,
  tryWhitelistTables,
} from "@/lib/admin/whitelistEmail";

function normalizeEmail(s: string): string {
  return s.trim().toLowerCase();
}

export async function createWhitelistedEmail(formData: FormData): Promise<void> {
  await requireSuperadmin();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const notes = String(formData.get("notes") ?? "").trim();
  if (!email) {
    redirect("/admin/whitelisted-emails?error=" + encodeURIComponent("Email is required"));
  }

  const supabase = createAdminClient();
  const { error } = await insertWhitelistedEmailRow(supabase, email, notes || null);
  if (error) {
    redirect(
      "/admin/whitelisted-emails?error=" +
        encodeURIComponent(formatSupabaseError(error) ?? error.message)
    );
  }
  revalidatePath("/admin/whitelisted-emails");
}

export async function updateWhitelistedEmail(formData: FormData) {
  await requireSuperadmin();
  const id = String(formData.get("id") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const notes = String(formData.get("notes") ?? "").trim();
  if (!id || !email) return { error: "ID and email required" };

  const supabase = createAdminClient();
  const ts = new Date().toISOString();
  const n = notes || null;

  const { error } = await tryWhitelistTables(async (table) => {
    const variants: Record<string, unknown>[] = [
      { email, notes: n, modified_datetime_utc: ts },
      { email_address: email, notes: n, modified_datetime_utc: ts },
      { whitelisted_email: email, notes: n, modified_datetime_utc: ts },
    ];

    let last: { message: string; code?: string } | null = null;
    for (const updates of variants) {
      let r = await supabase.from(table).update(updates).eq("id", id);
      if (!r.error) return { error: null };
      last = r.error;

      r = await supabase.from(table).update(updates).eq("email", id);
      if (!r.error) return { error: null };

      r = await supabase.from(table).update(updates).eq("email_address", id);
      if (!r.error) return { error: null };

      r = await supabase.from(table).update(updates).eq("whitelisted_email", id);
      if (!r.error) return { error: null };
    }
    return { error: last };
  });

  if (error) return { error: formatSupabaseError(error) ?? error.message };
  revalidatePath("/admin/whitelisted-emails");
  return { success: true };
}

export async function deleteWhitelistedEmail(formData: FormData) {
  await requireSuperadmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing id" };

  const supabase = createAdminClient();
  const { error } = await tryWhitelistTables(async (table) => {
    let r = await supabase.from(table).delete().eq("id", id);
    if (!r.error) return { error: null };

    r = await supabase.from(table).delete().eq("email", id);
    if (!r.error) return { error: null };

    r = await supabase.from(table).delete().eq("email_address", id);
    if (!r.error) return { error: null };

    return supabase.from(table).delete().eq("whitelisted_email", id);
  });

  if (error) return { error: formatSupabaseError(error) ?? error.message };
  revalidatePath("/admin/whitelisted-emails");
}
