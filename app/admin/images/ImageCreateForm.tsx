"use client";

import { useActionState } from "react";
import { createImage } from "./actions";

export function ImageCreateForm() {
  const [state, formAction] = useActionState(
    async (_: unknown, fd: FormData) => createImage(fd),
    null as { error?: string; success?: boolean } | null
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
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
      {state?.error && <span className="text-sm text-red-600">{state.error}</span>}
      {state?.success && <span className="text-sm text-emerald-600">Created</span>}
    </form>
  );
}
