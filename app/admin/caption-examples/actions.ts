"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperadmin } from "@/lib/supabase/guards";
import { insertCaptionExampleRow } from "@/lib/admin/captionExamples";
import { withAuditFields, withModifiedDatetime } from "@/lib/admin/schema";

export async function createCaptionExample(formData: FormData): Promise<void> {
  const user = await requireSuperadmin();
  const exampleText = String(formData.get("caption") ?? "").trim();
  const humorFlavorId = String(formData.get("humor_flavor_id") ?? "").trim();
  if (!exampleText) {
    redirect(
      "/admin/caption-examples?error=" + encodeURIComponent("Caption text is required")
    );
  }

  const supabase = createAdminClient();
  let payload: Record<string, unknown> & { text: string; humor_flavor_id: string | null } = {
    text: exampleText,
    humor_flavor_id: humorFlavorId || null,
  };
  payload = {
    ...payload,
    ...(await withAuditFields(supabase, "caption_examples", payload, user.id, "create")),
  };
  const { error } = await insertCaptionExampleRow(supabase, payload);
  if (error) {
    redirect("/admin/caption-examples?error=" + encodeURIComponent(error.message));
  }
  revalidatePath("/admin/caption-examples");
}

export async function updateCaptionExample(formData: FormData) {
  const user = await requireSuperadmin();
  const id = String(formData.get("id") ?? "").trim();
  const exampleText = String(formData.get("caption") ?? "").trim();
  const humorFlavorId = String(formData.get("humor_flavor_id") ?? "").trim();
  if (!id || !exampleText) return { error: "ID and caption text required" };

  const supabase = createAdminClient();
  const { data: existing, error: fetchErr } = await supabase
    .from("caption_examples")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (fetchErr) return { error: fetchErr.message };
  if (!existing) return { error: "Row not found" };

  const r = existing as Record<string, unknown>;
  let updates: Record<string, unknown> = {};
  updates.caption = exampleText;
  if (Object.prototype.hasOwnProperty.call(r, "humor_flavor_id")) {
    updates.humor_flavor_id = humorFlavorId || null;
  }

  updates = await withAuditFields(supabase, "caption_examples", updates, user.id, "update");
  updates = await withModifiedDatetime(supabase, "caption_examples", updates);

  const { error } = await supabase.from("caption_examples").update(updates).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/caption-examples");
  return { success: true };
}

export async function deleteCaptionExample(formData: FormData) {
  await requireSuperadmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing id" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("caption_examples").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/caption-examples");
}
