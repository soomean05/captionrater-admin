"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperadmin } from "@/lib/supabase/guards";
import { withAuditFields, withModifiedDatetime } from "@/lib/admin/schema";

export async function createLlmModel(formData: FormData): Promise<void> {
  const user = await requireSuperadmin();
  const name = String(formData.get("name") ?? "").trim();
  const providerId = String(formData.get("llm_provider_id") ?? "").trim();
  const providerModelId = String(formData.get("provider_model_id") ?? "").trim();
  if (!name) {
    redirect("/admin/llm-models?error=" + encodeURIComponent("Model name is required"));
  }
  if (!providerId) {
    redirect("/admin/llm-models?error=" + encodeURIComponent("Provider is required"));
  }
  if (!providerModelId) {
    redirect(
      "/admin/llm-models?error=" + encodeURIComponent("Provider Model ID is required")
    );
  }

  const supabase = createAdminClient();
  let payload: Record<string, unknown> = {
    name,
    llm_provider_id: providerId,
    provider_model_id: providerModelId,
  };
  payload = await withAuditFields(supabase, "llm_models", payload, user.id, "create");
  const { error } = await supabase.from("llm_models").insert(payload);
  if (error) {
    redirect("/admin/llm-models?error=" + encodeURIComponent(error.message));
  }
  revalidatePath("/admin/llm-models");
}

export async function updateLlmModel(formData: FormData) {
  const user = await requireSuperadmin();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const providerId = String(formData.get("llm_provider_id") ?? "").trim();
  const providerModelId = String(formData.get("provider_model_id") ?? "").trim();
  if (!id || !name) return { error: "ID and model name required" };
  if (!providerId) return { error: "Provider is required" };
  if (!providerModelId) return { error: "Provider Model ID is required" };

  const supabase = createAdminClient();
  const { data: existing, error: fetchErr } = await supabase
    .from("llm_models")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (fetchErr) return { error: fetchErr.message };
  if (!existing) return { error: "Row not found" };

  let updates: Record<string, unknown> = {
    name,
    llm_provider_id: providerId,
    provider_model_id: providerModelId,
  };

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
