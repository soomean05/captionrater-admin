"use client";

import { useActionState } from "react";
import { updateHumorMix } from "./actions";

type Row = Record<string, unknown>;

export function HumorMixEditRow({ row }: { row: Row }) {
  const id = String(row.id ?? "");
  const [state, formAction] = useActionState(
    async (_: unknown, formData: FormData) => {
      const r = await updateHumorMix(formData);
      return r;
    },
    null as { error?: string; success?: boolean } | null
  );

  const displayValue =
    typeof row.description === "object"
      ? JSON.stringify(row.description)
      : String(row.description ?? row.value ?? row.amount ?? row.weight ?? "");

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="name" value={String(row.name ?? row.theme ?? row.key ?? "")} />
      <input
        name="value"
        defaultValue={displayValue}
        className="min-w-[120px] rounded-lg border border-zinc-300 px-2 py-1.5 text-sm"
      />
      <button
        type="submit"
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50"
      >
        Save
      </button>
      {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
      {state?.success && <span className="text-xs text-emerald-600">Saved</span>}
    </form>
  );
}
