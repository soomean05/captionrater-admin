import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { listImages } from "@/lib/admin/queries";
import { ImageCreateForm } from "./ImageCreateForm";
import { ImagesRow } from "./ImagesRow";

export default async function AdminImagesPage() {
  const { data, error } = await listImages();
  const rows = (data ?? []) as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Images"
        subtitle="Full CRUD. Create via URL or upload to Supabase Storage."
      />

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Create image</h2>
        <div className="mt-3">
          <ImageCreateForm />
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Use <code>NEXT_PUBLIC_IMAGES_BUCKET</code> to set the storage bucket (default: images).
        </p>
      </div>

      <AdminTable
        error={error?.message}
        empty={rows.length === 0}
        emptyMessage="No images found."
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
    </div>
  );
}
