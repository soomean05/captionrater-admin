"use client";

import { useState } from "react";
import { createLlmModel } from "./actions";

type Provider = {
  id: string;
  name: string;
};

export function CreateLlmModelForm({
  providers,
}: {
  providers: Provider[];
}) {
  const [providerId, setProviderId] = useState("");
  const [providerModelId, setProviderModelId] = useState("");
  const hasProviders = providers.length > 0;

  return (
    <form action={createLlmModel} className="mt-3 flex flex-wrap gap-3">
      <input
        name="name"
        placeholder="Model name"
        required
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
      />
      <select
        name="llm_provider_id"
        required
        value={providerId}
        onChange={(e) => setProviderId(e.target.value)}
        disabled={!hasProviders}
        className="min-w-[220px] rounded-lg border border-zinc-300 px-3 py-2 text-sm"
      >
        <option value="">Select provider</option>
        {providers.map((provider) => (
          <option key={provider.id} value={provider.id}>
            {provider.name}
          </option>
        ))}
      </select>
      <input
        name="provider_model_id"
        required
        value={providerModelId}
        onChange={(e) => setProviderModelId(e.target.value)}
        placeholder="Provider Model ID (e.g. gpt-4o-mini)"
        className="min-w-[260px] rounded-lg border border-zinc-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={!hasProviders || !providerId || !providerModelId.trim()}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white enabled:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Create
      </button>
    </form>
  );
}
