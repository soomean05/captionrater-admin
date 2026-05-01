import type { SupabaseClient } from "@supabase/supabase-js";

export function getCaptionExampleTextFromRow(row: Record<string, unknown>): string {
  const v = row.caption;
  return v != null ? String(v) : "";
}

export async function insertCaptionExampleRow(
  supabase: SupabaseClient,
  payload: Record<string, unknown> & {
    text: string;
    image_description: string;
    explanation: string;
  }
): Promise<{ error: { message: string; code?: string } | null }> {
  const base: Record<string, unknown> = { ...payload };
  delete base.text;
  const insert = {
    ...base,
    caption: payload.text,
    image_description: payload.image_description,
    explanation: payload.explanation,
  };
  const { error } = await supabase.from("caption_examples").insert(insert);
  if (!error) return { error: null };
  return { error };
}
