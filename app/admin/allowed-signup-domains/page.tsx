import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { createAllowedSignupDomain } from "./actions";
import { listTable } from "@/lib/admin/queries";
import { AllowedSignupDomainsRow } from "./AllowedSignupDomainsRow";

export default async function AdminAllowedSignupDomainsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: paramError } = await searchParams;
  const { data, error } = await listTable("allowed_signup_domains");
  const rows = (data ?? []) as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Allowed Signup Domains"
        subtitle="Full CRUD for allowed_signup_domains table."
      />

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Create allowed signup domain</h2>
        <form
          action={createAllowedSignupDomain}
          className="mt-3 flex flex-wrap gap-3"
        >
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
    </div>
  );
}
