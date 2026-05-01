"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperadmin } from "@/lib/supabase/guards";
import { withAuditFields, withModifiedDatetime } from "@/lib/admin/schema";

function normalizeApexDomain(s: string): string {
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
  const apexDomain = normalizeApexDomain(String(formData.get("apex_domain") ?? ""));
  if (!apexDomain) {
    redirect(
      "/admin/allowed-signup-domains?error=" + encodeURIComponent("Apex domain is required")
    );
  }

  const supabase = createAdminClient();
  const audit = await withAuditFields(supabase, "allowed_signup_domains", {}, user.id, "create");
  const variants: Record<string, unknown>[] = [{ apex_domain: apexDomain, ...audit }];

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
  const apexDomain = normalizeApexDomain(String(formData.get("apex_domain") ?? ""));
  if (!id || !apexDomain) return { error: "ID and apex domain required" };

  const supabase = createAdminClient();
  let updates: Record<string, unknown> = {
    apex_domain: apexDomain,
  };

  updates = await withAuditFields(supabase, "allowed_signup_domains", updates, user.id, "update");
  updates = await withModifiedDatetime(supabase, "allowed_signup_domains", updates);

  const { error } = await supabase.from("allowed_signup_domains").update(updates).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/allowed-signup-domains");
  return { success: true };
}

export async function deleteAllowedSignupDomain(formData: FormData) {
  await requireSuperadmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing id" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("allowed_signup_domains").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/allowed-signup-domains");
}
