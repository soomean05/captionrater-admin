"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperadmin } from "@/lib/supabase/guards";
import { withAuditFields, withModifiedDatetime } from "@/lib/admin/schema";

function normalizeDomain(s: string): string {
  return s.trim().toLowerCase();
}

function isMissingColumnError(error: { message?: string; code?: string }): boolean {
  const m = (error.message ?? "").toLowerCase();
  return (
    error.code === "PGRST204" ||
    (m.includes("column") && (m.includes("schema cache") || m.includes("does not exist")))
  );
}

export async function createAllowedSignupDomain(formData: FormData): Promise<void> {
  const user = await requireSuperadmin();
  const domain = normalizeDomain(String(formData.get("domain") ?? ""));
  const isActive =
    formData.get("is_active") === "true" || formData.get("is_active") === "on";
  const isEnabled =
    formData.get("is_enabled") === "true" || formData.get("is_enabled") === "on";
  const enabled = isActive || isEnabled;
  if (!domain) {
    redirect(
      "/admin/allowed-signup-domains?error=" + encodeURIComponent("Domain is required")
    );
  }

  const supabase = createAdminClient();
  const audit = await withAuditFields(supabase, "allowed_signup_domains", {}, user.id, "create");
  const variants: Record<string, unknown>[] = [
    { domain, is_active: enabled, is_enabled: enabled, ...audit },
    { domain, is_active: enabled, ...audit },
    { domain, is_enabled: enabled, ...audit },
    { domain, ...audit },
  ];

  let lastErr: { message: string; code?: string } | null = null;
  for (const insert of variants) {
    const { error } = await supabase.from("allowed_signup_domains").insert(insert);
    if (!error) {
      revalidatePath("/admin/allowed-signup-domains");
      return;
    }
    lastErr = error;
    if (isMissingColumnError(error)) continue;
    redirect(
      "/admin/allowed-signup-domains?error=" + encodeURIComponent(error.message)
    );
  }

  redirect(
    "/admin/allowed-signup-domains?error=" +
      encodeURIComponent(lastErr?.message ?? "Insert failed")
  );
}

export async function updateAllowedSignupDomain(formData: FormData) {
  const user = await requireSuperadmin();
  const id = String(formData.get("id") ?? "").trim();
  const domain = normalizeDomain(String(formData.get("domain") ?? ""));
  const isActive =
    formData.get("is_active") === "true" || formData.get("is_active") === "on";
  const isEnabled =
    formData.get("is_enabled") === "true" || formData.get("is_enabled") === "on";
  const enabled = isActive || isEnabled;
  if (!id || !domain) return { error: "ID and domain required" };

  const supabase = createAdminClient();
  const { data: existing, error: fetchErr } = await supabase
    .from("allowed_signup_domains")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) return { error: fetchErr.message };

  let updates: Record<string, unknown> = {
    domain,
  };

  if (existing && typeof existing === "object") {
    const row = existing as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(row, "is_active")) updates.is_active = enabled;
    if (Object.prototype.hasOwnProperty.call(row, "is_enabled")) updates.is_enabled = enabled;
  } else {
    updates.is_active = enabled;
  }

  updates = await withAuditFields(supabase, "allowed_signup_domains", updates, user.id, "update");
  updates = await withModifiedDatetime(supabase, "allowed_signup_domains", updates);

  let { error } = await supabase.from("allowed_signup_domains").update(updates).eq("id", id);
  if (error) {
    const r = await supabase.from("allowed_signup_domains").update(updates).eq("domain", id);
    error = r.error;
  }
  if (error) return { error: error.message };
  revalidatePath("/admin/allowed-signup-domains");
  return { success: true };
}

export async function deleteAllowedSignupDomain(formData: FormData) {
  await requireSuperadmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing id" };

  const supabase = createAdminClient();
  let { error } = await supabase.from("allowed_signup_domains").delete().eq("id", id);
  if (error) {
    const r = await supabase.from("allowed_signup_domains").delete().eq("domain", id);
    error = r.error;
  }
  if (error) return { error: error.message };
  revalidatePath("/admin/allowed-signup-domains");
}
