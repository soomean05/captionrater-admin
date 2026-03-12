import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { createLlmProvider } from "./actions";
import { listTable } from "@/lib/admin/queries";
import { LlmProvidersRow } from "./LlmProvidersRow";

export default async function AdminLlmProvidersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: paramError } = await searchParams;
  const { data, error } = await listTable("llm_providers", "created_datetime_utc");
  const rows = (data ?? []) as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="LLM Providers"
        subtitle="Full CRUD for llm_providers table."
      />

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Create LLM provider</h2>
        <form action={createLlmProvider} className="mt-3 flex flex-wrap gap-3">
          <input
            name="name"
            placeholder="Name"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="base_url"
            placeholder="Base URL (optional)"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="api_type"
            placeholder="API type (optional)"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
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
        emptyMessage="No LLM providers found."
        colSpan={4}
        headers={
          <tr>
            <th className="px-4 py-3" colSpan={3}>
              Name / Base URL / API type / Active
            </th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        }
      >
        {rows.map((row) => (
          <LlmProvidersRow key={String(row.id)} row={row} />
        ))}
      </AdminTable>
    </div>
  );
}
