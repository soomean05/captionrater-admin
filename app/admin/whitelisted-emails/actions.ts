"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperadmin } from "@/lib/supabase/guards";
import { formatSupabaseError } from "@/lib/admin/formatError";

const TABLE_NAMES = ["whitelisted_email_addresses", "whitelisted_emails"] as const;

function normalizeEmail(s: string): string {
  return s.trim().toLowerCase();
}

async function tryTables(
  fn: (table: string) => Promise<{ error: { message: string; code?: string } | null }>
): Promise<{ error: { message: string; code?: string } | null }> {
  let lastError: { message: string; code?: string } | null = null;
  for (const table of TABLE_NAMES) {
    const { error } = await fn(table);
    if (!error) return { error: null };
    lastError = error;
    if (error.code === "42P01") continue;
    break;
  }
  return { error: lastError };
}

export async function createWhitelistedEmail(formData: FormData): Promise<void> {
  await requireSuperadmin();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const notes = String(formData.get("notes") ?? "").trim();
  if (!email) {
    redirect("/admin/whitelisted-emails?error=" + encodeURIComponent("Email is required"));
  }

  const supabase = createAdminClient();
  const { error } = await tryTables(async (table) => {
    const r = await supabase.from(table).insert({ email, notes: notes || null });
    return { error: r.error };
  });
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
  const { error } = await tryTables(async (table) => {
    const r = await supabase
      .from(table)
      .update({
        email,
        notes: notes || null,
        modified_datetime_utc: new Date().toISOString(),
      })
      .eq("id", id);
    return { error: r.error };
  });
  if (error) return { error: formatSupabaseError(error) ?? error.message };
  revalidatePath("/admin/whitelisted-emails");
  return { success: true };
}

export async function deleteWhitelistedEmail(formData: FormData) {
  await requireSuperadmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const supabase = createAdminClient();
  await tryTables(async (table) => {
    const r = await supabase.from(table).delete().eq("id", id);
    return { error: r.error };
  });
  revalidatePath("/admin/whitelisted-emails");
}
