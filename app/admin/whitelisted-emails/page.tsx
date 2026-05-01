import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { PaginationBar } from "@/components/admin/PaginationBar";
import { getAdminListPagination } from "@/lib/admin/pagination";
import { listTableWithFallbackPaginated } from "@/lib/admin/queries";
import {
  WHITELIST_TABLE_CANDIDATES,
  getWhitelistIdForRow,
} from "@/lib/admin/whitelistEmail";
import { formatSupabaseError } from "@/lib/admin/formatError";
import { createWhitelistedEmail } from "./actions";
import { WhitelistedEmailsRow } from "./WhitelistedEmailsRow";

export default async function AdminWhitelistedEmailsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const { page, pageSize, preserve } = getAdminListPagination(sp);
  const paramError = typeof sp.error === "string" ? sp.error : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";

  const { data, error, count } = await listTableWithFallbackPaginated(
    [...WHITELIST_TABLE_CANDIDATES],
    page,
    pageSize
  );
  const allRows = (data ?? []) as Record<string, unknown>[];
  const rows = allRows.filter((row) => {
    if (!q) return true;
    const email = String(row.email ?? row.email_address ?? row.whitelisted_email ?? "").toLowerCase();
    const notes = String(row.notes ?? "").toLowerCase();
    return email.includes(q) || notes.includes(q);
  });
  const total = count ?? allRows.length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Whitelisted Emails"
        subtitle="Full CRUD for the email whitelist table (name may be whitelisted_emails or similar)."
      />

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Create whitelisted email</h2>
        <form action={createWhitelistedEmail} className="mt-3 flex flex-wrap gap-3">
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

      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <form method="get" className="flex flex-wrap gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search email or notes"
            className="min-w-[260px] rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Search
          </button>
        </form>
      </div>

      <AdminTable
        error={error ? formatSupabaseError(error) : null}
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
            key={getWhitelistIdForRow(row as Record<string, unknown>)}
            row={row}
          />
        ))}
      </AdminTable>

      {!error ? (
        <PaginationBar
          pathname="/admin/whitelisted-emails"
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
