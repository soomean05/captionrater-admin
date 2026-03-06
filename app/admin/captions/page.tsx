import { createAdminClient } from "@/lib/supabase/admin";

type CaptionRow = Record<string, unknown> & {
  id?: string | number;
  created_datetime_utc?: string | null;
  image_id?: string | number | null;
  profile_id?: string | null;
  text?: string | null;
  caption?: string | null;
};

export default async function AdminCaptionsPage() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("captions")
    .select("*")
    .limit(200);

  const captions = (data ?? []) as CaptionRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Captions</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Reading from <code>captions</code>.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          Failed to load captions: {error.message}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-600">
            <tr>
              <th className="px-4 py-3">Caption</th>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Profile</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {captions.map((c) => {
              const captionText =
                (c.text ?? c.caption ?? "").toString().trim() || "—";

              return (
                <tr
                  key={String(c.id)}
                  className="border-b border-zinc-100 last:border-0"
                >
                  <td className="px-4 py-3 text-zinc-900">
                    <div className="max-w-xl truncate">{captionText}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-700">
                    {c.image_id ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-700">
                    {c.profile_id ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {c.created_datetime_utc
                      ? new Date(c.created_datetime_utc).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              );
            })}

            {!error && captions.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-zinc-600" colSpan={4}>
                  No captions found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

