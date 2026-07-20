import { useEffect, useState } from "react";
import { fetchAiUsageStatus } from "../lib/api.ts";
import { useAsync } from "../lib/useAsync.ts";

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
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 w-[min(24rem,calc(100vw-2rem))]">
      <div
        role={exhausted ? "alert" : "status"}
        className={`pointer-events-auto rounded-xl border p-4 shadow-lg backdrop-blur ${
          exhausted
            ? "border-red-300 bg-red-50/95 text-red-950 dark:border-red-900 dark:bg-red-950/95 dark:text-red-100"
            : "border-amber-300 bg-amber-50/95 text-amber-950 dark:border-amber-900 dark:bg-amber-950/95 dark:text-amber-100"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">
              {exhausted ? "AI summary quota reached" : "AI summary quota is running low"}
            </p>
            <p className="mt-1 text-sm opacity-80">
              {status.requestCount}/{status.dailyRequestLimit} Gemini summary requests used today.
              {exhausted
                ? ` New summaries resume after ${new Date(status.resetAt).toLocaleString()}.`
                : ` ${status.remainingRequests} requests remain in LKMLens's daily free-tier budget.`}
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="focus-ring rounded-md px-2 py-1 text-sm opacity-60 hover:opacity-100"
            aria-label="Dismiss AI quota notice"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
