import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatSupabaseError } from "@/lib/admin/formatError";
import Link from "next/link";

type TableTest = {
  table: string;
  ok: boolean;
  columns?: string[];
  error?: string;
  rowCount?: number;
};

export default async function AdminSchemaCheckPage() {
  const supabase = createAdminClient();
  const tablesToTest = [
    "whitelist_email_addresses",
    "whitelisted_email_addresses",
    "whitelisted_emails",
    "llm_model_responses",
    "humor_themes",
    "humor_flavor_steps",
  ];

  const results: TableTest[] = [];

  for (const table of tablesToTest) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .limit(1);

    if (error) {
      results.push({
        table,
        ok: false,
        error: formatSupabaseError(error) ?? error.message,
      });
    } else {
      const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
      const { count } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });
      results.push({
        table,
        ok: true,
        columns,
        rowCount: count ?? 0,
      });
    }
  }

  const working = results.filter((r) => r.ok);
  const failing = results.filter((r) => !r.ok);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Schema Check"
        subtitle="Tests table access and discovers column names. Use this to fix broken admin pages."
      />

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Working tables</h2>
        {working.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600">None of the tested tables are accessible.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {working.map((r) => (
              <li key={r.table} className="text-sm">
                <span className="font-mono font-medium text-emerald-700">{r.table}</span>
                {r.rowCount != null && <span className="ml-2 text-zinc-600">({r.rowCount} rows)</span>}
                {r.columns && r.columns.length > 0 && (
                  <div className="ml-4 mt-1 font-mono text-xs text-zinc-500">
                    columns: {r.columns.join(", ")}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Failing tables</h2>
        {failing.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600">All tested tables are accessible.</p>
        ) : (
          <ul className="mt-2 space-y-3">
            {failing.map((r) => (
              <li key={r.table} className="text-sm">
                <span className="font-mono font-medium text-red-700">{r.table}</span>
                <div className="mt-1 rounded bg-red-50 px-2 py-1 font-mono text-xs text-red-900">
                  {r.error}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-sm text-zinc-600">
        <Link href="/admin" className="underline hover:no-underline">Back to Dashboard</Link>
      </p>
    </div>
  );
}
