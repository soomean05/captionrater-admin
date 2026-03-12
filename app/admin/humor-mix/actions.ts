"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperadmin } from "@/lib/supabase/guards";

export async function updateHumorMix(formData: FormData) {
  await requireSuperadmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing id" };

  const supabase = createAdminClient();
  const updates: Record<string, unknown> = {};
  const valueStr = formData.get("value");
  if (valueStr != null && valueStr !== "") {
    try {
      updates.description = JSON.parse(valueStr as string);
    } catch {
      updates.description = valueStr;
    }
  }
  const name = formData.get("name");
  if (name != null && name !== "") updates.name = name;

  if (Object.keys(updates).length === 0) return { error: "No fields to update" };
  updates.modified_datetime_utc = new Date().toISOString();

  const { error } = await supabase.from("humor_themes").update(updates).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/humor-mix");
  return { success: true };
}
