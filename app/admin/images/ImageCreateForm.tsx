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
    <form action={formAction} encType="multipart/form-data" className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">URL</label>
        <input
          name="url"
          placeholder="https://… or leave empty to upload"
          className="w-64 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">Or upload file</label>
        <input
          name="file"
          type="file"
          accept="image/*"
          className="block text-sm text-zinc-600 file:mr-2 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-zinc-200"
        />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Create
      </button>
      {supportsDescription ? (
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Description</label>
          <input
            name="description"
            placeholder="Optional description"
            className="w-64 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
      ) : null}
      {supportsContext ? (
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Context</label>
          <input
            name="context"
            placeholder="Optional context"
            className="w-64 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
      ) : null}
      {supportsIsPublic ? (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_public" value="true" className="rounded border-zinc-300" />
          Public
        </label>
      ) : null}
      {supportsIsCommonUse ? (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_common_use"
            value="true"
            className="rounded border-zinc-300"
          />
          Common use
        </label>
      ) : null}
      {state?.error && <span className="text-sm text-red-600">{state.error}</span>}
      {state?.success && <span className="text-sm text-emerald-600">Created</span>}
    </form>
  );
}
