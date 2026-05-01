"use client";

import { useActionState } from "react";
import { updateCaptionExample, deleteCaptionExample } from "./actions";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { getCaptionExampleTextFromRow } from "@/lib/admin/captionExamples";

type Row = Record<string, unknown>;

export function CaptionExamplesRow({ row }: { row: Row }) {
  const [state, formAction] = useActionState(
    async (_: unknown, fd: FormData) => updateCaptionExample(fd),
    null as { error?: string; success?: boolean } | null
  );

  return (
    <tr className="border-b border-zinc-100 last:border-0">
      <td className="px-4 py-3 font-mono text-xs text-zinc-500">
        {String(row.id ?? "")}
      </td>
      <td className="px-4 py-3">
        <form action={formAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={String(row.id)} />
          <input
            name="caption"
            defaultValue={getCaptionExampleTextFromRow(row)}
            placeholder="Caption text"
            className="min-w-[200px] rounded border border-zinc-300 px-2 py-1 text-sm"
          />
          <input
            name="humor_flavor_id"
            defaultValue={String(row.humor_flavor_id ?? row.humorFlavorId ?? "")}
            placeholder="Humor flavor ID (optional)"
            className="min-w-[100px] rounded border border-zinc-300 px-2 py-1 text-sm"
          />
          <button
            type="submit"
            className="rounded border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50"
          >
            Save
          </button>
          {state?.error && (
            <span className="text-xs text-red-600">{state.error}</span>
          )}
          {state?.success && (
            <span className="text-xs text-emerald-600">Saved</span>
          )}
        </form>
      </td>
      <td className="px-4 py-3 text-zinc-700">
        {row.humor_flavor_id ?? row.humorFlavorId
          ? String(row.humor_flavor_id ?? row.humorFlavorId)
          : "—"}
      </td>
      <td className="px-4 py-3 text-zinc-700 whitespace-nowrap">
        {row.created_datetime_utc
          ? new Date(row.created_datetime_utc as string).toLocaleString()
          : "—"}
      </td>
      <td className="px-4 py-3 text-zinc-700 whitespace-nowrap">
        {row.modified_datetime_utc
          ? new Date(row.modified_datetime_utc as string).toLocaleString()
          : "—"}
      </td>
      <td className="px-4 py-3 text-right">
        <DeleteButton
          action={deleteCaptionExample}
          id={String(row.id)}
          confirmMessage="Delete this caption example?"
        />
      </td>
    </tr>
  );
}
