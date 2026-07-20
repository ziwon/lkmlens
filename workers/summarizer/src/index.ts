import { generateEvidenceLinkedSummary, SUMMARY_PROMPT_VERSION, type SummaryProvider } from "@lkmlens/ai";
import { getThreadById, listSummaryCandidates, saveCurrentSummary } from "@lkmlens/db";

const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast" as const;
const MAX_PER_RUN = 5;

function createProvider(ai: Ai): SummaryProvider {
  return {
    model: MODEL,
    async generateJson(prompt) {
      const output = await ai.run(MODEL, {
        prompt,
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 2_048,
      });
      const text = typeof output === "string" ? output : "response" in output ? output.response : null;
      if (typeof text !== "string") throw new Error("Workers AI returned no text response");
      return JSON.parse(text) as unknown;
    },
  };
}

async function runSummaries(env: Env): Promise<{ generated: number; failed: number }> {
  const candidates = await listSummaryCandidates(env.DB, {
    limit: MAX_PER_RUN,
    model: MODEL,
    promptVersion: SUMMARY_PROMPT_VERSION,
  });
  const provider = createProvider(env.AI);
  let generated = 0;
  let failed = 0;

  for (const candidate of candidates) {
    try {
      const detail = await getThreadById(env.DB, candidate.threadId);
      if (!detail) continue;
      const summary = await generateEvidenceLinkedSummary(provider, {
        threadId: detail.thread.id,
        subject: detail.thread.displaySubject,
        messages: detail.messages,
      });
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
      console.log(JSON.stringify({ event: "summary_generated", threadId: detail.thread.id, model: MODEL }));
    } catch (error) {
      failed += 1;
      console.error(JSON.stringify({
        event: "summary_failed",
        threadId: candidate.threadId,
        error: error instanceof Error ? error.message : String(error),
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
    return Response.json({ service: "lkmlens-summarizer", status: "ok" });
  },
} satisfies ExportedHandler<Env>;
