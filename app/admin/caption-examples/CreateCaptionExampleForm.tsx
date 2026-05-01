"use client";

import { useState } from "react";
import { createCaptionExample } from "./actions";

export function CreateCaptionExampleForm() {
  const [caption, setCaption] = useState("");
  const [imageDescription, setImageDescription] = useState("");

  return (
    <form action={createCaptionExample} className="mt-3 flex flex-wrap gap-3">
      <input
        name="caption"
        placeholder="Caption text"
        required
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
      />
      <textarea
        name="image_description"
        placeholder="Image description"
        required
        value={imageDescription}
        onChange={(e) => setImageDescription(e.target.value)}
        className="min-w-[320px] rounded-lg border border-zinc-300 px-3 py-2 text-sm"
      />
      <input
        name="humor_flavor_id"
        placeholder="Humor flavor ID (optional)"
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={!caption.trim() || !imageDescription.trim()}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white enabled:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Create
      </button>
    </form>
  );
}
