import type { Message } from "@lkmlens/shared";
import { SourceLink } from "./SourceLink.tsx";
import { parseMessageBody } from "../lib/messageBody.ts";
import { formatDate, formatExact } from "../lib/format.ts";

/**
 * An edited correspondence record (DESIGN.md 9.8): proportional body type,
 * quotes behind a left rule, patch hunks in mono with their own scroll, and a
 * collapsed signature.
 */
export function ThreadMessage({
  message,
  index,
  total,
}: {
  message: Message;
  index: number;
  total: number;
}) {
  const blocks = message.bodyText ? parseMessageBody(message.bodyText) : [];

  return (
    <article className="border-b border-border py-6">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="min-w-0 text-body font-medium text-ink">
          {message.authorName ?? "Unknown author"}
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-meta text-ink-muted">
          <span className="tabular">
            {index}/{total}
          </span>
          {message.patchIndex != null && message.patchTotal != null && (
            <span className="tabular">
              patch {message.patchIndex}/{message.patchTotal}
            </span>
          )}
          {message.postedAt && (
            <span className="tabular" title={formatExact(message.postedAt)}>
              {formatDate(message.postedAt)}
            </span>
          )}
          <SourceLink href={message.sourceUrl}>Open on lore</SourceLink>
        </div>
      </header>

      {blocks.length === 0 ? (
        <p className="mt-3 text-small text-ink-faint">
          Message body was not retained for this message. The canonical text remains on lore.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {blocks.map((block, blockIndex) => {
            if (block.kind === "quote") {
              return (
                <blockquote
                  key={blockIndex}
                  className="border-l-2 border-border-strong pl-4 text-body whitespace-pre-wrap text-ink-muted"
                >
                  {block.text}
                </blockquote>
              );
            }
            if (block.kind === "code") {
              // Code scrolls inside its own container so the page never does.
              return (
                <pre
                  key={blockIndex}
                  className="max-h-[28rem] overflow-auto border border-border bg-surface-subtle p-3 font-mono text-meta leading-relaxed text-ink-secondary"
                >
                  {block.text}
                </pre>
              );
            }
            if (block.kind === "signature") {
              return (
                <details key={blockIndex} className="text-small">
                  <summary className="focus-ring cursor-pointer font-mono text-meta text-ink-faint">
                    Signature
                  </summary>
                  <pre className="mt-1.5 font-mono text-meta whitespace-pre-wrap text-ink-faint">
                    {block.text}
                  </pre>
                </details>
              );
            }
            return (
              <p
                key={blockIndex}
                className="max-w-[80ch] text-body whitespace-pre-wrap text-ink-secondary"
              >
                {block.text}
              </p>
            );
          })}
        </div>
      )}
    </article>
  );
}
