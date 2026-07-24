import { Link } from "react-router";
import type { CurationPatch, PatchLifecycleStage } from "@lkmlens/shared";
import { StatusTag, type TagTone } from "./StatusTag.tsx";
import { formatDate, formatExact, formatRelative } from "../lib/format.ts";

/**
 * The default feed item is a row, not a card (DESIGN.md 9.4): status mark,
 * subject, taxonomy, then mono evidence metadata on one line.
 */

const stage: Record<PatchLifecycleStage, { label: string; tone: TagTone }> = {
  submitted: { label: "Submitted", tone: "neutral" },
  "under-review": { label: "Review evidence", tone: "info" },
  "maintainer-tree": { label: "Maintainer tree", tone: "info" },
  mainline: { label: "Mainline", tone: "evidence" },
  released: { label: "Released", tone: "evidence" },
  "stable-backport": { label: "Stable backport", tone: "evidence" },
  "android-common": { label: "Android common", tone: "evidence" },
};

function reviewEvidence(patch: CurationPatch): string {
  const parts: string[] = [];
  if (patch.reviewedCount > 0) parts.push(`${patch.reviewedCount} reviewed-by`);
  if (patch.ackedCount > 0) parts.push(`${patch.ackedCount} acked-by`);
  return parts.length > 0 ? parts.join(" · ") : "no explicit review trailer";
}

export function PatchRow({ patch }: { patch: CurationPatch }) {
  const step = stage[patch.lifecycleStage];
  const taxonomy = [...patch.vendors, ...patch.topics];
  const activity = patch.lastActivityAt ?? patch.firstPostedAt;

  return (
    <article className="group border-b border-border py-5 transition-colors hover:bg-surface-subtle">
      <div className="flex items-start justify-between gap-4">
        <StatusTag tone={step.tone}>{step.label}</StatusTag>
        <span
          className="shrink-0 font-mono text-meta text-ink-muted"
          title={formatExact(activity)}
        >
          {formatRelative(activity) ?? formatDate(activity)}
        </span>
      </div>

      <h3 className="mt-2.5 text-body-lg font-medium text-ink">
        <Link
          to={`/threads/${patch.threadId}`}
          className="focus-ring transition-colors hover:text-accent"
        >
          {patch.subject}
        </Link>
      </h3>

      <p className="mt-1 text-small text-ink-muted">
        {patch.authorName ?? "Unknown author"}
        {taxonomy.length > 0 && <span aria-hidden="true"> · </span>}
        {taxonomy.join(" · ")}
      </p>

      {(patch.affectedLayers.length > 0 || patch.likelyStakeholders.length > 0) && (
        <p className="mt-2 max-w-[76ch] text-small text-ink-secondary">
          {patch.affectedLayers.length > 0 && (
            <>
              Touches <span className="text-ink">{patch.affectedLayers.join(", ")}</span>.
            </>
          )}
          {patch.likelyStakeholders.length > 0 && (
            <> Likely owners: {patch.likelyStakeholders.join(", ")}.</>
          )}
        </p>
      )}

      <p className="mt-3 font-mono text-meta text-ink-muted">
        {patch.patchVersion != null && <>v{patch.patchVersion} · </>}
        {formatDate(patch.firstPostedAt)} · {reviewEvidence(patch)}
      </p>
    </article>
  );
}
