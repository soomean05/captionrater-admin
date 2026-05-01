"use client";

import { useState } from "react";
import { createCaptionExample } from "./actions";

export function CreateCaptionExampleForm() {
  const [caption, setCaption] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [explanation, setExplanation] = useState("");
  const [showExplanationError, setShowExplanationError] = useState(false);

  return (
    <form
      action={createCaptionExample}
      onSubmit={(e) => {
        if (!explanation.trim()) {
          e.preventDefault();
          setShowExplanationError(true);
        }
      }}
      className="mt-3 flex flex-wrap gap-3"
    >
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
      <div className="flex min-w-[320px] flex-col gap-1">
        <textarea
          name="explanation"
          placeholder="Explanation"
          required
          value={explanation}
          onChange={(e) => {
            setExplanation(e.target.value);
            if (e.target.value.trim()) setShowExplanationError(false);
          }}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        {showExplanationError && !explanation.trim() ? (
          <p className="text-xs text-red-600">Explanation is required.</p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={!caption.trim() || !imageDescription.trim() || !explanation.trim()}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white enabled:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Create
      </button>
    </form>
  );
}
