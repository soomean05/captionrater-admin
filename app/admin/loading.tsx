export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-200" />
        <div className="mt-2 h-4 w-80 animate-pulse rounded bg-zinc-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="h-3 w-28 animate-pulse rounded bg-zinc-100" />
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-zinc-200" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
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

