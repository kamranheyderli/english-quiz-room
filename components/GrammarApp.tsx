"use client";

import { Box, Grid, Text } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { quizLength } from "@/lib/quiz";
import { PASS_PCT, useStudent } from "@/lib/student";
import { lv } from "@/lib/theme";
import type { Category, Curriculum, Topic } from "@/lib/types";
import NameBar from "./NameBar";
import QuizRunner from "./QuizRunner";
import { Bar, Btn, Callout, Card, CardButton, Chip, Crumbs, H2, H3, Label, Muted, Pill, Row, Sep, Stack, TextButton } from "./ui/kit";

type View = "home" | "category" | "quiz";

export default function GrammarApp({ curriculum }: { curriculum: Curriculum }) {
  const { ageGroups, levels, categories } = curriculum;
  const student = useStudent();
  const [view, setView] = useState<View>("home");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);
  const [runKey, setRunKey] = useState(0);
  const [missing, setMissing] = useState({ name: false, age: false });
  const nameRef = useRef<HTMLInputElement>(null);

  const levelIndex = (t: Topic) => levels.findIndex((l) => l.id === t.level);
  const lessonsOf = (c: Category) =>
    curriculum.topics.filter((t) => t.category === c.id).sort((a, b) => levelIndex(a) - levelIndex(b));
  const allLessons = categories.flatMap((c) => lessonsOf(c));
  const passed = (t: Topic) => (student.best[t.id] ?? -1) >= PASS_PCT;
  const levelOf = (t: Topic) => levels.find((l) => l.id === t.level)!;
  const categoryOf = (t: Topic) => categories.find((c) => c.id === t.category)!;

  const age = ageGroups.find((a) => a.id === student.ageId);
  const category = categories.find((c) => c.id === categoryId);
  const topic = allLessons.find((t) => t.id === topicId);

  function openCategory(id: string) {
    setCategoryId(id);
    setView("category");
  }

  function start(t: Topic) {
    const need = { name: !student.name.trim(), age: !age };
    if (need.name || need.age) {
      setMissing(need);
      if (need.name) nameRef.current?.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setCategoryId(t.category!);
    setTopicId(t.id);
    setRunKey((k) => k + 1);
    setView("quiz");
  }

  const nameBar = (
    <NameBar
      ref={nameRef}
      name={student.name}
      missing={missing.name}
      onName={(v) => {
        student.setName(v);
        setMissing((m) => ({ ...m, name: false }));
      }}
      ages={{
        list: ageGroups,
        value: student.ageId,
        missing: missing.age,
        onChange: (id) => {
          student.setAge(id);
          setMissing((m) => ({ ...m, age: false }));
        },
      }}
    />
  );

  const crumbs = (
    <Crumbs>
      {view === "home" ? (
        <span>Qrammatika</span>
      ) : (
        <>
          <TextButton onClick={() => setView("home")}>Qrammatika</TextButton>
          <Sep />
          {view === "category" || !topic ? (
            <span>{category?.title}</span>
          ) : (
            <>
              <TextButton onClick={() => setView("category")}>{category?.title}</TextButton>
              <Sep />
              <span>{levelOf(topic).code}</span>
            </>
          )}
        </>
      )}
    </Crumbs>
  );

  if (view === "quiz" && topic && age) {
    const lessons = lessonsOf(categoryOf(topic));
    const pos = lessons.findIndex((t) => t.id === topic.id);
    const nextInCategory = lessons[pos + 1];
    const nextCategory = categories[categories.findIndex((c) => c.id === topic.category) + 1];
    const nextLesson = nextInCategory ?? (nextCategory ? lessonsOf(nextCategory)[0] : undefined);
    return (
      <Stack>
        {crumbs}
        <div>
          <Label>
            <span lang="en">{categoryOf(topic).title}</span> · {pos + 1}-ci dərs
          </Label>
          <H2>{topic.title}</H2>
        </div>
        <QuizRunner
          key={runKey}
          topic={topic}
          level={levelOf(topic)}
          age={age}
          name={student.name}
          onFinish={(pct) => student.recordScore(topic.id, pct)}
          onExit={() => setView("category")}
          exitLabel={`${categoryOf(topic).title} dərslərinə qayıt`}
          next={
            nextLesson && {
              label: nextInCategory ? "Növbəti dərs →" : `Növbəti bölmə: ${nextCategory!.title} →`,
              onClick: () => start(nextLesson),
            }
          }
        />
      </Stack>
    );
  }

  if (view === "category" && category) {
    const lessons = lessonsOf(category);
    const done = lessons.filter(passed).length;
    return (
      <Stack>
        {crumbs}
        {nameBar}
        <div>
          <Label>
            {category.az} · {done}/{lessons.length} dərs tamamlanıb
          </Label>
          <H2>{category.title}</H2>
          <Muted as="p">Dərsləri sıra ilə keç. Testdən {PASS_PCT}% və yuxarı alanda dərs tamamlanmış sayılır.</Muted>
        </div>
        <Box as="ol" listStyle="none" m="0" p="0" display="grid">
          {lessons.map((t, i) => {
            const level = levelOf(t);
            const b = student.best[t.id];
            const state = passed(t) ? "done" : b !== undefined ? "tried" : "new";
            const last = i === lessons.length - 1;
            return (
              <Grid as="li" key={t.id} style={lv(level.id)} position="relative" templateColumns="36px minmax(0, 1fr)" gap="14px" pb="18px">
                {!last && (
                  <Box position="absolute" left="17px" top="38px" bottom="0" w="2px" bg={state === "done" ? "good" : "line"} aria-hidden="true" />
                )}
                <Box
                  aria-hidden="true"
                  w="36px"
                  h="36px"
                  rounded="full"
                  display="grid"
                  placeItems="center"
                  fontFamily="heading"
                  fontWeight="800"
                  borderWidth="2px"
                  bg={state === "done" ? "good" : "surface"}
                  borderColor={state === "done" ? "good" : state === "tried" ? "accent" : "line"}
                  color={state === "done" ? "white" : state === "tried" ? "accent" : "ink.muted"}
                >
                  {state === "done" ? "✓" : i + 1}
                </Box>
                <Card px="16px" py="14px" display="grid" gap="8px" minW="0">
                  <Row gap="8px">
                    <Chip variant="level">{level.code}</Chip>
                    <H3>{t.title}</H3>
                  </Row>
                  <Muted as="p" small>
                    {t.az} · hər testdə {quizLength(t)} sual
                  </Muted>
                  <Row gap="6px">
                    <Muted small>Bu dərsdə:</Muted>
                    {t.skills.map((s) => (
                      <Chip key={s.id}>{s.label}</Chip>
                    ))}
                  </Row>
                  <Row>
                    <Btn ghost={state === "done"} onClick={() => start(t)}>
                      {state === "new" ? "Başla" : "Təkrar et"}
                    </Btn>
                    {state === "done" && <Pill tone="good">Tamamlandı · {b}%</Pill>}
                    {state === "tried" && (
                      <Pill tone="accent" fontWeight="500">
                        Ən yaxşı nəticən {b}%, tamamlamaq üçün {PASS_PCT}% lazımdır
                      </Pill>
                    )}
                  </Row>
                </Card>
              </Grid>
            );
          })}
        </Box>
      </Stack>
    );
  }

  const nextUp = allLessons.find((t) => !passed(t));
  const doneTotal = allLessons.filter(passed).length;
  return (
    <Stack>
      {nameBar}
      <div>
        <Label>
          {doneTotal}/{allLessons.length} dərs tamamlanıb
        </Label>
        <H2>Qrammatika</H2>
        <Muted as="p">
          Nitq hissələri üzrə dərslər. Hər bölmədə dərslər asandan çətinə doğru düzülüb: əvvəl A1, sonra A2 və B1.
        </Muted>
      </div>

      {nextUp && (
        <Callout>
          <Grid minW="0" gap="2px">
            <Label>{doneTotal ? "Davam et" : "Buradan başla"}</Label>
            <H3>
              {categoryOf(nextUp).title} · {nextUp.title}
            </H3>
            <Muted small>{nextUp.az}</Muted>
          </Grid>
          <Btn onClick={() => start(nextUp)}>{student.best[nextUp.id] !== undefined ? "Təkrar et" : "Başla"} →</Btn>
        </Callout>
      )}

      <Grid templateColumns="repeat(auto-fill, minmax(170px, 1fr))" gap="10px">
        {categories.map((c) => {
          const lessons = lessonsOf(c);
          const done = lessons.filter(passed).length;
          return (
            <CardButton key={c.id} p="14px" gap="4px" onClick={() => openCategory(c.id)} disabled={!lessons.length}>
              <H3>{c.title}</H3>
              <Muted small>{c.az}</Muted>
              <Bar
                h="6px"
                mt="6px"
                color="good"
                value={lessons.length ? (done / lessons.length) * 100 : 0}
                aria-label={`${done}/${lessons.length} dərs tamamlanıb`}
              />
              <Text as="span" fontSize="13px" color="accent" fontWeight="600">
                {done}/{lessons.length} dərs · {lessons.map((t) => levelOf(t).code).join(" → ")}
              </Text>
            </CardButton>
          );
        })}
      </Grid>
    </Stack>
  );
}
