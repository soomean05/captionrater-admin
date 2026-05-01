import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { PaginationBar } from "@/components/admin/PaginationBar";
import { getAdminListPagination } from "@/lib/admin/pagination";
import { listTablePaginated } from "@/lib/admin/queries";

export default async function AdminCaptionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const { page, pageSize, preserve } = getAdminListPagination(sp);
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const visibility = typeof sp.visibility === "string" ? sp.visibility : "all";
  const featured = typeof sp.featured === "string" ? sp.featured : "all";
  const { data, error, count } = await listTablePaginated("captions", page, pageSize);
  const allRows = (data ?? []) as Record<string, unknown>[];
  const rows = allRows.filter((row) => {
    const content = String(row.content ?? "").toLowerCase();
    const matchesQ = q ? content.includes(q) : true;
    const matchesVisibility =
      visibility === "all" ||
      (visibility === "public" && row.is_public === true) ||
      (visibility === "private" && row.is_public !== true);
    const matchesFeatured =
      featured === "all" ||
      (featured === "yes" && row.is_featured === true) ||
      (featured === "no" && row.is_featured !== true);
    return matchesQ && matchesVisibility && matchesFeatured;
  });
  const total = count ?? allRows.length;
  const totalCaptions = allRows.length;
  const publicCaptions = allRows.filter((r) => r.is_public === true).length;
  const featuredCaptions = allRows.filter((r) => r.is_featured === true).length;
  const likeValues = allRows
    .map((r) => Number(r.like_count ?? r.likes_count ?? r.likes))
    .filter((v) => Number.isFinite(v));
  const avgLikes = likeValues.length > 0 ? likeValues.reduce((a, b) => a + b, 0) / likeValues.length : 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Captions" subtitle="Read-only. Reading from captions." />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total captions", value: totalCaptions },
          { label: "Public captions", value: publicCaptions },
          { label: "Featured captions", value: featuredCaptions },
          { label: "Average likes", value: avgLikes.toFixed(2) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-zinc-500">{stat.label}</div>
            <div className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <form method="get" className="flex flex-wrap gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search caption content"
            className="min-w-[280px] rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <select
            name="visibility"
            defaultValue={visibility}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="all">All visibility</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <select
            name="featured"
            defaultValue={featured}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="all">All featured states</option>
            <option value="yes">Featured</option>
            <option value="no">Not featured</option>
          </select>
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Apply
          </button>
        </form>
      </div>

      <AdminTable
        error={error?.message}
        empty={rows.length === 0}
        emptyMessage="No captions found."
        colSpan={5}
        headers={
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Caption</th>
            <th className="px-4 py-3">Image ID</th>
            <th className="px-4 py-3">Profile ID</th>
            <th className="px-4 py-3">Created</th>
          </tr>
        }
      >
        {rows.map((row) => {
          const captionText = String(row.content ?? "").trim() || "—";
          return (
            <tr key={String(row.id)} className="border-b border-zinc-100 last:border-0">
              <td className="px-4 py-3 font-mono text-xs text-zinc-700">{String(row.id ?? "—")}</td>
              <td className="max-w-xl truncate px-4 py-3 text-zinc-900">{captionText}</td>
              <td className="px-4 py-3 font-mono text-xs text-zinc-700">
                {String(row.image_id ?? "—")}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-zinc-700">
                {String(row.profile_id ?? "—")}
              </td>
              <td className="px-4 py-3 text-zinc-700">
                {row.created_datetime_utc
                  ? new Date(row.created_datetime_utc as string).toLocaleString()
                  : "—"}
              </td>
            </tr>
          );
        })}
      </AdminTable>

      {!error ? (
        <PaginationBar
          pathname="/admin/captions"
          page={page}
          pageSize={pageSize}
          total={total}
          rowCount={rows.length}
          preserveParams={preserve}
        />
      ) : null}
    </div>
  );
}
