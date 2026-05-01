import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { PaginationBar } from "@/components/admin/PaginationBar";
import { getAdminListPagination } from "@/lib/admin/pagination";
import { listTablePaginated } from "@/lib/admin/queries";
import { createAdminClient } from "@/lib/supabase/admin";
import { tableHasColumn } from "@/lib/admin/schema";
import { ImageCreateForm } from "./ImageCreateForm";
import { ImagesRow } from "./ImagesRow";

export default async function AdminImagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const { page, pageSize, preserve } = getAdminListPagination(sp);
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const visibility = typeof sp.visibility === "string" ? sp.visibility : "all";
  const usage = typeof sp.usage === "string" ? sp.usage : "all";

  const supabase = createAdminClient();
  const [supportsDescription, supportsContext, supportsIsPublic, supportsIsCommonUse] =
    await Promise.all([
      tableHasColumn(supabase, "images", "description"),
      tableHasColumn(supabase, "images", "context"),
      tableHasColumn(supabase, "images", "is_public"),
      tableHasColumn(supabase, "images", "is_common_use"),
    ]);

  const { data, error, count } = await listTablePaginated("images", page, pageSize, "created_datetime_utc");
  const allRows = (data ?? []) as Record<string, unknown>[];
  const rows = allRows.filter((row) => {
    const url = String(row.url ?? "").toLowerCase();
    const description = String(row.description ?? row.context ?? "").toLowerCase();
    const matchesQ = q ? url.includes(q) || description.includes(q) : true;

    const matchesVisibility =
      visibility === "all" ||
      (visibility === "public" && row.is_public === true) ||
      (visibility === "private" && row.is_public !== true);
    const matchesUsage =
      usage === "all" ||
      (usage === "common" && row.is_common_use === true) ||
      (usage === "non-common" && row.is_common_use !== true);
    return matchesQ && matchesVisibility && matchesUsage;
  });
  const total = count ?? allRows.length;

  const totalImages = allRows.length;
  const publicImages = allRows.filter((r) => r.is_public === true).length;
  const commonUseImages = allRows.filter((r) => r.is_common_use === true).length;
  const missingDescription = allRows.filter((r) => {
    const d = String(r.description ?? r.context ?? "").trim();
    return d.length === 0;
  }).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Images"
        subtitle="Upload to storage, then store the public URL in the images table. Paginated for performance."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total images", value: totalImages },
          { label: "Public images", value: publicImages },
          { label: "Common-use images", value: commonUseImages },
          { label: "Missing descriptions", value: missingDescription },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-zinc-500">{stat.label}</div>
            <div className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Create image</h2>
        <div className="mt-3">
          <ImageCreateForm
            supportsDescription={supportsDescription}
            supportsContext={supportsContext}
            supportsIsPublic={supportsIsPublic}
            supportsIsCommonUse={supportsIsCommonUse}
          />
        </div>
        <p className="mt-2 max-w-prose text-xs leading-relaxed text-zinc-500">
          Set <code className="rounded bg-zinc-100 px-1">NEXT_PUBLIC_IMAGES_BUCKET</code> to your
          Supabase Storage bucket name (default:{" "}
          <code className="rounded bg-zinc-100 px-1">images</code>
          ). The bucket should allow public read if you use public URLs for previews.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <form className="flex flex-wrap gap-3" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search url or description"
            className="min-w-[260px] rounded-lg border border-zinc-300 px-3 py-2 text-sm"
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
            name="usage"
            defaultValue={usage}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="all">All usage</option>
            <option value="common">Common-use</option>
            <option value="non-common">Non common-use</option>
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
        emptyMessage="No images yet."
        colSpan={4}
        headers={
          <tr>
            <th className="px-4 py-3">Preview</th>
            <th className="px-4 py-3">URL</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        }
      >
        {rows.map((row) => (
          <ImagesRow
            key={String(row.id)}
            row={row}
            supportsDescription={supportsDescription}
            supportsContext={supportsContext}
            supportsIsPublic={supportsIsPublic}
            supportsIsCommonUse={supportsIsCommonUse}
          />
        ))}
      </AdminTable>

      {!error ? (
        <PaginationBar
          pathname="/admin/images"
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
