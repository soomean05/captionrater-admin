"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperadmin } from "@/lib/supabase/guards";

function normalizeDomain(s: string): string {
  return s.trim().toLowerCase();
}

export async function createAllowedSignupDomain(formData: FormData): Promise<void> {
  await requireSuperadmin();
  const domain = normalizeDomain(String(formData.get("domain") ?? ""));
  const isActive =
    formData.get("is_active") === "true" || formData.get("is_active") === "on";
  const isEnabled =
    formData.get("is_enabled") === "true" ||
    formData.get("is_enabled") === "on";
  const enabled = isActive || isEnabled;
  if (!domain) {
    redirect("/admin/allowed-signup-domains?error=" + encodeURIComponent("Domain is required"));
  }

  const supabase = createAdminClient();
  const insert: Record<string, unknown> = {
    domain,
    is_active: enabled,
  };

  const { error } = await supabase
    .from("allowed_signup_domains")
    .insert(insert);
  if (error) {
    redirect("/admin/allowed-signup-domains?error=" + encodeURIComponent(error.message));
  }
  revalidatePath("/admin/allowed-signup-domains");
}

export async function updateAllowedSignupDomain(formData: FormData) {
  await requireSuperadmin();
  const id = String(formData.get("id") ?? "").trim();
  const domain = normalizeDomain(String(formData.get("domain") ?? ""));
  const isActive =
    formData.get("is_active") === "true" || formData.get("is_active") === "on";
  const isEnabled =
    formData.get("is_enabled") === "true" ||
    formData.get("is_enabled") === "on";
  const enabled = isActive || isEnabled;
  if (!id || !domain) return { error: "ID and domain required" };

  const supabase = createAdminClient();
  const updates: Record<string, unknown> = {
    domain,
    modified_datetime_utc: new Date().toISOString(),
  };
  updates.is_active = enabled;

  let { error } = await supabase
    .from("allowed_signup_domains")
    .update(updates)
    .eq("id", id);
  if (error) {
    const r = await supabase
      .from("allowed_signup_domains")
      .update(updates)
      .eq("domain", id);
    error = r.error;
  }
  if (error) return { error: error.message };
  revalidatePath("/admin/allowed-signup-domains");
  return { success: true };
}

export async function deleteAllowedSignupDomain(formData: FormData) {
  await requireSuperadmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const supabase = createAdminClient();
  let { error } = await supabase
    .from("allowed_signup_domains")
    .delete()
    .eq("id", id);
  if (error) {
    await supabase
      .from("allowed_signup_domains")
      .delete()
      .eq("domain", id);
  }
  revalidatePath("/admin/allowed-signup-domains");
}
