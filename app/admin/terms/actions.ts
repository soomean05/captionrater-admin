"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperadmin } from "@/lib/supabase/guards";

export async function createTerm(formData: FormData): Promise<void> {
  await requireSuperadmin();
  const term = String(formData.get("term") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!term) {
    redirect("/admin/terms?error=" + encodeURIComponent("Term is required"));
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("terms").insert({
    term,
    description: description || null,
  });
  if (error) {
    redirect("/admin/terms?error=" + encodeURIComponent(error.message));
  }
  revalidatePath("/admin/terms");
}

export async function updateTerm(formData: FormData) {
  await requireSuperadmin();
  const id = String(formData.get("id") ?? "").trim();
  const term = String(formData.get("term") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!id || !term) return { error: "ID and term required" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("terms")
    .update({
      term,
      description: description || null,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/terms");
  return { success: true };
}

export async function deleteTerm(formData: FormData) {
  await requireSuperadmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const supabase = createAdminClient();
  await supabase.from("terms").delete().eq("id", id);
  revalidatePath("/admin/terms");
}
