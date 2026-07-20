import { describe, expect, it } from "vitest";
import { parseQuery, toFtsMatchQuery } from "./query.js";

describe("parseQuery", () => {
  it("parses free-text terms", () => {
    const q = parseQuery("sched_ext latency");
    expect(q.terms).toEqual(["sched_ext", "latency"]);
  });

  it("parses quoted phrases", () => {
    const q = parseQuery('"memory folio"');
    expect(q.phrases).toEqual(["memory folio"]);
    expect(q.terms).toEqual([]);
  });

  it("parses topic: and free text together", () => {
    const q = parseQuery("topic:ebpf verifier");
    expect(q.topic).toBe("ebpf");
    expect(q.terms).toEqual(["verifier"]);
  });

  it("parses list:", () => {
    const q = parseQuery("list:linux-mm NUMA");
    expect(q.mailingList).toBe("linux-mm");
    expect(q.terms).toEqual(["NUMA"]);
  });

  it("parses author:", () => {
    const q = parseQuery("author:torvalds");
    expect(q.author).toBe("torvalds");
  });

  it("parses type: against known thread types only", () => {
    const q = parseQuery("type:patch CXL");
    expect(q.type).toBe("patch");
    expect(q.terms).toEqual(["CXL"]);

    const bogus = parseQuery("type:not-a-type CXL");
    expect(bogus.type).toBeUndefined();
    expect(bogus.terms).toEqual(["type:not-a-type", "CXL"]);
  });

  it("parses version: with or without the leading v", () => {
    expect(parseQuery("version:v4 io_uring").version).toBe(4);
    expect(parseQuery("version:4 io_uring").version).toBe(4);
  });

  it("parses after: and before: dates", () => {
    const q = parseQuery("after:2026-07-01 RDMA");
    expect(q.after).toBe("2026-07-01");
    expect(q.terms).toEqual(["RDMA"]);

    const q2 = parseQuery("before:2026-08-01 topic:gpu");
    expect(q2.before).toBe("2026-08-01");
    expect(q2.topic).toBe("gpu");
  });

  it("falls back invalid filter values to free text", () => {
    const q = parseQuery("after:not-a-date RDMA");
    expect(q.after).toBeUndefined();
    expect(q.terms).toEqual(["after:not-a-date", "RDMA"]);
  });
});

describe("toFtsMatchQuery", () => {
  it("returns null when there is nothing to search on", () => {
    expect(toFtsMatchQuery(parseQuery("topic:ebpf"))).toBeNull();
  });

  it("ANDs quoted terms together and escapes embedded quotes", () => {
    const q = parseQuery('sched_ext "memory folio"');
    expect(toFtsMatchQuery(q)).toBe('"memory folio" AND "sched_ext"');
  });
});
