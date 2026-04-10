type AdminTableProps = {
  children: React.ReactNode;
  headers?: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
  colSpan?: number;
};

export function AdminTable({
  children,
  headers,
  loading,
  error,
  empty,
  emptyMessage = "No data found.",
  colSpan = 1,
}: AdminTableProps) {
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        {headers && (
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-600">
            {headers}
          </thead>
        )}
        <tbody>
          {loading ? (
            <tr>
              <td
                className="px-4 py-6 text-sm text-zinc-600"
                colSpan={colSpan}
              >
                Loading…
              </td>
            </tr>
          ) : empty ? (
            <tr>
              <td
                className="px-4 py-6 text-sm text-zinc-600"
                colSpan={colSpan}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
