import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { tableHasColumn } from "@/lib/admin/schema";

async function countTable(
  supabase: ReturnType<typeof createAdminClient>,
  table: string
) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  return { count: count ?? 0, error };
}

type Row = Record<string, unknown>;

function toNum(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const [
    profiles,
    images,
    captions,
    superadmins,
    votesResult,
    imagesHasIsPublic,
    imagesHasIsCommonUse,
    imagesHasDescription,
    imagesHasImageDescription,
    imagesHasContext,
    imagesHasAdditionalContext,
    captionsPublicCol,
    captionsFeaturedCol,
    captionsHasLikeCount,
    captionsHasLikes,
    captionsHasLikesCount,
    captionsImageIdCol,
    votesCreatedCol,
    votesHasCaptionId,
    votesHasCaptionsId,
  ] = await Promise.all([
    countTable(supabase, "profiles"),
    countTable(supabase, "images"),
    countTable(supabase, "captions"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_superadmin", true),
    supabase.from("caption_votes").select("*"),
    tableHasColumn(supabase, "images", "is_public"),
    tableHasColumn(supabase, "images", "is_common_use"),
    tableHasColumn(supabase, "images", "description"),
    tableHasColumn(supabase, "images", "image_description"),
    tableHasColumn(supabase, "images", "context"),
    tableHasColumn(supabase, "images", "additional_context"),
    tableHasColumn(supabase, "captions", "is_public"),
    tableHasColumn(supabase, "captions", "is_featured"),
    tableHasColumn(supabase, "captions", "like_count"),
    tableHasColumn(supabase, "captions", "likes"),
    tableHasColumn(supabase, "captions", "likes_count"),
    tableHasColumn(supabase, "captions", "image_id"),
    tableHasColumn(supabase, "caption_votes", "created_datetime_utc"),
    tableHasColumn(supabase, "caption_votes", "caption_id"),
    tableHasColumn(supabase, "caption_votes", "captions_id"),
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

  const imagesDataResult = await supabase
    .from("images")
    .select(
      [
        "id",
        "url",
        "created_datetime_utc",
        imagesHasIsPublic ? "is_public" : null,
        imagesHasIsCommonUse ? "is_common_use" : null,
        imagesHasDescription ? "description" : null,
        imagesHasImageDescription ? "image_description" : null,
        imagesHasContext ? "context" : null,
        imagesHasAdditionalContext ? "additional_context" : null,
      ]
        .filter(Boolean)
        .join(",")
    )
    .order("created_datetime_utc", { ascending: false })
    .limit(250);
  const imagesRows = ((imagesDataResult.data ?? []) as unknown[]) as Row[];

  const captionsDataResult = await supabase
    .from("captions")
    .select(
      [
        "id",
        "content",
        "created_datetime_utc",
        captionsImageIdCol ? "image_id" : null,
        captionsPublicCol ? "is_public" : null,
        captionsFeaturedCol ? "is_featured" : null,
        captionsHasLikeCount ? "like_count" : null,
        captionsHasLikes ? "likes" : null,
        captionsHasLikesCount ? "likes_count" : null,
      ]
        .filter(Boolean)
        .join(",")
    )
    .order("created_datetime_utc", { ascending: false })
    .limit(300);
  const captionsRows = ((captionsDataResult.data ?? []) as unknown[]) as Row[];

  const imagesPublicCount = imagesRows.filter((r) => r.is_public === true).length;
  const imagesCommonUseCount = imagesRows.filter((r) => r.is_common_use === true).length;
  const imagesMissingDescCount = imagesRows.filter((r) => {
    const desc = String(r.description ?? r.image_description ?? "").trim();
    const ctx = String(r.context ?? r.additional_context ?? "").trim();
    return desc.length === 0 && ctx.length === 0;
  }).length;

  const captionsPublicCount = captionsRows.filter((r) => r.is_public === true).length;
  const captionsFeaturedCount = captionsRows.filter((r) => r.is_featured === true).length;
  const captionsWithoutImageCount = captionsRows.filter((r) => {
    const imageId = String(r.image_id ?? "").trim();
    return imageId.length === 0;
  }).length;

  const likesValues = captionsRows.map((r) =>
    toNum(r.like_count ?? r.likes_count ?? r.likes)
  );
  const avgLikes =
    likesValues.length > 0
      ? likesValues.reduce((sum, v) => sum + v, 0) / likesValues.length
      : 0;

  const mostLiked = [...captionsRows]
    .sort((a, b) => toNum(b.like_count ?? b.likes_count ?? b.likes) - toNum(a.like_count ?? a.likes_count ?? a.likes))
    .slice(0, 5);

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
    {
      label: "Public captions",
      value: captionsPublicCount,
      href: "/admin/captions",
      error: captionsDataResult.error,
    },
    {
      label: "Public images",
      value: imagesPublicCount,
      href: "/admin/images",
      error: imagesDataResult.error,
    },
    {
      label: "Featured captions",
      value: captionsFeaturedCount,
      href: "/admin/captions",
      error: captionsDataResult.error,
    },
    {
      label: "Common-use images",
      value: imagesCommonUseCount,
      href: "/admin/images",
      error: imagesDataResult.error,
    },
  ];

  const recentImages = imagesRows.slice(0, 5);
  const recentVotes = votes
    .slice()
    .sort((a, b) => {
      const av = votesCreatedCol ? String(a.created_datetime_utc ?? "") : "";
      const bv = votesCreatedCol ? String(b.created_datetime_utc ?? "") : "";
      return bv.localeCompare(av);
    })
    .slice(0, 5);

  const voteCaptionIdColumn = (["caption_id", "captions_id"] as const).find(
    (k) => (k === "caption_id" ? votesHasCaptionId : votesHasCaptionsId) || k in voteSample
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

  const activityBarTotal = Math.max(1, upvotes + downvotes);
  const upPct = Math.round((upvotes / activityBarTotal) * 100);
  const downPct = Math.max(0, 100 - upPct);

  const captionsPerImageMap = new Map<string, number>();
  for (const row of captionsRows) {
    const imageId = String(row.image_id ?? "").trim();
    if (!imageId) continue;
    captionsPerImageMap.set(imageId, (captionsPerImageMap.get(imageId) ?? 0) + 1);
  }
  const captionsPerImage = [...captionsPerImageMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxCaptionsPerImage = Math.max(1, ...captionsPerImage.map((x) => x[1]));

  const publicPrivateCaption = {
    public: captionsPublicCount,
    private: Math.max(0, (captions.count ?? 0) - captionsPublicCount),
  };
  const publicPrivateImage = {
    public: imagesPublicCount,
    private: Math.max(0, (images.count ?? 0) - imagesPublicCount),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Admin control center with usage, quality, and moderation insights.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm lg:col-span-1">
          <h2 className="text-sm font-semibold text-zinc-900">Upvotes vs Downvotes</h2>
          <div className="mt-3 overflow-hidden rounded-lg border border-zinc-200">
            <div className="flex h-6 w-full">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${upPct}%` }}
                title={`${upvotes} upvotes`}
              />
              <div
                className="h-full bg-rose-500"
                style={{ width: `${downPct}%` }}
                title={`${downvotes} downvotes`}
              />
            </div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-zinc-600">
            <span>{upvotes} upvotes</span>
            <span>{downvotes} downvotes</span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-zinc-900">Public vs Private</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              {
                title: "Captions",
                pub: publicPrivateCaption.public,
                pri: publicPrivateCaption.private,
              },
              {
                title: "Images",
                pub: publicPrivateImage.public,
                pri: publicPrivateImage.private,
              },
            ].map((item) => {
              const total = Math.max(1, item.pub + item.pri);
              const pubW = Math.round((item.pub / total) * 100);
              return (
                <div key={item.title} className="rounded-lg border border-zinc-200 p-3">
                  <div className="text-xs font-medium text-zinc-600">{item.title}</div>
                  <div className="mt-2 overflow-hidden rounded-md border border-zinc-200">
                    <div className="flex h-4">
                      <div className="bg-blue-500" style={{ width: `${pubW}%` }} />
                      <div className="bg-zinc-300" style={{ width: `${100 - pubW}%` }} />
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-zinc-600">
                    <span>Public {item.pub}</span>
                    <span>Private {item.pri}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Captions Per Image</h2>
            <span className="text-xs text-zinc-500">Top 6</span>
          </div>
          <div className="mt-3 space-y-2">
            {captionsPerImage.length === 0 ? (
              <p className="text-sm text-zinc-500">No caption-image associations yet.</p>
            ) : (
              captionsPerImage.map(([imageId, c]) => (
                <div key={imageId}>
                  <div className="mb-1 flex items-center justify-between text-xs text-zinc-600">
                    <span className="font-mono">{imageId}</span>
                    <span>{c}</span>
                  </div>
                  <div className="h-2 rounded bg-zinc-100">
                    <div
                      className="h-2 rounded bg-indigo-500"
                      style={{ width: `${Math.max(6, Math.round((c / maxCaptionsPerImage) * 100))}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Quality Signals</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-zinc-200 p-3">
              <div className="text-xs text-zinc-500">Avg caption likes</div>
              <div className="mt-1 text-xl font-semibold tabular-nums">{avgLikes.toFixed(2)}</div>
            </div>
            <div className="rounded-lg border border-zinc-200 p-3">
              <div className="text-xs text-zinc-500">Captions without images</div>
              <div className="mt-1 text-xl font-semibold tabular-nums">{captionsWithoutImageCount}</div>
            </div>
            <div className="rounded-lg border border-zinc-200 p-3">
              <div className="text-xs text-zinc-500">Images missing desc/context</div>
              <div className="mt-1 text-xl font-semibold tabular-nums">{imagesMissingDescCount}</div>
            </div>
            <div className="rounded-lg border border-zinc-200 p-3">
              <div className="text-xs text-zinc-500">Featured captions</div>
              <div className="mt-1 text-xl font-semibold tabular-nums">{captionsFeaturedCount}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Most Liked Captions</h2>
            <Link
              href="/admin/captions"
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
            >
              View captions
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {mostLiked.length === 0 ? (
              <p className="text-sm text-zinc-500">No caption likes data.</p>
            ) : (
              mostLiked.map((row) => (
                <div
                  key={String(row.id)}
                  className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2"
                >
                  <div className="truncate text-sm text-zinc-900">
                    {String(row.content ?? "—")}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    Likes: {toNum(row.like_count ?? row.likes_count ?? row.likes)}
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

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Recently Uploaded Images</h2>
            <Link
              href="/admin/images"
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
            >
              View images
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {recentImages.length === 0 ? (
              <p className="text-sm text-zinc-500">No recent image uploads.</p>
            ) : (
              recentImages.map((row) => (
                <div key={String(row.id)} className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2">
                  <div className="truncate text-sm text-zinc-900">{String(row.url ?? "—")}</div>
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
            <h2 className="text-sm font-semibold text-zinc-900">Recent Caption Votes</h2>
            <Link
              href="/admin/caption-rating-stats"
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
            >
              Open rating stats
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {recentVotes.length === 0 ? (
              <p className="text-sm text-zinc-500">No recent votes.</p>
            ) : (
              recentVotes.map((row, i) => (
                <div key={`${String(row.id ?? i)}-${i}`} className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2">
                  <div className="text-sm text-zinc-900">
                    Caption ID: {String(row.caption_id ?? row.captions_id ?? "—")}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {votesCreatedCol
                      ? new Date(String(row.created_datetime_utc ?? "")).toLocaleString()
                      : "Timestamp unavailable"}
                  </div>
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
