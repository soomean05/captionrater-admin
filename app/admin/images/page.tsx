import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { PaginationBar } from "@/components/admin/PaginationBar";
import { listTablePaginated } from "@/lib/admin/queries";
import { ImageCreateForm } from "./ImageCreateForm";
import { ImagesRow } from "./ImagesRow";

const PAGE_SIZE = 20;

export default async function AdminImagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: rawPage } = await searchParams;
  const parsed = parseInt(rawPage ?? "1", 10);
  const page = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

  const { data, error, count } = await listTablePaginated(
    "images",
    page,
    PAGE_SIZE,
    "created_datetime_utc"
  );
  const rows = (data ?? []) as Record<string, unknown>[];
  const total = count ?? 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Images"
        subtitle="Upload to storage, then store the public URL in the images table. Paginated for performance."
      />

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Create image</h2>
        <div className="mt-3">
          <ImageCreateForm />
        </div>
        <p className="mt-2 max-w-prose text-xs leading-relaxed text-zinc-500">
          Set <code className="rounded bg-zinc-100 px-1">NEXT_PUBLIC_IMAGES_BUCKET</code> to your
          Supabase Storage bucket name (default: <code className="rounded bg-zinc-100 px-1">images</code>
          ). The bucket should allow public read if you use public URLs for previews.
        </p>
      </div>

      <AdminTable
        error={error?.message}
        empty={rows.length === 0}
        emptyMessage="No images yet."
        colSpan={4}
        headers={
          <tr>
            <th className="px-4 py-3">Preview</th>
            <th className="px-4 py-3">URL</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        }
      >
        {rows.map((row) => (
          <ImagesRow key={String(row.id)} row={row} />
        ))}
      </AdminTable>

      {total > PAGE_SIZE ? (
        <PaginationBar
          hrefBase="/admin/images"
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
        />
      ) : null}
    </div>
  );
}
