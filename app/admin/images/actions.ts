"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperadmin } from "@/lib/supabase/guards";

const BUCKET = process.env.NEXT_PUBLIC_IMAGES_BUCKET ?? "images";

export async function createImage(formData: FormData) {
  await requireSuperadmin();

  const supabase = createAdminClient();
  let url = String(formData.get("url") ?? "").trim();

  const file = formData.get("file") as File | null;
  if (file && file.size > 0) {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (uploadError) return { error: uploadError.message };
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    url = data.publicUrl;
  }

  if (!url) return { error: "Provide URL or upload a file" };

  const { error } = await supabase.from("images").insert({ url });
  if (error) return { error: error.message };
  revalidatePath("/admin/images");
  return { success: true };
}

export async function updateImage(formData: FormData) {
  await requireSuperadmin();

  const id = String(formData.get("id") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  if (!id || !url) return { error: "ID and URL required" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("images")
    .update({ url })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/images");
  return { success: true };
}

export async function deleteImage(formData: FormData) {
  await requireSuperadmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const supabase = createAdminClient();
  await supabase.from("images").delete().eq("id", id);

  revalidatePath("/admin/images");
}

