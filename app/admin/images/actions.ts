"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperadmin } from "@/lib/supabase/guards";

export async function createImage(formData: FormData) {
  await requireSuperadmin();

  const url = String(formData.get("url") ?? "").trim();
  if (!url) return;

  const supabase = createAdminClient();
  await supabase.from("images").insert({ url });

  revalidatePath("/admin/images");
}

export async function updateImage(formData: FormData) {
  await requireSuperadmin();

  const id = String(formData.get("id") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  if (!id || !url) return;

  const supabase = createAdminClient();
  await supabase.from("images").update({ url }).eq("id", id);

  revalidatePath("/admin/images");
}

export async function deleteImage(formData: FormData) {
  await requireSuperadmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const supabase = createAdminClient();
  await supabase.from("images").delete().eq("id", id);

  revalidatePath("/admin/images");
}

