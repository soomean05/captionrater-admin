"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperadmin } from "@/lib/supabase/guards";
import {
  pickExistingColumns,
  withAuditFields,
  withModifiedDatetime,
} from "@/lib/admin/schema";

const BUCKET = process.env.NEXT_PUBLIC_IMAGES_BUCKET ?? "images";

export async function createImage(formData: FormData) {
  const user = await requireSuperadmin();

  const supabase = createAdminClient();
  let url = String(formData.get("url") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const context = String(formData.get("context") ?? "").trim();
  const isPublic = formData.get("is_public") === "true" || formData.get("is_public") === "on";
  const isCommonUse =
    formData.get("is_common_use") === "true" || formData.get("is_common_use") === "on";

  const file = formData.get("file") as File | null;
  if (file && file.size > 0) {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
      cacheControl: "3600",
    });
    if (uploadError) return { error: uploadError.message };
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    url = data.publicUrl;
  }

  if (!url) return { error: "Provide URL or upload a file" };

  let insertPayload: Record<string, unknown> = { url };
  const optionalColumns = await pickExistingColumns(supabase, "images", [
    "description",
    "context",
    "is_public",
    "is_common_use",
  ]);
  if (optionalColumns.includes("description")) insertPayload.description = description || null;
  if (optionalColumns.includes("context")) insertPayload.context = context || null;
  if (optionalColumns.includes("is_public")) insertPayload.is_public = isPublic;
  if (optionalColumns.includes("is_common_use")) insertPayload.is_common_use = isCommonUse;

  insertPayload = await withAuditFields(supabase, "images", insertPayload, user.id, "create");

  const { error: insertError } = await supabase.from("images").insert(insertPayload);
  if (insertError) return { error: insertError.message };

  revalidatePath("/admin/images");
  return { success: true };
}

export async function updateImage(formData: FormData) {
  const user = await requireSuperadmin();

  const id = String(formData.get("id") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  if (!id || !url) return { error: "ID and URL required" };

  const supabase = createAdminClient();
  const description = String(formData.get("description") ?? "").trim();
  const context = String(formData.get("context") ?? "").trim();
  const isPublic = formData.get("is_public") === "true" || formData.get("is_public") === "on";
  const isCommonUse =
    formData.get("is_common_use") === "true" || formData.get("is_common_use") === "on";

  let updates: Record<string, unknown> = { url };
  const optionalColumns = await pickExistingColumns(supabase, "images", [
    "description",
    "context",
    "is_public",
    "is_common_use",
  ]);
  if (optionalColumns.includes("description")) updates.description = description || null;
  if (optionalColumns.includes("context")) updates.context = context || null;
  if (optionalColumns.includes("is_public")) updates.is_public = isPublic;
  if (optionalColumns.includes("is_common_use")) updates.is_common_use = isCommonUse;

  updates = await withAuditFields(supabase, "images", updates, user.id, "update");
  updates = await withModifiedDatetime(supabase, "images", updates);

  const { error: updateError } = await supabase.from("images").update(updates).eq("id", id);
  if (updateError) return { error: updateError.message };

  revalidatePath("/admin/images");
  return { success: true };
}

export async function deleteImage(formData: FormData) {
  await requireSuperadmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing id" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("images").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/images");
}

