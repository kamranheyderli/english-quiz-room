export type Question = {
  /** Id of the topic skill this question checks. */
  skill: string;
  picture?: string;
  /** English text read aloud to the student (for pre-readers). */
  say?: string;
  /** Options are pictures (emoji) shown as big tiles instead of text. */
  pictureOptions?: boolean;
  question: string;
  options: string[];
  answer: number;
  explain?: string;
};

export type AgeGroup = {
  id: string;
  label: string;
  title: string;
  /** Levels most common for this age; any level can still be chosen. */
  typical: string[];
};

export type Level = {
  id: string;
  code: string;
  name: string;
  exam: string;
  desc: string;
};

export type Skill = {
  id: string;
  label: string;
};

export type Category = {
  id: string;
  title: string;
  az: string;
};

export type Topic = {
  id: string;
  level: string;
  /** Part-of-speech category for Grammar-section topics; level topics have none. */
  category?: string;
  /** Questions per attempt for this topic; defaults to QUIZ_SIZE. */
  quizSize?: number;
  /** Sub-skills the topic is split into; every question belongs to one. */
  skills: Skill[];
  /** Age groups this topic's content suits; omitted means every age. */
  ages?: string[];
  title: string;
  az: string;
  questions: Question[];
};

/** A listening text: read aloud with word highlighting, then answered like a quiz topic. */
export type Story = Topic & {
  /** Ids of the level topics this text revises. */
  covers: string[];
  paragraphs: string[];
};

export type Curriculum = {
  ageGroups: AgeGroup[];
  levels: Level[];
  categories: Category[];
  topics: Topic[];
};

export type Attempt = {
  id: string;
  name: string;
  age: string;
  topic: string;
  score: number;
  total: number;
  /** Indices (into topic.questions) of the questions this attempt asked. */
  asked: number[];
  /** Indices of the questions answered wrongly; a subset of `asked`. */
  wrong: number[];
  at: string;
  sample?: boolean;
};
