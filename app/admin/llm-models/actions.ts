"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperadmin } from "@/lib/supabase/guards";
import { withAuditFields, withModifiedDatetime } from "@/lib/admin/schema";

function isMissingColumnError(error: { message?: string; code?: string }): boolean {
  const m = (error.message ?? "").toLowerCase();
  return (
    error.code === "PGRST204" ||
    (m.includes("column") && (m.includes("schema cache") || m.includes("does not exist")))
  );
}

async function insertLlmModelRow(
  supabase: ReturnType<typeof createAdminClient>,
  payload: {
    name: string;
    providerId: string | null;
    isActive: boolean;
    audit?: Record<string, unknown>;
  }
): Promise<{ error: { message: string; code?: string } | null }> {
  const base = { name: payload.name, is_active: payload.isActive };
  const tries: Record<string, unknown>[] = [
    { ...base, provider_id: payload.providerId || null, ...(payload.audit ?? {}) },
    { ...base, llm_provider_id: payload.providerId || null, ...(payload.audit ?? {}) },
  ];
  let last: { message: string; code?: string } | null = null;
  for (const insert of tries) {
    const { error } = await supabase.from("llm_models").insert(insert);
    if (!error) return { error: null };
    last = error;
    if (isMissingColumnError(error)) continue;
    return { error };
  }
  return { error: last };
}

export async function createLlmModel(formData: FormData): Promise<void> {
  const user = await requireSuperadmin();
  const name = String(formData.get("name") ?? "").trim();
  const providerId = String(formData.get("provider_id") ?? "").trim();
  const isActive = formData.get("is_active") === "true" || formData.get("is_active") === "on";
  if (!name) {
    redirect("/admin/llm-models?error=" + encodeURIComponent("Model name is required"));
  }

  const supabase = createAdminClient();
  const audit = await withAuditFields(supabase, "llm_models", {}, user.id, "create");
  const { error } = await insertLlmModelRow(supabase, {
    name,
    providerId: providerId || null,
    isActive,
    audit,
  });
  if (error) {
    redirect("/admin/llm-models?error=" + encodeURIComponent(error.message));
  }
  revalidatePath("/admin/llm-models");
}

export async function updateLlmModel(formData: FormData) {
  const user = await requireSuperadmin();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const providerId = String(formData.get("provider_id") ?? "").trim();
  const isActive = formData.get("is_active") === "true" || formData.get("is_active") === "on";
  if (!id || !name) return { error: "ID and model name required" };

  const supabase = createAdminClient();
  const { data: existing, error: fetchErr } = await supabase
    .from("llm_models")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (fetchErr) return { error: fetchErr.message };
  if (!existing) return { error: "Row not found" };

  const row = existing as Record<string, unknown>;
  let updates: Record<string, unknown> = {
    name,
    is_active: isActive,
  };
  const pid = providerId || null;
  if (Object.prototype.hasOwnProperty.call(row, "llm_provider_id")) {
    updates.llm_provider_id = pid;
  }
  if (Object.prototype.hasOwnProperty.call(row, "provider_id")) {
    updates.provider_id = pid;
  }
  if (!("llm_provider_id" in updates) && !("provider_id" in updates)) {
    updates.provider_id = pid;
  }

  updates = await withAuditFields(supabase, "llm_models", updates, user.id, "update");
  updates = await withModifiedDatetime(supabase, "llm_models", updates);

  const { error } = await supabase.from("llm_models").update(updates).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/llm-models");
  return { success: true };
}

export async function deleteLlmModel(formData: FormData) {
  await requireSuperadmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing id" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("llm_models").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/llm-models");
}
