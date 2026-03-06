import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminImagesPage() {
  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("images")
    .select("*")
    .order("created_datetime_utc", { ascending: false });

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
        {error.message}
      </div>
    );
  }

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Images</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Reading from <code>images</code>.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-600">
            <tr>
              <th className="px-4 py-3">Preview</th>
              <th className="px-4 py-3">URL</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={String(row.id)}
                className="border-b border-zinc-100 last:border-0"
              >
                <td className="px-4 py-3">
                  {row.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={row.url}
                      alt=""
                      className="h-14 w-14 rounded-lg object-cover ring-1 ring-zinc-200"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-lg bg-zinc-100 ring-1 ring-zinc-200" />
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-900">{row.url ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-700">
                  {row.created_datetime_utc
                    ? new Date(row.created_datetime_utc).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-zinc-600" colSpan={3}>
                  No images found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
