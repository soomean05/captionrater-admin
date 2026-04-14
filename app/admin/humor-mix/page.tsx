import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { PaginationBar } from "@/components/admin/PaginationBar";
import { getAdminListPagination } from "@/lib/admin/pagination";
import { listTablePaginated } from "@/lib/admin/queries";
import { formatSupabaseError } from "@/lib/admin/formatError";
import { HumorMixEditRow } from "./HumorMixEditRow";

export default async function AdminHumorMixPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const { page, pageSize, preserve } = getAdminListPagination(sp);
  const { data, error, count } = await listTablePaginated("humor_themes", page, pageSize);
  const rows = (data ?? []) as Record<string, unknown>[];
  const total = count ?? 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Humor Mix"
        subtitle="Read + update only. From humor_themes table."
      />

      <AdminTable
        error={error ? formatSupabaseError(error) : null}
        empty={rows.length === 0}
        emptyMessage="No humor theme records found."
        colSpan={4}
        headers={
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        }
      >
        {rows.map((row) => (
          <tr key={String(row.id)} className="border-b border-zinc-100 last:border-0">
            <td className="px-4 py-3 font-mono text-xs text-zinc-700">{String(row.id ?? "—")}</td>
            <td className="px-4 py-3 text-zinc-900">
              {String(row.name ?? row.theme ?? row.key ?? "—")}
            </td>
            <td className="px-4 py-3 text-zinc-700">
              {typeof row.description === "object"
                ? JSON.stringify(row.description)
                : String(row.description ?? row.value ?? row.amount ?? row.weight ?? "—")}
            </td>
            <td className="px-4 py-3">
              <HumorMixEditRow row={row} />
            </td>
          </tr>
        ))}
      </AdminTable>

      {!error ? (
        <PaginationBar
          pathname="/admin/humor-mix"
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
