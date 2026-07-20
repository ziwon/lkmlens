import { afterEach, describe, expect, it, vi } from "vitest";
import { createGeminiProvider } from "./gemini.js";

afterEach(() => vi.unstubAllGlobals());

describe("Gemini summary provider", () => {
  it("requests structured JSON and returns token usage", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { generationConfig: Record<string, unknown> };
      expect(body.generationConfig.responseMimeType).toBe("application/json");
      expect(body.generationConfig.responseJsonSchema).toBeDefined();
      return Response.json({
        candidates: [{ content: { parts: [{ text: "{\"overview\":\"ok\"}" }] } }],
        usageMetadata: { promptTokenCount: 12, candidatesTokenCount: 3 },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await createGeminiProvider("secret", "gemini-3.1-flash-lite").generateJson("prompt");
    expect(result).toEqual({ data: { overview: "ok" }, inputTokens: 12, outputTokens: 3 });
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({ "x-goog-api-key": "secret" });
  });

  it("marks HTTP 429 as provider quota exhaustion", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("quota", { status: 429 })));
    const promise = createGeminiProvider("secret", "gemini-3.1-flash-lite").generateJson("prompt");
    await expect(promise).rejects.toMatchObject({ quotaExhausted: true, status: 429 });
  });
});
