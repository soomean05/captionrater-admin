import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { createWhitelistedEmail } from "./actions";
import { listTable } from "@/lib/admin/queries";
import { WhitelistedEmailsRow } from "./WhitelistedEmailsRow";

export default async function AdminWhitelistedEmailsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: paramError } = await searchParams;
  const { data, error } = await listTable("whitelisted_email_addresses");
  const rows = (data ?? []) as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Whitelisted Emails"
        subtitle="Full CRUD for whitelisted_email_addresses table."
      />

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Create whitelisted email</h2>
        <form
          action={createWhitelistedEmail}
          className="mt-3 flex flex-wrap gap-3"
        >
          <input
            name="email"
            placeholder="Email"
            type="email"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm lowercase"
          />
          <input
            name="notes"
            placeholder="Notes (optional)"
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
        emptyMessage="No whitelisted emails found."
        colSpan={3}
        headers={
          <tr>
            <th className="px-4 py-3" colSpan={2}>
              Email / Notes
            </th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        }
      >
        {rows.map((row) => (
          <WhitelistedEmailsRow
            key={String(row.id ?? row.email)}
            row={row}
          />
        ))}
      </AdminTable>
    </div>
  );
}
