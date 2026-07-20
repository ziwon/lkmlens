import type { DigestContent, DigestThreadItem } from "@lkmlens/shared";

export interface DigestCandidate extends DigestThreadItem {
  topicSlugs: string[];
}

export function composeDigest(candidates: DigestCandidate[], maxThreads = 12): DigestContent {
  const topicCounts = new Map<string, { name: string; count: number }>();
  for (const candidate of candidates) {
    candidate.topicSlugs.forEach((slug, index) => {
      const current = topicCounts.get(slug) ?? { name: candidate.topicNames[index] ?? slug, count: 0 };
      current.count += 1;
      topicCounts.set(slug, current);
    });
  }
  return {
    mostActiveTopics: Array.from(topicCounts, ([slug, value]) => ({
      slug,
      name: value.name,
      threadCount: value.count,
    })).sort((a, b) => b.threadCount - a.threadCount || a.name.localeCompare(b.name)).slice(0, 8),
    threads: [...candidates]
      .sort((a, b) => b.messageCount - a.messageCount
        || (b.lastActivityAt ?? "").localeCompare(a.lastActivityAt ?? ""))
      .slice(0, maxThreads)
      .map(({ topicSlugs: _topicSlugs, ...thread }) => thread),
  };
}
