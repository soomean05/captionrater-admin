"use client";

import { useActionState } from "react";
import {
  updateWhitelistedEmail,
  deleteWhitelistedEmail,
} from "./actions";
import { DeleteButton } from "@/components/admin/DeleteButton";
import {
  getWhitelistEmailFromRow,
  getWhitelistIdForRow,
} from "@/lib/admin/whitelistEmail";

type Row = Record<string, unknown>;

export function WhitelistedEmailsRow({ row }: { row: Row }) {
  const [state, formAction] = useActionState(
    async (_: unknown, fd: FormData) => updateWhitelistedEmail(fd),
    null as { error?: string; success?: boolean } | null
  );

  return (
    <tr className="border-b border-zinc-100 last:border-0">
      <td className="px-4 py-3" colSpan={2}>
        <form action={formAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={getWhitelistIdForRow(row)} />
          <input
            name="email"
            defaultValue={getWhitelistEmailFromRow(row).toLowerCase()}
            placeholder="Email"
            type="email"
            className="min-w-[200px] rounded border border-zinc-300 px-2 py-1 text-sm lowercase"
          />
          <input
            name="notes"
            defaultValue={String(row.notes ?? "")}
            placeholder="Notes"
            className="min-w-[140px] rounded border border-zinc-300 px-2 py-1 text-sm"
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
          action={deleteWhitelistedEmail}
          id={getWhitelistIdForRow(row)}
          confirmMessage="Delete this whitelisted email?"
        />
      </td>
    </tr>
  );
}
