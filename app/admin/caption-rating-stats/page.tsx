import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { PaginationBar } from "@/components/admin/PaginationBar";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatSupabaseError } from "@/lib/admin/formatError";

const PAGE_SIZE = 10;

type Row = Record<string, unknown>;

type CaptionAggregate = {
  captionId: string;
  voteCount: number;
  upvotes: number;
  downvotes: number;
  scoreSum: number;
  avgScore: number;
};

function parsePage(raw: string | string[] | undefined): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(v ?? 1);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function normalizeVote(
  row: Row,
  scoreColumn?: string,
  upvoteColumn?: string,
  downvoteColumn?: string
): { score: number; isUpvote: boolean; isDownvote: boolean } {
  if (scoreColumn) {
    const rawScore = toNumber(row[scoreColumn]);
    const score = rawScore ?? 0;
    return { score, isUpvote: score > 0, isDownvote: score < 0 };
  }

  if (upvoteColumn) {
    const isUpvote = Boolean(row[upvoteColumn]);
    const isDownvote = !isUpvote;
    return { score: isUpvote ? 1 : -1, isUpvote, isDownvote };
  }

  if (downvoteColumn) {
    const isDownvote = Boolean(row[downvoteColumn]);
    const isUpvote = !isDownvote;
    return { score: isDownvote ? -1 : 1, isUpvote, isDownvote };
  }

  return { score: 0, isUpvote: false, isDownvote: false };
}

export default async function AdminCaptionRatingStatsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";

  const supabase = createAdminClient();
  const votesResult = await supabase.from("caption_votes").select("*");
  const votesError = votesResult.error;
  const votes = (votesResult.data ?? []) as Row[];

  if (votesError) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Caption Rating Stats"
          subtitle="Statistics from caption_votes with caption/image metadata."
        />
        <AdminTable
          error={formatSupabaseError(votesError)}
          empty={false}
          colSpan={1}
          headers={<tr><th className="px-4 py-3">Error</th></tr>}
        >
          {null}
        </AdminTable>
      </div>
    );
  }

  const sample = votes[0] ?? {};
  const captionIdColumn = ([
    "caption_id",
    "captions_id",
  ] as const).find((k) => k in sample);
  const scoreColumn = ([
    "vote_score",
    "score",
    "value",
    "rating",
    "vote",
  ] as const).find((k) => k in sample);
  const upvoteColumn = ([
    "is_upvote",
    "upvote",
    "is_positive",
  ] as const).find((k) => k in sample);
  const downvoteColumn = ([
    "is_downvote",
    "downvote",
    "is_negative",
  ] as const).find((k) => k in sample);

  if (!captionIdColumn) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Caption Rating Stats"
          subtitle="Statistics from caption_votes with caption/image metadata."
        />
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          caption_votes does not contain a recognizable caption reference column
          (expected one of: caption_id, captions_id).
        </div>
      </div>
    );
  }

  const byCaption = new Map<string, CaptionAggregate>();
  let totalUpvotes = 0;
  let totalDownvotes = 0;
  let totalScore = 0;
  let countedScoreVotes = 0;

  for (const row of votes) {
    const captionId = String(row[captionIdColumn] ?? "").trim();
    if (!captionId) continue;

    const normalized = normalizeVote(
      row,
      scoreColumn,
      upvoteColumn,
      downvoteColumn
    );

    let bucket = byCaption.get(captionId);
    if (!bucket) {
      bucket = {
        captionId,
        voteCount: 0,
        upvotes: 0,
        downvotes: 0,
        scoreSum: 0,
        avgScore: 0,
      };
      byCaption.set(captionId, bucket);
    }

    bucket.voteCount += 1;
    bucket.scoreSum += normalized.score;
    if (normalized.isUpvote) bucket.upvotes += 1;
    if (normalized.isDownvote) bucket.downvotes += 1;

    if (normalized.isUpvote) totalUpvotes += 1;
    if (normalized.isDownvote) totalDownvotes += 1;
    totalScore += normalized.score;
    countedScoreVotes += 1;
  }

  const aggregates = [...byCaption.values()].map((x) => ({
    ...x,
    avgScore: x.voteCount > 0 ? x.scoreSum / x.voteCount : 0,
  }));

  const topRated = [...aggregates].sort((a, b) => {
    if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
    return b.voteCount - a.voteCount;
  });
  const mostRated = [...aggregates].sort((a, b) => {
    if (b.voteCount !== a.voteCount) return b.voteCount - a.voteCount;
    return b.avgScore - a.avgScore;
  });

  const topSource = q
    ? topRated.filter((r) => r.captionId.toLowerCase().includes(q))
    : topRated;
  const mostSource = q
    ? mostRated.filter((r) => r.captionId.toLowerCase().includes(q))
    : mostRated;

  const topTotal = topSource.length;
  const mostTotal = mostSource.length;

  const topFrom = (page - 1) * PAGE_SIZE;
  const topTo = topFrom + PAGE_SIZE;
  const mostFrom = (page - 1) * PAGE_SIZE;
  const mostTo = mostFrom + PAGE_SIZE;
  const topPageRows = topSource.slice(topFrom, topTo);
  const mostPageRows = mostSource.slice(mostFrom, mostTo);

  const captionIds = new Set<string>();
  for (const row of topPageRows) captionIds.add(row.captionId);
  for (const row of mostPageRows) captionIds.add(row.captionId);

  const captionsMap = new Map<string, Row>();
  if (captionIds.size > 0) {
    const { data: captions } = await supabase
      .from("captions")
      .select("id,content,image_id")
      .in("id", [...captionIds]);
    for (const c of (captions ?? []) as Row[]) {
      captionsMap.set(String(c.id), c);
    }
  }

  const imageIds = new Set<string>();
  for (const c of captionsMap.values()) {
    const imageId = String(c.image_id ?? "").trim();
    if (imageId) imageIds.add(imageId);
  }

  const imagesMap = new Map<string, Row>();
  if (imageIds.size > 0) {
    const { data: images } = await supabase
      .from("images")
      .select("id,url")
      .in("id", [...imageIds]);
    for (const i of (images ?? []) as Row[]) {
      imagesMap.set(String(i.id), i);
    }
  }

  const averageVoteScore =
    countedScoreVotes > 0 ? totalScore / countedScoreVotes : 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Caption Rating Stats"
        subtitle="Statistics from caption_votes with caption/image metadata."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total captions", value: byCaption.size },
          { label: "Total votes", value: votes.length },
          { label: "Total upvotes", value: totalUpvotes },
          { label: "Total downvotes", value: totalDownvotes },
          { label: "Average vote score", value: averageVoteScore.toFixed(3) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {stat.label}
            </div>
            <div className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <form method="get" className="flex flex-wrap gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search caption ID"
            className="min-w-[260px] rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Search
          </button>
        </form>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-900">Top-Rated Captions</h2>
        <AdminTable
          empty={topPageRows.length === 0}
          emptyMessage="No rated captions found."
          colSpan={7}
          headers={
            <tr>
              <th className="px-4 py-3">Caption ID</th>
              <th className="px-4 py-3">Caption Content</th>
              <th className="px-4 py-3">Image URL</th>
              <th className="px-4 py-3">Avg Score</th>
              <th className="px-4 py-3">Votes</th>
              <th className="px-4 py-3">Upvotes</th>
              <th className="px-4 py-3">Downvotes</th>
            </tr>
          }
        >
          {topPageRows.map((row) => {
            const caption = captionsMap.get(row.captionId);
            const imageId = String(caption?.image_id ?? "");
            const image = imageId ? imagesMap.get(imageId) : undefined;
            const content = String(caption?.content ?? "—");
            const imageUrl = String(image?.url ?? "—");
            return (
              <tr key={`top-${row.captionId}`} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3 font-mono text-xs text-zinc-700">{row.captionId}</td>
                <td className="max-w-xl truncate px-4 py-3 text-zinc-900">{content}</td>
                <td className="max-w-sm truncate px-4 py-3 text-zinc-700">{imageUrl}</td>
                <td className="px-4 py-3 tabular-nums text-zinc-700">{row.avgScore.toFixed(3)}</td>
                <td className="px-4 py-3 tabular-nums text-zinc-700">{row.voteCount}</td>
                <td className="px-4 py-3 tabular-nums text-emerald-700">{row.upvotes}</td>
                <td className="px-4 py-3 tabular-nums text-rose-700">{row.downvotes}</td>
              </tr>
            );
          })}
        </AdminTable>
        <PaginationBar
          pathname="/admin/caption-rating-stats"
          page={page}
          pageSize={PAGE_SIZE}
          total={topTotal}
          rowCount={topPageRows.length}
          preserveParams={q ? { q } : undefined}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-900">Most-Rated Captions</h2>
        <AdminTable
          empty={mostPageRows.length === 0}
          emptyMessage="No rated captions found."
          colSpan={7}
          headers={
            <tr>
              <th className="px-4 py-3">Caption ID</th>
              <th className="px-4 py-3">Caption Content</th>
              <th className="px-4 py-3">Image URL</th>
              <th className="px-4 py-3">Votes</th>
              <th className="px-4 py-3">Avg Score</th>
              <th className="px-4 py-3">Upvotes</th>
              <th className="px-4 py-3">Downvotes</th>
            </tr>
          }
        >
          {mostPageRows.map((row) => {
            const caption = captionsMap.get(row.captionId);
            const imageId = String(caption?.image_id ?? "");
            const image = imageId ? imagesMap.get(imageId) : undefined;
            const content = String(caption?.content ?? "—");
            const imageUrl = String(image?.url ?? "—");
            return (
              <tr key={`most-${row.captionId}`} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3 font-mono text-xs text-zinc-700">{row.captionId}</td>
                <td className="max-w-xl truncate px-4 py-3 text-zinc-900">{content}</td>
                <td className="max-w-sm truncate px-4 py-3 text-zinc-700">{imageUrl}</td>
                <td className="px-4 py-3 tabular-nums text-zinc-700">{row.voteCount}</td>
                <td className="px-4 py-3 tabular-nums text-zinc-700">{row.avgScore.toFixed(3)}</td>
                <td className="px-4 py-3 tabular-nums text-emerald-700">{row.upvotes}</td>
                <td className="px-4 py-3 tabular-nums text-rose-700">{row.downvotes}</td>
              </tr>
            );
          })}
        </AdminTable>
        <PaginationBar
          pathname="/admin/caption-rating-stats"
          page={page}
          pageSize={PAGE_SIZE}
          total={mostTotal}
          rowCount={mostPageRows.length}
          preserveParams={q ? { q } : undefined}
        />
      </div>
    </div>
  );
}

