"use client";

import { useState } from "react";

type Row = Record<string, unknown>;

export function LlmResponseViewButton({ row }: { row: Row }) {
  const [open, setOpen] = useState(false);
  const response = String(row.llm_model_response ?? "");
  const systemPrompt = String(row.llm_system_prompt ?? "");
  const userPrompt = String(row.llm_user_prompt ?? "");
  const hasLongContent = response.length > 80 || systemPrompt.length > 80 || userPrompt.length > 80;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
      >
        View
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl border border-zinc-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900">
                LLM Response {row.id ? `#${row.id}` : ""}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-50"
              >
                Close
              </button>
            </div>
            <div className="space-y-4 text-sm">
              {systemPrompt && (
                <div>
                  <div className="mb-1 font-semibold text-zinc-600">System Prompt</div>
                  <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded border border-zinc-200 bg-zinc-50 p-3 text-zinc-800">
                    {systemPrompt}
                  </pre>
                </div>
              )}
              {userPrompt && (
                <div>
                  <div className="mb-1 font-semibold text-zinc-600">User Prompt</div>
                  <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded border border-zinc-200 bg-zinc-50 p-3 text-zinc-800">
                    {userPrompt}
                  </pre>
                </div>
              )}
              {response && (
                <div>
                  <div className="mb-1 font-semibold text-zinc-600">Response</div>
                  <pre className="max-h-60 overflow-auto whitespace-pre-wrap rounded border border-zinc-200 bg-zinc-50 p-3 text-zinc-800">
                    {response}
                  </pre>
                </div>
              )}
              {!systemPrompt && !userPrompt && !response && (
                <p className="text-zinc-500">No content to display.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
