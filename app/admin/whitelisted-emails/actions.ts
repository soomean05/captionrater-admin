"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperadmin } from "@/lib/supabase/guards";

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
  const { error } = await supabase
    .from("whitelisted_email_addresses")
    .insert({ email, notes: notes || null });
  if (error) {
    redirect("/admin/whitelisted-emails?error=" + encodeURIComponent(error.message));
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
  const { error } = await supabase
    .from("whitelisted_email_addresses")
    .update({
      email,
      notes: notes || null,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/whitelisted-emails");
  return { success: true };
}

export async function deleteWhitelistedEmail(formData: FormData) {
  await requireSuperadmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const supabase = createAdminClient();
  await supabase
    .from("whitelisted_email_addresses")
    .delete()
    .eq("id", id);
  revalidatePath("/admin/whitelisted-emails");
}
