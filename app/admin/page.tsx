import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

async function countTable(
  supabase: ReturnType<typeof createAdminClient>,
  table: string
) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  return { count: count ?? 0, error };
}

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const [profiles, images, captions, superadmins, votesResult] = await Promise.all([
    countTable(supabase, "profiles"),
    countTable(supabase, "images"),
    countTable(supabase, "captions"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_superadmin", true),
    supabase.from("caption_votes").select("*"),
  ]);

  const votes = (votesResult.data ?? []) as Record<string, unknown>[];
  const voteSample = votes[0] ?? {};
  const scoreColumn = (["vote_score", "score", "value", "rating", "vote"] as const).find(
    (k) => k in voteSample
  );
  const upvoteColumn = (["is_upvote", "upvote", "is_positive"] as const).find(
    (k) => k in voteSample
  );
  const downvoteColumn = (["is_downvote", "downvote", "is_negative"] as const).find(
    (k) => k in voteSample
  );

  let upvotes = 0;
  let downvotes = 0;
  for (const row of votes) {
    if (scoreColumn) {
      const score = Number(row[scoreColumn] ?? 0);
      if (Number.isFinite(score) && score > 0) upvotes += 1;
      if (Number.isFinite(score) && score < 0) downvotes += 1;
      continue;
    }
    if (upvoteColumn) {
      if (row[upvoteColumn] === true) upvotes += 1;
      else downvotes += 1;
      continue;
    }
    if (downvoteColumn) {
      if (row[downvoteColumn] === true) downvotes += 1;
      else upvotes += 1;
    }
  }

  const stats = [
    {
      label: "Total users",
      value: profiles.count,
      href: "/admin/users",
      error: profiles.error,
    },
    {
      label: "Total images",
      value: images.count,
      href: "/admin/images",
      error: images.error,
    },
    {
      label: "Total captions",
      value: captions.count,
      href: "/admin/captions",
      error: captions.error,
    },
    {
      label: "Superadmins",
      value: superadmins.count ?? 0,
      href: "/admin/users",
      error: superadmins.error,
    },
    {
      label: "Total votes",
      value: votes.length,
      href: "/admin/caption-rating-stats",
      error: votesResult.error,
    },
    {
      label: "Upvotes",
      value: upvotes,
      href: "/admin/caption-rating-stats",
      error: votesResult.error,
    },
    {
      label: "Downvotes",
      value: downvotes,
      href: "/admin/caption-rating-stats",
      error: votesResult.error,
    },
  ];

  const recentCaptionsResult = await supabase
    .from("captions")
    .select("id,content,created_datetime_utc")
    .order("created_datetime_utc", { ascending: false })
    .limit(5);
  const recentCaptions = (recentCaptionsResult.data ?? []) as Record<string, unknown>[];

  const voteCaptionIdColumn = (["caption_id", "captions_id"] as const).find(
    (k) => k in voteSample
  );
  const mostRatedMap = new Map<string, number>();
  if (voteCaptionIdColumn) {
    for (const row of votes) {
      const captionId = String(row[voteCaptionIdColumn] ?? "");
      if (!captionId) continue;
      mostRatedMap.set(captionId, (mostRatedMap.get(captionId) ?? 0) + 1);
    }
  }
  const mostRated = [...mostRatedMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const mostRatedIds = mostRated.map((x) => x[0]);
  let mostRatedCaptionsById = new Map<string, string>();
  if (mostRatedIds.length > 0) {
    const { data } = await supabase
      .from("captions")
      .select("id,content")
      .in("id", mostRatedIds);
    mostRatedCaptionsById = new Map(
      ((data ?? []) as Record<string, unknown>[]).map((r) => [String(r.id), String(r.content ?? "—")])
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Database statistics at a glance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50"
          >
            <div className="text-sm font-medium text-zinc-600">{s.label}</div>
            <div className="mt-2 text-2xl font-semibold tabular-nums">
              {s.error ? "—" : s.value}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Recent Activity</h2>
            <Link
              href="/admin/captions"
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
            >
              View captions
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {recentCaptions.length === 0 ? (
              <p className="text-sm text-zinc-500">No recent captions.</p>
            ) : (
              recentCaptions.map((row) => (
                <div
                  key={String(row.id)}
                  className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2"
                >
                  <div className="truncate text-sm text-zinc-900">
                    {String(row.content ?? "—")}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {row.created_datetime_utc
                      ? new Date(String(row.created_datetime_utc)).toLocaleString()
                      : "—"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Most Rated Captions</h2>
            <Link
              href="/admin/caption-rating-stats"
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
            >
              Open rating stats
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {mostRated.length === 0 ? (
              <p className="text-sm text-zinc-500">No vote data yet.</p>
            ) : (
              mostRated.map(([captionId, votesCount]) => (
                <div
                  key={captionId}
                  className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2"
                >
                  <div className="truncate text-sm text-zinc-900">
                    {mostRatedCaptionsById.get(captionId) ?? captionId}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">{votesCount} votes</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <p className="text-sm text-zinc-600">
        <Link
          href="/admin/schema-check"
          className="font-medium text-zinc-900 underline hover:no-underline"
        >
          Schema check
        </Link>
        {" — test table access and discover column names for broken pages"}
      </p>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Quick links</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            "users",
            "images",
            "humor-flavors",
            "humor-flavor-steps",
            "humor-mix",
            "terms",
            "captions",
            "caption-requests",
            "caption-examples",
            "caption-rating-stats",
            "llm-models",
            "llm-providers",
            "llm-prompt-chains",
            "llm-responses",
            "allowed-signup-domains",
            "whitelisted-emails",
          ].map((slug) => (
            <Link
              key={slug}
              href={`/admin/${slug}`}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
            >
              {slug.replace(/-/g, " ")}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
