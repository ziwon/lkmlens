import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { listCommitShas, readMessageAtCommit } from "./mirror.js";

/**
 * Builds a tiny real git repo (not a clone of lore.kernel.org) shaped like
 * a public-inbox v2 epoch: each commit's tree has a single "m" blob with
 * raw RFC822 content. Exercises the actual `git` binary rather than mocking
 * it, without any network access.
 */
function makeFixtureRepo(dir: string, messages: string[]): string[] {
  const env = {
    ...process.env,
    GIT_AUTHOR_NAME: "test",
    GIT_AUTHOR_EMAIL: "test@example.com",
    GIT_COMMITTER_NAME: "test",
    GIT_COMMITTER_EMAIL: "test@example.com",
  };
  const run = (args: string[]) => execFileSync("git", args, { cwd: dir, env, encoding: "utf8" });

  run(["init", "--initial-branch=master"]);
  const shas: string[] = [];
  messages.forEach((content, i) => {
    writeFileSync(join(dir, "m"), content);
    run(["add", "m"]);
    run(["commit", "-m", `message ${i}`]);
    shas.push(run(["rev-parse", "HEAD"]).trim());
  });
  return shas;
}

describe("mirror (git plumbing)", () => {
  let dir: string;
  let shas: string[];

  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), "lkmlens-mirror-test-"));
    shas = makeFixtureRepo(dir, ["Message-Id: <one@x>\n\nfirst", "Message-Id: <two@x>\n\nsecond"]);
  });

  afterAll(() => {
    execFileSync("rm", ["-rf", dir]);
  });

  it("lists commits oldest-first", () => {
    const listed = listCommitShas(dir);
    expect(listed).toEqual(shas);
  });

  it("reads the raw message blob at a commit", () => {
    expect(shas).toHaveLength(2);
    expect(readMessageAtCommit(dir, shas[0]!)).toBe("Message-Id: <one@x>\n\nfirst");
    expect(readMessageAtCommit(dir, shas[1]!)).toBe("Message-Id: <two@x>\n\nsecond");
  });

  it("returns only commits after sinceSha for incremental sync", () => {
    const incremental = listCommitShas(dir, { sinceSha: shas[0] });
    expect(incremental).toEqual([shas[1]]);
  });

  it("returns nothing when sinceSha is already HEAD", () => {
    const incremental = listCommitShas(dir, { sinceSha: shas[1] });
    expect(incremental).toEqual([]);
  });

  it("bounds an initial pull with maxCount", () => {
    const bounded = listCommitShas(dir, { maxCount: 1 });
    expect(bounded).toEqual([shas[1]]); // most recent 1, oldest-first display is trivially itself
  });
});
