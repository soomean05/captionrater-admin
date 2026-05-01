"use client";

import { useActionState } from "react";
import {
  updateAllowedSignupDomain,
  deleteAllowedSignupDomain,
} from "./actions";
import { DeleteButton } from "@/components/admin/DeleteButton";

type Row = Record<string, unknown>;

export function AllowedSignupDomainsRow({ row }: { row: Row }) {
  const [state, formAction] = useActionState(
    async (_: unknown, fd: FormData) => updateAllowedSignupDomain(fd),
    null as { error?: string; success?: boolean } | null
  );

  const rowId = String(row.id ?? row.apex_domain ?? "");

  return (
    <tr className="border-b border-zinc-100 last:border-0">
      <td className="px-4 py-3" colSpan={2}>
        <form action={formAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={rowId} />
          <input
            name="apex_domain"
            defaultValue={String(row.apex_domain ?? "").toLowerCase()}
            placeholder="Apex domain"
            className="min-w-[180px] rounded border border-zinc-300 px-2 py-1 text-sm lowercase"
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
          action={deleteAllowedSignupDomain}
          id={rowId}
          confirmMessage="Delete this allowed signup domain?"
        />
      </td>
    </tr>
  );
}
