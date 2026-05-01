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
      <div className="admin-card border-red-200 bg-red-50 p-4 text-sm text-red-900">
        {error}
      </div>
    );
  }

  return (
    <div className="admin-card overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        {headers && (
          <thead className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50/95 text-xs font-semibold uppercase tracking-wide text-zinc-600 backdrop-blur">
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
                className="px-4 py-10 text-center text-sm text-zinc-600"
                colSpan={colSpan}
              >
                <div className="mx-auto flex max-w-sm flex-col items-center gap-1">
                  <div className="h-8 w-8 rounded-full bg-zinc-100" />
                  <p className="font-medium text-zinc-700">{emptyMessage}</p>
                  <p className="text-xs text-zinc-500">Try adjusting search or filters.</p>
                </div>
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
