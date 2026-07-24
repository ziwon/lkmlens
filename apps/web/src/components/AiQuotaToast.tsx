import { useEffect, useState } from "react";
import { fetchAiUsageStatus } from "../lib/api.ts";
import { useAsync } from "../lib/useAsync.ts";

/** Toasts are one of the few surfaces allowed a shadow (DESIGN.md 7.3). */
export function AiQuotaToast() {
  const result = useAsync(fetchAiUsageStatus, []);
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);

  useEffect(() => {
    setDismissedKey(localStorage.getItem("lkmlens-ai-quota-dismissed"));
  }, []);

  if (result.status !== "success" || result.data.state === "normal") return null;
  const status = result.data;
  const key = `${status.usageDate}:${status.state}`;
  if (dismissedKey === key) return null;
  const exhausted = status.state === "exhausted";

  function dismiss() {
    localStorage.setItem("lkmlens-ai-quota-dismissed", key);
    setDismissedKey(key);
  }

  return (
    <div className="pointer-events-none fixed right-5 bottom-5 z-50 w-[min(24rem,calc(100vw-2.5rem))]">
      <div
        role={exhausted ? "alert" : "status"}
        className={`pointer-events-auto border border-border border-l-2 bg-surface p-4 shadow-overlay ${
          exhausted ? "border-l-danger" : "border-l-warning"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className={`font-mono text-meta tracking-[0.08em] uppercase ${
                exhausted ? "text-danger" : "text-warning"
              }`}
            >
              {exhausted ? "AI summaries paused" : "AI summary quota low"}
            </p>
            <p className="mt-2 text-small text-ink-secondary">
              <span className="font-mono tabular text-ink">
                {status.requestCount}/{status.dailyRequestLimit}
              </span>{" "}
              Gemini summary requests used today.{" "}
              {exhausted
                ? `New summaries resume after ${new Date(status.resetAt).toLocaleString()}.`
                : `${status.remainingRequests} requests remain in the daily free-tier budget.`}
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="focus-ring -mt-1 -mr-1 inline-flex size-8 shrink-0 items-center justify-center text-ink-muted transition-colors hover:text-ink"
            aria-label="Dismiss AI quota notice"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </div>
    </div>
  );
}
