"use client";

import { useActionState } from "react";
import { createImage } from "./actions";

type Props = {
  supportsDescription: boolean;
  supportsContext: boolean;
  supportsIsPublic: boolean;
  supportsIsCommonUse: boolean;
};

export function ImageCreateForm({
  supportsDescription,
  supportsContext,
  supportsIsPublic,
  supportsIsCommonUse,
}: Props) {
  const [state, formAction] = useActionState(
    async (_: unknown, fd: FormData) => createImage(fd),
    null as { error?: string; success?: boolean } | null
  );

  return (
    <form action={formAction} encType="multipart/form-data" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-600">Image URL</label>
        <input
          name="url"
          placeholder="https://… or leave empty to upload"
          className="admin-input w-full"
        />
        <p className="mt-1 text-xs text-zinc-500">Paste a direct URL, or use file upload.</p>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-600">Upload File</label>
        <input
          name="file"
          type="file"
          accept="image/*"
          className="block text-sm text-zinc-600 file:mr-2 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-zinc-200"
        />
      </div>
      {supportsDescription ? (
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-600">Description</label>
          <input
            name="description"
            placeholder="Optional description"
            className="admin-input w-full"
          />
        </div>
      ) : null}
      {supportsContext ? (
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-600">Context</label>
          <input
            name="context"
            placeholder="Optional context"
            className="admin-input w-full"
          />
        </div>
      ) : null}
      {supportsIsPublic ? (
        <label className="admin-badge w-fit">
          <input type="checkbox" name="is_public" value="true" className="rounded border-zinc-300" />
          Public
        </label>
      ) : null}
      {supportsIsCommonUse ? (
        <label className="admin-badge w-fit">
          <input
            type="checkbox"
            name="is_common_use"
            value="true"
            className="rounded border-zinc-300"
          />
          Common use
        </label>
      ) : null}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="admin-btn-primary"
        >
          Upload / Create
        </button>
        {state?.error && <span className="text-sm text-red-600">{state.error}</span>}
        {state?.success && <span className="rounded-full bg-emerald-50 px-2 py-1 text-sm text-emerald-700">Created</span>}
      </div>
    </form>
  );
}
