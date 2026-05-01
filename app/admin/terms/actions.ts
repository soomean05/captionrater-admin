"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperadmin } from "@/lib/supabase/guards";
import { withAuditFields, withModifiedDatetime } from "@/lib/admin/schema";

export async function createTerm(formData: FormData): Promise<void> {
  const user = await requireSuperadmin();
  const term = String(formData.get("term") ?? "").trim();
  const definition = String(formData.get("definition") ?? "").trim();
  const example = String(formData.get("example") ?? "").trim();
  if (!term) {
    redirect("/admin/terms?error=" + encodeURIComponent("Term is required"));
  }
  if (!example) {
    redirect("/admin/terms?error=" + encodeURIComponent("Example is required"));
  }

  const supabase = createAdminClient();
  let payload: Record<string, unknown> = {
    term,
    definition: definition || null,
    example,
  };
  payload = await withAuditFields(supabase, "terms", payload, user.id, "create");

  const { error } = await supabase.from("terms").insert(payload);
  if (error) {
    redirect("/admin/terms?error=" + encodeURIComponent(error.message));
  }
  revalidatePath("/admin/terms");
}

export async function updateTerm(formData: FormData) {
  const user = await requireSuperadmin();
  const id = String(formData.get("id") ?? "").trim();
  const term = String(formData.get("term") ?? "").trim();
  const definition = String(formData.get("definition") ?? "").trim();
  const example = String(formData.get("example") ?? "").trim();
  if (!id || !term) return { error: "ID and term required" };
  if (!example) return { error: "Example is required" };

  const supabase = createAdminClient();
  let updates: Record<string, unknown> = {
    term,
    definition: definition || null,
    example,
  };
  updates = await withAuditFields(supabase, "terms", updates, user.id, "update");
  updates = await withModifiedDatetime(supabase, "terms", updates);

  const { error } = await supabase.from("terms").update(updates).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/terms");
  return { success: true };
}

export async function deleteTerm(formData: FormData) {
  await requireSuperadmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing id" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("terms").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/terms");
}
