"use client";

import { useActionState } from "react";
import { updateLlmProvider, deleteLlmProvider } from "./actions";
import { DeleteButton } from "@/components/admin/DeleteButton";

type Row = Record<string, unknown>;

export function LlmProvidersRow({ row }: { row: Row }) {
  const [state, formAction] = useActionState(
    async (_: unknown, fd: FormData) => updateLlmProvider(fd),
    null as { error?: string; success?: boolean } | null
  );

  return (
    <tr className="border-b border-zinc-100 last:border-0">
      <td className="px-4 py-3" colSpan={3}>
        <form action={formAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={String(row.id)} />
          <input
            name="name"
            defaultValue={String(row.name ?? "")}
            placeholder="Name"
            className="min-w-[120px] rounded border border-zinc-300 px-2 py-1 text-sm"
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
      <td className="px-4 py-3 text-right">
        <DeleteButton
          action={deleteLlmProvider}
          id={String(row.id)}
          confirmMessage="Delete this LLM provider?"
        />
      </td>
    </tr>
  );
}
