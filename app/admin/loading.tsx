export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="admin-card p-5">
        <div className="h-3 w-24 animate-pulse rounded bg-zinc-100" />
        <div className="mt-2 h-8 w-56 animate-pulse rounded bg-zinc-200" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-zinc-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="admin-card p-4">
            <div className="h-3 w-28 animate-pulse rounded bg-zinc-100" />
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-zinc-200" />
          </div>
        ))}
      </div>
      <div className="admin-card p-5">
        <div className="h-4 w-40 animate-pulse rounded bg-zinc-200" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-zinc-100" />
          ))}
        </div>
      </div>
    </div>
  );
}

