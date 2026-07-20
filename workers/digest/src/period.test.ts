import { describe, expect, it } from "vitest";
import { dailyWindow, weeklyWindow } from "./period.js";

describe("digest periods", () => {
  it("publishes the completed UTC day", () => {
    expect(dailyWindow(new Date("2026-07-20T01:07:00Z")).periodKey).toBe("2026-07-19");
  });

  it("publishes the previous ISO week only on Monday", () => {
    expect(weeklyWindow(new Date("2026-07-20T01:07:00Z"))?.periodKey).toBe("2026-W29");
    expect(weeklyWindow(new Date("2026-07-21T01:07:00Z"))).toBeNull();
  });
});
