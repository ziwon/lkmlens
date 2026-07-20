import type { ProviderGeneration, SummaryProvider } from "@lkmlens/ai";

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
  };
}

const SUMMARY_SCHEMA = {
  type: "object",
  required: [
    "overview", "whyItMatters", "majorChanges", "reviewDiscussion",
    "outstandingQuestions", "explicitSignals", "uncertainties", "evidence",
  ],
  properties: {
    overview: { type: "string" },
    whyItMatters: { type: "string" },
    majorChanges: { type: "array", items: { type: "string" } },
    reviewDiscussion: { type: "array", items: { type: "string" } },
    outstandingQuestions: { type: "array", items: { type: "string" } },
    uncertainties: { type: "array", items: { type: "string" } },
    explicitSignals: {
      type: "array",
      items: {
        type: "object",
        required: ["type", "person", "messageId", "sourceUrl"],
        properties: {
          type: { type: "string" },
          person: { type: "string" },
          messageId: { type: "string" },
          sourceUrl: { type: "string" },
        },
      },
    },
    evidence: {
      type: "array",
      items: {
        type: "object",
        required: ["claimId", "messageId", "sourceUrl"],
        properties: {
          claimId: { type: "string" },
          messageId: { type: "string" },
          sourceUrl: { type: "string" },
        },
      },
    },
  },
} as const;

export class GeminiApiError extends Error {
  constructor(message: string, readonly status: number, readonly quotaExhausted: boolean) {
    super(message);
    this.name = "GeminiApiError";
  }
}

export function createGeminiProvider(apiKey: string, model: string): SummaryProvider {
  return {
    model,
    async generateJson(prompt): Promise<ProviderGeneration> {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 2_048,
              responseMimeType: "application/json",
              responseJsonSchema: SUMMARY_SCHEMA,
            },
          }),
          signal: AbortSignal.timeout(45_000),
        },
      );

      if (!response.ok) {
        const errorBody = (await response.text()).slice(0, 1_000);
        throw new GeminiApiError(
          `Gemini API ${response.status}: ${errorBody}`,
          response.status,
          response.status === 429,
        );
      }

      const result = await response.json<GeminiResponse>();
      const text = result.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("");
      if (!text) throw new GeminiApiError("Gemini API returned no text candidate", 502, false);
      return {
        data: JSON.parse(text) as unknown,
        inputTokens: result.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: result.usageMetadata?.candidatesTokenCount ?? 0,
      };
    },
  };
}
