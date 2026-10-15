// Validates data/questions.json and data/listening.json. Runs before every build.
import { readFileSync } from "node:fs";

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), "utf8"));
const q = read("data/questions.json");
const listening = read("data/listening.json");
const errors = [];

const levelIds = new Set(q.levels.map((l) => l.id));
const ageIds = new Set(q.ageGroups.map((a) => a.id));
const categoryIds = new Set(q.categories.map((c) => c.id));
const topicIds = new Set();

const stories = listening.stories.map((s) => ({ ...s, isStory: true }));
for (const t of [...q.topics, ...stories]) {
  const at = t.isStory ? `listening mətni "${t.id}"` : `mövzu "${t.id}"`;
  if (topicIds.has(t.id)) errors.push(`${at}: id təkrarlanır`);
  topicIds.add(t.id);
  if (!levelIds.has(t.level)) errors.push(`${at}: naməlum səviyyə "${t.level}"`);
  if (t.category && !categoryIds.has(t.category)) errors.push(`${at}: naməlum kateqoriya "${t.category}"`);
  for (const a of t.ages ?? []) if (!ageIds.has(a)) errors.push(`${at}: naməlum yaş "${a}"`);
  const skills = new Set((t.skills ?? []).map((s) => s.id));
  if (!skills.size) errors.push(`${at}: bacarıq (skills) yoxdur`);
  t.questions.forEach((x, i) => {
    const w = `${at}, sual ${i + 1}`;
    if (!skills.has(x.skill)) errors.push(`${w}: naməlum bacarıq "${x.skill}"`);
    if (!Array.isArray(x.options) || x.options.length !== 4) errors.push(`${w}: 4 variant olmalıdır`);
    else if (new Set(x.options).size !== 4) errors.push(`${w}: eyni variant iki dəfə yazılıb`);
    if (!Number.isInteger(x.answer) || x.answer < 0 || x.answer > 3) errors.push(`${w}: answer 0–3 olmalıdır`);
  });
}

/** Allowed listening-text length (words) per level. */
const WORDS = { early: [40, 70], "pre-a1": [70, 100], a1: [100, 140], a2: [150, 200], b1: [200, 260], b2: [250, 320], c1: [300, 380] };
const topicLevel = new Map(q.topics.map((t) => [t.id, t.level]));
for (const s of stories) {
  const at = `listening mətni "${s.id}"`;
  if (!Array.isArray(s.paragraphs) || !s.paragraphs.length) errors.push(`${at}: mətn (paragraphs) yoxdur`);
  else {
    const words = s.paragraphs.join(" ").split(/\s+/).filter(Boolean).length;
    const [min, max] = WORDS[s.level] ?? [0, Infinity];
    if (words < min || words > max) errors.push(`${at}: ${words} söz, ${s.level} üçün ${min}–${max} olmalıdır`);
  }
  const need = s.level === "early" || s.level === "pre-a1" ? 4 : 5;
  if (s.questions.length !== need) errors.push(`${at}: ${need} sual olmalıdır, ${s.questions.length} var`);
  if (!s.covers?.length) errors.push(`${at}: covers boşdur`);
  if (s.level === "early")
    s.questions.forEach((x, i) => {
      if (!x.say || !x.pictureOptions) errors.push(`${at}, sual ${i + 1}: kiçiklər üçün say və pictureOptions lazımdır`);
    });
  for (const c of s.covers ?? []) {
    if (!topicLevel.has(c)) errors.push(`${at}: covers-da naməlum mövzu "${c}"`);
    else if (topicLevel.get(c) !== s.level) errors.push(`${at}: "${c}" mövzusu başqa səviyyədədir`);
  }
}

if (errors.length) {
  console.error(`Məlumatda ${errors.length} xəta var:\n- ` + errors.join("\n- "));
  process.exit(1);
}
const qs = q.topics.reduce((n, t) => n + t.questions.length, 0);
console.log(`Məlumat düzgündür: ${q.topics.length} mövzu, ${qs} sual, ${stories.length} listening mətni.`);
