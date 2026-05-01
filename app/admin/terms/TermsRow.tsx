"use client";

import { useActionState } from "react";
import { updateTerm } from "./actions";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteTerm } from "./actions";

type Row = Record<string, unknown>;

export function TermsRow({ row }: { row: Row }) {
  const [state, formAction] = useActionState(
    async (_: unknown, fd: FormData) => updateTerm(fd),
    null as { error?: string; success?: boolean } | null
  );

  return (
    <tr className="border-b border-zinc-100 last:border-0">
      <td className="px-4 py-3" colSpan={2}>
        <form action={formAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={String(row.id)} />
          <input
            name="term"
            defaultValue={String(row.term ?? row.name ?? row.text ?? "")}
            placeholder="Term"
            required
            className="min-w-[120px] rounded border border-zinc-300 px-2 py-1 text-sm"
          />
          <input
            name="definition"
            defaultValue={String(row.definition ?? "")}
            placeholder="Definition"
            className="min-w-[160px] rounded border border-zinc-300 px-2 py-1 text-sm"
          />
          <textarea
            name="example"
            defaultValue={String(row.example ?? "")}
            placeholder="Example"
            required
            className="min-w-[220px] rounded border border-zinc-300 px-2 py-1 text-sm"
          />
          <button type="submit" className="rounded border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50">
            Save
          </button>
          {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
          {state?.success && <span className="text-xs text-emerald-600">Saved</span>}
        </form>
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
        <DeleteButton action={deleteTerm} id={String(row.id)} confirmMessage="Delete this term?" />
      </td>
    </tr>
  );
}
