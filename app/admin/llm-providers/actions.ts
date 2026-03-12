"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperadmin } from "@/lib/supabase/guards";

export async function createLlmProvider(formData: FormData): Promise<void> {
  await requireSuperadmin();
  const name = String(formData.get("name") ?? "").trim();
  const baseUrl = String(formData.get("base_url") ?? "").trim();
  const apiType = String(formData.get("api_type") ?? "").trim();
  const isActive = formData.get("is_active") === "true" || formData.get("is_active") === "on";
  if (!name) {
    redirect("/admin/llm-providers?error=" + encodeURIComponent("Name is required"));
  }

  const supabase = createAdminClient();
  const insert: Record<string, unknown> = {
    name,
    is_active: isActive,
  };
  if (baseUrl) insert.base_url = baseUrl;
  if (apiType) insert.api_type = apiType;

  const { error } = await supabase.from("llm_providers").insert(insert);
  if (error) {
    redirect("/admin/llm-providers?error=" + encodeURIComponent(error.message));
  }
  revalidatePath("/admin/llm-providers");
}

export async function updateLlmProvider(formData: FormData) {
  await requireSuperadmin();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const baseUrl = String(formData.get("base_url") ?? "").trim();
  const apiType = String(formData.get("api_type") ?? "").trim();
  const isActive = formData.get("is_active") === "true" || formData.get("is_active") === "on";
  if (!id || !name) return { error: "ID and name required" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("llm_providers")
    .update({
      name,
      base_url: baseUrl || null,
      api_type: apiType || null,
      is_active: isActive,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/llm-providers");
  return { success: true };
}

export async function deleteLlmProvider(formData: FormData) {
  await requireSuperadmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const supabase = createAdminClient();
  await supabase.from("llm_providers").delete().eq("id", id);
  revalidatePath("/admin/llm-providers");
}
