import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { PaginationBar } from "@/components/admin/PaginationBar";
import { getAdminListPagination } from "@/lib/admin/pagination";
import { listTablePaginated } from "@/lib/admin/queries";
import { createTerm } from "./actions";
import { TermsRow } from "./TermsRow";

export default async function AdminTermsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const { page, pageSize, preserve } = getAdminListPagination(sp);
  const paramError = typeof sp.error === "string" ? sp.error : undefined;

  const { data, error, count } = await listTablePaginated("terms", page, pageSize);
  const rows = (data ?? []) as Record<string, unknown>[];
  const total = count ?? 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Terms" subtitle="Full CRUD for terms table." />

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Create term</h2>
        <form action={createTerm} className="mt-3 flex flex-wrap gap-3">
          <input
            name="term"
            placeholder="Term / name"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="description"
            placeholder="Description"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Create
          </button>
        </form>
      </div>

      {paramError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {paramError}
        </div>
      )}

      <AdminTable
        error={error?.message}
        empty={rows.length === 0}
        emptyMessage="No terms found."
        colSpan={5}
        headers={
          <tr>
            <th className="px-4 py-3">Term</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Modified</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        }
      >
        {rows.map((row) => (
          <TermsRow key={String(row.id)} row={row} />
        ))}
      </AdminTable>

      {!error ? (
        <PaginationBar
          pathname="/admin/terms"
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
