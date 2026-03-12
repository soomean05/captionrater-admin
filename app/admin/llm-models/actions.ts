"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperadmin } from "@/lib/supabase/guards";

export async function createLlmModel(formData: FormData): Promise<void> {
  await requireSuperadmin();
  const name = String(formData.get("name") ?? "").trim();
  const providerId = String(formData.get("provider_id") ?? "").trim();
  const isActive = formData.get("is_active") === "true" || formData.get("is_active") === "on";
  if (!name) {
    redirect("/admin/llm-models?error=" + encodeURIComponent("Model name is required"));
  }

  const supabase = createAdminClient();
  const insert: Record<string, unknown> = {
    name,
    is_active: isActive,
  };
  if (providerId) insert.provider_id = providerId;

  const { error } = await supabase.from("llm_models").insert(insert);
  if (error) {
    redirect("/admin/llm-models?error=" + encodeURIComponent(error.message));
  }
  revalidatePath("/admin/llm-models");
}

export async function updateLlmModel(formData: FormData) {
  await requireSuperadmin();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const providerId = String(formData.get("provider_id") ?? "").trim();
  const isActive = formData.get("is_active") === "true" || formData.get("is_active") === "on";
  if (!id || !name) return { error: "ID and model name required" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("llm_models")
    .update({
      name,
      provider_id: providerId || null,
      is_active: isActive,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/llm-models");
  return { success: true };
}

export async function deleteLlmModel(formData: FormData) {
  await requireSuperadmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const supabase = createAdminClient();
  await supabase.from("llm_models").delete().eq("id", id);
  revalidatePath("/admin/llm-models");
}
