import { generateEvidenceLinkedSummary, SUMMARY_PROMPT_VERSION } from "@lkmlens/ai";
import {
  getThreadById,
  listSummaryCandidates,
  recordAiFailure,
  recordAiSuccess,
  reserveAiRequest,
  saveCurrentSummary,
} from "@lkmlens/db";
import { createGeminiProvider, GeminiApiError } from "./gemini.js";

const MAX_PER_RUN = 5;
const PROVIDER = "google-gemini";

function positiveInteger(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

async function runSummaries(env: Env): Promise<{ generated: number; failed: number }> {
  const model = env.GEMINI_MODEL;
  const dailyLimit = positiveInteger(env.AI_DAILY_REQUEST_LIMIT, 100);
  const candidates = await listSummaryCandidates(env.DB, {
    limit: MAX_PER_RUN,
    model,
    promptVersion: SUMMARY_PROMPT_VERSION,
  });
  const provider = createGeminiProvider(env.GEMINI_API_KEY, model);
  let generated = 0;
  let failed = 0;

  for (const candidate of candidates) {
    const detail = await getThreadById(env.DB, candidate.threadId);
    if (!detail) continue;
    const reserved = await reserveAiRequest(env.DB, PROVIDER, model, dailyLimit);
    if (!reserved) {
      console.log(JSON.stringify({ event: "ai_daily_budget_reached", provider: PROVIDER, model, dailyLimit }));
      break;
    }
    let aiCompleted = false;
    try {
      const summary = await generateEvidenceLinkedSummary(provider, {
        threadId: detail.thread.id,
        subject: detail.thread.displaySubject,
        messages: detail.messages,
      });
      await recordAiSuccess(env.DB, PROVIDER, model, summary.inputTokens, summary.outputTokens);
      aiCompleted = true;
      // Review trailers are deterministic evidence; never trust the model to
      // invent or normalize them independently.
      summary.content.explicitSignals = detail.reviewSignals.map((signal) => ({
        type: signal.signalType,
        person: signal.personName,
        messageId: signal.messageId,
        sourceUrl: signal.sourceUrl,
      }));
      await saveCurrentSummary(env.DB, { threadId: detail.thread.id, ...summary });
      generated += 1;
      console.log(JSON.stringify({
        event: "summary_generated",
        threadId: detail.thread.id,
        model,
        inputTokens: summary.inputTokens,
        outputTokens: summary.outputTokens,
      }));
    } catch (error) {
      failed += 1;
      const quotaExhausted = error instanceof GeminiApiError && error.quotaExhausted;
      const message = error instanceof Error ? error.message : String(error);
      if (!aiCompleted) {
        await recordAiFailure(env.DB, PROVIDER, model, message, quotaExhausted);
      }
      console.error(JSON.stringify({
        event: "summary_failed",
        threadId: candidate.threadId,
        quotaExhausted,
        error: message,
      }));
    }
  }
  return { generated, failed };
}

export default {
  async scheduled(_controller, env, ctx): Promise<void> {
    ctx.waitUntil(runSummaries(env));
  },
  async fetch(): Promise<Response> {
    return Response.json({ service: "lkmlens-summarizer", provider: PROVIDER, status: "ok" });
  },
} satisfies ExportedHandler<Env>;
