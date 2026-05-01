"use client";

import { useActionState } from "react";
import { updateImage } from "./actions";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteImage } from "./actions";

type Row = Record<string, unknown>;

type Props = {
  row: Row;
  supportsDescription: boolean;
  supportsContext: boolean;
  supportsIsPublic: boolean;
  supportsIsCommonUse: boolean;
};

export function ImagesRow({
  row,
  supportsDescription,
  supportsContext,
  supportsIsPublic,
  supportsIsCommonUse,
}: Props) {
  const [state, formAction] = useActionState(
    async (_: unknown, fd: FormData) => updateImage(fd),
    null as { error?: string; success?: boolean } | null
  );

  const url = String(row.url ?? "");
  const id = String(row.id ?? "");

  return (
    <tr className="border-b border-zinc-100 last:border-0">
      <td className="px-4 py-3">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-14 w-14 rounded-lg object-cover ring-1 ring-zinc-200"
          />
        ) : (
          <div className="h-14 w-14 rounded-lg bg-zinc-100 ring-1 ring-zinc-200" />
        )}
      </td>
      <td className="px-4 py-3">
        <form action={formAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={id} />
          <input
            name="url"
            defaultValue={url}
            className="min-w-[200px] max-w-[min(100%,28rem)] rounded border border-zinc-300 px-2 py-1 text-sm"
          />
          {supportsDescription ? (
            <input
              name="description"
              defaultValue={String(row.description ?? "")}
              placeholder="Description"
              className="min-w-[160px] rounded border border-zinc-300 px-2 py-1 text-sm"
            />
          ) : null}
          {supportsContext ? (
            <input
              name="context"
              defaultValue={String(row.context ?? "")}
              placeholder="Context"
              className="min-w-[160px] rounded border border-zinc-300 px-2 py-1 text-sm"
            />
          ) : null}
          {supportsIsPublic ? (
            <label className="flex items-center gap-1.5 text-xs text-zinc-700">
              <input
                type="checkbox"
                name="is_public"
                defaultChecked={Boolean(row.is_public)}
                value="true"
                className="rounded border-zinc-300"
              />
              Public
            </label>
          ) : null}
          {supportsIsCommonUse ? (
            <label className="flex items-center gap-1.5 text-xs text-zinc-700">
              <input
                type="checkbox"
                name="is_common_use"
                defaultChecked={Boolean(row.is_common_use)}
                value="true"
                className="rounded border-zinc-300"
              />
              Common
            </label>
          ) : null}
          <button
            type="submit"
            className="rounded border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50"
          >
            Save
          </button>
          {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
          {state?.success && <span className="text-xs text-emerald-600">Saved</span>}
        </form>
      </td>
      <td className="px-4 py-3 text-zinc-700">
        {row.created_datetime_utc
          ? new Date(String(row.created_datetime_utc)).toLocaleString()
          : "—"}
      </td>
      <td className="px-4 py-3 text-right">
        <DeleteButton action={deleteImage} id={id} confirmMessage="Delete this image?" />
      </td>
    </tr>
  );
}
