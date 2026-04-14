"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperadmin } from "@/lib/supabase/guards";

const BUCKET = process.env.NEXT_PUBLIC_IMAGES_BUCKET ?? "images";

function isMissingColumnError(error: { message?: string; code?: string }): boolean {
  const m = (error.message ?? "").toLowerCase();
  return (
    error.code === "PGRST204" ||
    error.code === "42703" ||
    (m.includes("column") && (m.includes("schema cache") || m.includes("does not exist")))
  );
}

export async function createImage(formData: FormData) {
  await requireSuperadmin();

  const supabase = createAdminClient();
  let url = String(formData.get("url") ?? "").trim();

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

  const insertVariants: Record<string, unknown>[] = [
    { url },
    { image_url: url },
    { public_url: url },
  ];
  let insertError: { message: string; code?: string } | null = null;
  for (const payload of insertVariants) {
    const { error } = await supabase.from("images").insert(payload);
    if (!error) {
      revalidatePath("/admin/images");
      return { success: true };
    }
    insertError = error;
    if (!isMissingColumnError(error)) return { error: error.message };
  }
  if (insertError) return { error: insertError.message };
  return { error: "Failed to insert image row" };
}

export async function updateImage(formData: FormData) {
  await requireSuperadmin();

  const id = String(formData.get("id") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  if (!id || !url) return { error: "ID and URL required" };

  const supabase = createAdminClient();
  const updateVariants: Record<string, unknown>[] = [
    { url },
    { image_url: url },
    { public_url: url },
  ];
  let updateError: { message: string; code?: string } | null = null;
  for (const payload of updateVariants) {
    const { error } = await supabase
      .from("images")
      .update(payload)
      .eq("id", id);
    if (!error) {
      revalidatePath("/admin/images");
      return { success: true };
    }
    updateError = error;
    if (!isMissingColumnError(error)) return { error: error.message };
  }
  if (updateError) return { error: updateError.message };
  return { error: "Failed to update image row" };
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

