import type { Topic } from "./types";

/** Questions per attempt; each topic's pool is larger, so retakes differ. */
export const QUIZ_SIZE = 10;

function shuffle<T>(list: T[]): T[] {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Picks up to QUIZ_SIZE question indices, taking them round-robin from each
 * skill so every skill of the topic is tested, then shuffles the order.
 */
export function quizLength(topic: Topic) {
  return Math.min(topic.quizSize ?? QUIZ_SIZE, topic.questions.length);
}

export function pickQuestions(topic: Topic, size = quizLength(topic)): number[] {
  const pools = shuffle(topic.skills).map((s) =>
    shuffle(topic.questions.map((q, i) => (q.skill === s.id ? i : -1)).filter((i) => i >= 0)),
  );
  const picked: number[] = [];
  const limit = Math.min(size, topic.questions.length);
  while (picked.length < limit && pools.some((p) => p.length)) {
    for (const pool of pools) {
      const next = pool.pop();
      if (next !== undefined && picked.length < limit) picked.push(next);
    }
  }
  return shuffle(picked);
}

export { shuffle };

export type SkillScore = { id: string; label: string; right: number; total: number };

/** Per-skill right/total for one attempt, in the topic's skill order. */
export function skillScores(topic: Topic, asked: number[], wrong: number[]): SkillScore[] {
  const wrongSet = new Set(wrong);
  return topic.skills
    .map((s) => {
      const qs = asked.filter((i) => topic.questions[i]?.skill === s.id);
      return { id: s.id, label: s.label, total: qs.length, right: qs.filter((i) => !wrongSet.has(i)).length };
    })
    .filter((s) => s.total > 0);
}
