export function formatSupabaseError(
  error: { message: string; code?: string; details?: string; hint?: string } | null | undefined
): string | null {
  if (!error) return null;
  const parts = [error.message];
  if (error.code) parts.push(`(code: ${error.code})`);
  if (error.details) parts.push(`— details: ${error.details}`);
  if (error.hint) parts.push(`— hint: ${error.hint}`);
  return parts.join(" ");
}
