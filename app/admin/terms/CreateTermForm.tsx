"use client";

import { useState } from "react";
import { createTerm } from "./actions";

export function CreateTermForm() {
  const [term, setTerm] = useState("");
  const [example, setExample] = useState("");

  return (
    <form action={createTerm} className="mt-3 flex flex-wrap gap-3">
      <input
        name="term"
        placeholder="Term / name"
        required
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
      />
      <input
        name="definition"
        placeholder="Definition"
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
      />
      <textarea
        name="example"
        placeholder="Example"
        required
        value={example}
        onChange={(e) => setExample(e.target.value)}
        className="min-w-[280px] rounded-lg border border-zinc-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={!term.trim() || !example.trim()}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white enabled:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Create
      </button>
    </form>
  );
}
