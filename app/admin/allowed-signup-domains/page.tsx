import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { PaginationBar } from "@/components/admin/PaginationBar";
import { getAdminListPagination } from "@/lib/admin/pagination";
import { listTablePaginated } from "@/lib/admin/queries";
import { createAllowedSignupDomain } from "./actions";
import { AllowedSignupDomainsRow } from "./AllowedSignupDomainsRow";

export default async function AdminAllowedSignupDomainsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const { page, pageSize, preserve } = getAdminListPagination(sp);
  const paramError = typeof sp.error === "string" ? sp.error : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const active = typeof sp.active === "string" ? sp.active : "all";

  const { data, error, count } = await listTablePaginated(
    "allowed_signup_domains",
    page,
    pageSize
  );
  const allRows = (data ?? []) as Record<string, unknown>[];
  const rows = allRows.filter((row) => {
    const domain = String(row.domain ?? "").toLowerCase();
    const isActive = row.is_active === true || row.is_enabled === true;
    const matchesQ = q ? domain.includes(q) : true;
    const matchesActive =
      active === "all" ||
      (active === "yes" && isActive) ||
      (active === "no" && !isActive);
    return matchesQ && matchesActive;
  });
  const total = count ?? allRows.length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Allowed Signup Domains"
        subtitle="Full CRUD for allowed_signup_domains table."
      />

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Create allowed signup domain</h2>
        <form action={createAllowedSignupDomain} className="mt-3 flex flex-wrap gap-3">
          <input
            name="domain"
            placeholder="Domain (e.g. example.com)"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm lowercase"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked
              value="true"
              className="rounded border-zinc-300"
            />
            Active
          </label>
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

      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <form method="get" className="flex flex-wrap gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search domain"
            className="min-w-[260px] rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <select
            name="active"
            defaultValue={active}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="all">All active states</option>
            <option value="yes">Active</option>
            <option value="no">Inactive</option>
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
        emptyMessage="No allowed signup domains found."
        colSpan={4}
        headers={
          <tr>
            <th className="px-4 py-3" colSpan={2}>
              Domain
            </th>
            <th className="px-4 py-3">Active</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        }
      >
        {rows.map((row) => (
          <AllowedSignupDomainsRow
            key={String(row.id ?? row.domain)}
            row={row}
          />
        ))}
      </AdminTable>

      {!error ? (
        <PaginationBar
          pathname="/admin/allowed-signup-domains"
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
