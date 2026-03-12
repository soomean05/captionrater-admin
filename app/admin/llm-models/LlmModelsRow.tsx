"use client";

import { useActionState } from "react";
import { updateLlmModel, deleteLlmModel } from "./actions";
import { DeleteButton } from "@/components/admin/DeleteButton";

type Row = Record<string, unknown>;

export function LlmModelsRow({ row }: { row: Row }) {
  const [state, formAction] = useActionState(
    async (_: unknown, fd: FormData) => updateLlmModel(fd),
    null as { error?: string; success?: boolean } | null
  );

  const isActive = row.is_active === true || row.is_active === "true" || row.isActive === true;

  return (
    <tr className="border-b border-zinc-100 last:border-0">
      <td className="px-4 py-3" colSpan={3}>
        <form action={formAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={String(row.id)} />
          <input
            name="name"
            defaultValue={String(row.name ?? row.model_name ?? "")}
            placeholder="Model name"
            className="min-w-[140px] rounded border border-zinc-300 px-2 py-1 text-sm"
          />
          <input
            name="provider_id"
            defaultValue={String(row.provider_id ?? row.providerId ?? "")}
            placeholder="Provider ID"
            className="min-w-[100px] rounded border border-zinc-300 px-2 py-1 text-sm"
          />
          <label className="flex items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={!!isActive}
              value="true"
              className="rounded border-zinc-300"
            />
            Active
          </label>
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
          action={deleteLlmModel}
          id={String(row.id)}
          confirmMessage="Delete this LLM model?"
        />
      </td>
    </tr>
  );
}
