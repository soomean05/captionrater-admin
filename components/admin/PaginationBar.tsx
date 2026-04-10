import Link from "next/link";

type Props = {
  hrefBase: string;
  page: number;
  pageSize: number;
  total: number;
};

export function PaginationBar({ hrefBase, page, pageSize, total }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const prevPage = Math.max(1, safePage - 1);
  const nextPage = Math.min(totalPages, safePage + 1);

  const href = (p: number) => (p <= 1 ? hrefBase : `${hrefBase}?page=${p}`);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
      <span className="tabular-nums">
        Page {safePage} of {totalPages}
        <span className="text-zinc-500"> ({total} total)</span>
      </span>
      <div className="flex gap-2">
        <Link
          href={href(prevPage)}
          className={`rounded-lg border px-3 py-1.5 font-medium ${
            safePage <= 1
              ? "pointer-events-none border-zinc-100 text-zinc-400"
              : "border-zinc-300 hover:bg-white"
          }`}
          aria-disabled={safePage <= 1}
        >
          Previous
        </Link>
        <Link
          href={href(nextPage)}
          className={`rounded-lg border px-3 py-1.5 font-medium ${
            safePage >= totalPages
              ? "pointer-events-none border-zinc-100 text-zinc-400"
              : "border-zinc-300 hover:bg-white"
          }`}
          aria-disabled={safePage >= totalPages}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
