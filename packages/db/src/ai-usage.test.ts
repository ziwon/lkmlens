import { describe, expect, it } from "vitest";
import { computeAiQuotaState } from "./ai-usage.js";

describe("AI quota state", () => {
  it("warns at the configured threshold", () => {
    expect(computeAiQuotaState(79, 100, 80, false).state).toBe("normal");
    expect(computeAiQuotaState(80, 100, 80, false).state).toBe("warning");
  });

  it("is exhausted at the local limit or after a provider 429", () => {
    expect(computeAiQuotaState(100, 100, 80, false).state).toBe("exhausted");
    expect(computeAiQuotaState(2, 100, 80, true).state).toBe("exhausted");
  });
});
