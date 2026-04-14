import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { PaginationBar } from "@/components/admin/PaginationBar";
import { getAdminListPagination } from "@/lib/admin/pagination";
import { listHumorFlavorStepsPaginated } from "@/lib/admin/queries";
import { formatSupabaseError } from "@/lib/admin/formatError";

export default async function AdminHumorFlavorStepsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const { page, pageSize, preserve } = getAdminListPagination(sp);
  const { data, error, count } = await listHumorFlavorStepsPaginated(page, pageSize);
  const rows = (data ?? []) as Record<string, unknown>[];
  const total = count ?? 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Humor Flavor Steps"
        subtitle="Read-only. Ordered by flavor then step number."
      />

      <AdminTable
        error={error ? formatSupabaseError(error) : null}
        empty={rows.length === 0}
        emptyMessage="No steps found."
        colSpan={5}
        headers={
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Humor Flavor ID</th>
            <th className="px-4 py-3">Step Number</th>
            <th className="px-4 py-3">Content / Prompt</th>
            <th className="px-4 py-3">Created</th>
          </tr>
        }
      >
        {rows.map((row) => (
          <tr key={String(row.id)} className="border-b border-zinc-100 last:border-0">
            <td className="px-4 py-3 font-mono text-xs text-zinc-700">{String(row.id ?? "—")}</td>
            <td className="px-4 py-3 font-mono text-xs text-zinc-700">
              {String(row.humor_flavor_id ?? row.flavor_id ?? "—")}
            </td>
            <td className="px-4 py-3 text-zinc-700">
              {String(row.step_number ?? row.step_order ?? row.step_index ?? "—")}
            </td>
            <td className="max-w-md truncate px-4 py-3 text-zinc-700">
              {String(row.content ?? row.prompt ?? row.text ?? row.instruction ?? "—")}
            </td>
            <td className="px-4 py-3 text-zinc-700">
              {row.created_datetime_utc
                ? new Date(row.created_datetime_utc as string).toLocaleString()
                : "—"}
            </td>
          </tr>
        ))}
      </AdminTable>

      {!error ? (
        <PaginationBar
          pathname="/admin/humor-flavor-steps"
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
