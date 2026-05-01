"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

type DeleteActionResult = void | { error?: string } | null | undefined;

type DeleteButtonProps = {
  action: (formData: FormData) => DeleteActionResult | Promise<DeleteActionResult>;
  id: string;
  label?: string;
  confirmMessage?: string;
};

export function DeleteButton({
  action,
  id,
  label = "Delete",
  confirmMessage = "Are you sure you want to delete this?",
}: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm(confirmMessage)) return;
    const formData = new FormData();
    formData.set("id", id);
    startTransition(async () => {
      const result = (await action(formData)) as { error?: string } | void;
      if (result && typeof result === "object" && "error" in result && result.error) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form>
      <input type="hidden" name="id" value={id} />
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
      >
        {isPending ? "Deleting…" : label}
      </button>
    </form>
  );
}
