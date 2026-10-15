import data from "@/data/questions.json";
import listening from "@/data/listening.json";
import type { Curriculum, Story, Topic } from "./types";

export const CURRICULUM = data as Curriculum;
export const STORIES = (listening as { stories: Story[] }).stories;

/** Quiz topics plus listening texts: everything a result can refer to. */
export const ALL_TOPICS: Topic[] = [...CURRICULUM.topics, ...STORIES];

export function findTopic(id: string) {
  return ALL_TOPICS.find((t) => t.id === id);
}

export function findAge(id: string) {
  return CURRICULUM.ageGroups.find((a) => a.id === id);
}

export function suitsAge(topic: Topic, ageId: string) {
  return !topic.ages || topic.ages.includes(ageId);
}
