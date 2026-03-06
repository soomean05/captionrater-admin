import { createAdminClient } from "@/lib/supabase/admin";
import { createImage, deleteImage, updateImage } from "./actions";

type ImageRow = Record<string, unknown> & {
  id?: string | number;
  url?: string | null;
  created_at?: string | null;
};

export default async function AdminImagesPage() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("images")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const images = (data ?? []) as ImageRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Images</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Basic CRUD on <code>images</code>.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Create image</h2>
        <form className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            name="url"
            placeholder="https://…"
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
          />
          <button
            formAction={createImage}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Create
          </button>
        </form>
        <p className="mt-2 text-xs text-zinc-500">
          This expects your <code>images</code> table has a <code>url</code>{" "}
          column.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          Failed to load images: {error.message}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-600">
            <tr>
              <th className="px-4 py-3">Preview</th>
              <th className="px-4 py-3">URL</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {images.map((img) => {
              const id = String(img.id ?? "");
              const url = String(img.url ?? "");

              return (
                <tr key={id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3">
                    {url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={url}
                        alt=""
                        className="h-14 w-14 rounded-lg object-cover ring-1 ring-zinc-200"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-lg bg-zinc-100 ring-1 ring-zinc-200" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <form className="flex items-center gap-2">
                      <input type="hidden" name="id" value={id} />
                      <input
                        name="url"
                        defaultValue={url}
                        className="w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
                      />
                      <button
                        formAction={updateImage}
                        className="shrink-0 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50"
                      >
                        Save
                      </button>
                    </form>
                    <div className="mt-1 font-mono text-[11px] text-zinc-500">
                      {id}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {img.created_at
                      ? new Date(img.created_at).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form>
                      <input type="hidden" name="id" value={id} />
                      <button
                        formAction={deleteImage}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}

            {!error && images.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-zinc-600" colSpan={4}>
                  No images found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

