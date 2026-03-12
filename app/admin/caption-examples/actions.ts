"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperadmin } from "@/lib/supabase/guards";

export async function createCaptionExample(formData: FormData): Promise<void> {
  await requireSuperadmin();
  const exampleText = String(formData.get("example_text") ?? "").trim();
  const humorFlavorId = String(formData.get("humor_flavor_id") ?? "").trim();
  if (!exampleText) {
    redirect("/admin/caption-examples?error=" + encodeURIComponent("Example text is required"));
  }

  const supabase = createAdminClient();
  const insert: Record<string, unknown> = {
    example_text: exampleText,
  };
  if (humorFlavorId) insert.humor_flavor_id = humorFlavorId;

  const { error } = await supabase.from("caption_examples").insert(insert);
  if (error) {
    redirect("/admin/caption-examples?error=" + encodeURIComponent(error.message));
  }
  revalidatePath("/admin/caption-examples");
}

export async function updateCaptionExample(formData: FormData) {
  await requireSuperadmin();
  const id = String(formData.get("id") ?? "").trim();
  const exampleText = String(formData.get("example_text") ?? "").trim();
  const humorFlavorId = String(formData.get("humor_flavor_id") ?? "").trim();
  if (!id || !exampleText) return { error: "ID and example text required" };

  const supabase = createAdminClient();
  const updates: Record<string, unknown> = {
    example_text: exampleText,
    humor_flavor_id: humorFlavorId || null,
    modified_datetime_utc: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("caption_examples")
    .update(updates)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/caption-examples");
  return { success: true };
}

export async function deleteCaptionExample(formData: FormData) {
  await requireSuperadmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const supabase = createAdminClient();
  await supabase.from("caption_examples").delete().eq("id", id);
  revalidatePath("/admin/caption-examples");
}
