import Link from "next/link";

type Props = {
  /** Route path without query, e.g. `/admin/users` */
  pathname: string;
  page: number;
  pageSize: number;
  /** Total row count from Supabase `count: "exact"` */
  total: number;
  /** Number of rows returned for the current page */
  rowCount: number;
  /** Query params to keep when changing page (excludes `page`). */
  preserveParams?: Record<string, string>;
};

function buildHref(
  pathname: string,
  targetPage: number,
  preserve: Record<string, string>
): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(preserve)) {
    if (v) params.set(k, v);
  }
  if (targetPage > 1) params.set("page", String(targetPage));
  const q = params.toString();
  return q ? `${pathname}?${q}` : pathname;
}

export function PaginationBar({
  pathname,
  page,
  pageSize,
  total,
  rowCount,
  preserveParams = {},
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const fromIdx = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const toIdx = total === 0 ? 0 : Math.min(safePage * pageSize, total);

  const prevDisabled = safePage <= 1;
  const nextDisabled = rowCount < pageSize || safePage >= totalPages;

  const prevClass =
    "rounded-lg border px-3 py-1.5 font-medium border-zinc-300 hover:bg-white";
  const disabledClass =
    "rounded-lg border px-3 py-1.5 font-medium pointer-events-none border-zinc-100 text-zinc-400";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
      <div className="flex flex-col gap-0.5 tabular-nums sm:flex-row sm:items-baseline sm:gap-3">
        <span>
          Page <span className="font-medium text-zinc-900">{safePage}</span> of{" "}
          <span className="font-medium text-zinc-900">{totalPages}</span>
          <span className="text-zinc-500"> ({total} total)</span>
        </span>
        {total > 0 ? (
          <span className="text-zinc-500">
            Showing {fromIdx}–{toIdx}
          </span>
        ) : null}
      </div>
      <div className="flex gap-2">
        {prevDisabled ? (
          <span className={disabledClass} aria-disabled="true">
            Previous
          </span>
        ) : (
          <Link
            href={buildHref(pathname, safePage - 1, preserveParams)}
            className={prevClass}
          >
            Previous
          </Link>
        )}
        {nextDisabled ? (
          <span className={disabledClass} aria-disabled="true">
            Next
          </span>
        ) : (
          <Link
            href={buildHref(pathname, safePage + 1, preserveParams)}
            className={prevClass}
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
