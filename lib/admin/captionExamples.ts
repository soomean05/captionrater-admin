import type { SupabaseClient } from "@supabase/supabase-js";

export function getCaptionExampleTextFromRow(row: Record<string, unknown>): string {
  const v =
    row.caption_text ??
    row.example_text ??
    row.exampleText ??
    row.captionText;
  return v != null ? String(v) : "";
}

function isMissingColumnError(error: { message?: string; code?: string }): boolean {
  const m = (error.message ?? "").toLowerCase();
  return (
    error.code === "PGRST204" ||
    error.code === "42703" ||
    (m.includes("column") && (m.includes("does not exist") || m.includes("schema cache")))
  );
}

export async function insertCaptionExampleRow(
  supabase: SupabaseClient,
  payload: Record<string, unknown> & { text: string; humor_flavor_id: string | null }
): Promise<{ error: { message: string; code?: string } | null }> {
  const base: Record<string, unknown> = { ...payload };
  delete base.text;
  if (payload.humor_flavor_id) base.humor_flavor_id = payload.humor_flavor_id;

  const tries: Record<string, unknown>[] = [
    { ...base, caption_text: payload.text },
    { ...base, example_text: payload.text },
  ];

  let lastErr: { message: string; code?: string } | null = null;
  for (const insert of tries) {
    const { error } = await supabase.from("caption_examples").insert(insert);
    if (!error) return { error: null };
    lastErr = error;
    if (isMissingColumnError(error)) continue;
    return { error };
  }
  return { error: lastErr };
}
