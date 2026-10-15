"use client";

import { chakra, Grid, Text } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { quizLength } from "@/lib/quiz";
import { useStudent } from "@/lib/student";
import { lv } from "@/lib/theme";
import type { Curriculum, Topic } from "@/lib/types";
import NameBar from "./NameBar";
import QuizRunner from "./QuizRunner";
import { CardButton, Chip, Crumbs, H2, H3, Muted, Row, Sep, Stack, TextButton } from "./ui/kit";

type View = "age" | "levels" | "topics" | "quiz";

/** Big number at the top of an age or level card. */
function BigLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <chakra.span fontFamily="heading" fontWeight="800" fontSize="30px" lineHeight="1" color={color}>
      {children}
    </chakra.span>
  );
}

export default function QuizApp({ curriculum }: { curriculum: Curriculum }) {
  const { ageGroups, levels } = curriculum;
  const topics = curriculum.topics.filter((t) => !t.category);
  const student = useStudent();
  const [view, setView] = useState<View>("age");
  const [levelId, setLevelId] = useState<string | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);
  const [runKey, setRunKey] = useState(0);
  const [nameMissing, setNameMissing] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const age = ageGroups.find((a) => a.id === student.ageId);
  const level = levels.find((l) => l.id === levelId);
  const topic = topics.find((t) => t.id === topicId);

  const agesLabel = (t: Topic) =>
    (t.ages ?? []).map((id) => ageGroups.find((a) => a.id === id)?.label).filter(Boolean).join(", ");

  function start(t: Topic) {
    if (!student.name.trim()) {
      setNameMissing(true);
      nameRef.current?.focus();
      return;
    }
    setTopicId(t.id);
    setRunKey((k) => k + 1);
    setView("quiz");
  }

  const nameBar = (
    <NameBar
      ref={nameRef}
      name={student.name}
      missing={nameMissing}
      onName={(v) => {
        student.setName(v);
        setNameMissing(false);
      }}
    />
  );

  const crumbs = age && (
    <Crumbs>
      <TextButton onClick={() => setView("age")}>Yaş</TextButton>
      <Sep />
      {view === "levels" || !level ? (
        <span>{age.label} yaş</span>
      ) : (
        <>
          <TextButton onClick={() => setView("levels")}>{age.label} yaş</TextButton>
          <Sep />
          {view === "topics" || !topic ? (
            <span>{level.code}</span>
          ) : (
            <>
              <TextButton onClick={() => setView("topics")}>{level.code}</TextButton>
              <Sep />
              <span>{topic.title}</span>
            </>
          )}
        </>
      )}
    </Crumbs>
  );

  if (view === "age" || !age) {
    return (
      <Stack>
        {nameBar}
        <div>
          <H2>Neçə yaşın var?</H2>
          <Muted as="p">Yaş yalnız sənə uyğun mövzuları önə çıxarmaq üçündür. Səviyyəni növbəti addımda özün seçəcəksən.</Muted>
        </div>
        <Grid templateColumns="repeat(auto-fill, minmax(150px, 1fr))" gap="12px">
          {ageGroups.map((a) => (
            <CardButton
              key={a.id}
              rounded="16px"
              p="16px"
              gap="6px"
              aria-pressed={a.id === student.ageId}
              _pressed={{ borderColor: "accent" }}
              onClick={() => {
                student.setAge(a.id);
                setView("levels");
              }}
            >
              <BigLabel color="accent">
                {a.label}{" "}
                <chakra.small fontSize="14px" fontWeight="600">
                  yaş
                </chakra.small>
              </BigLabel>
              <Muted small>{a.title}</Muted>
            </CardButton>
          ))}
        </Grid>
      </Stack>
    );
  }

  if (view === "levels" || !level) {
    return (
      <Stack>
        {crumbs}
        <div>
          <H2>Səviyyəni seç</H2>
          <Muted as="p">
            İstənilən səviyyəni seçə bilərsən. İşarələnmiş səviyyələr {age.label} yaş üçün ən çox rast gəlinənlərdir.
          </Muted>
        </div>
        <Grid templateColumns="repeat(auto-fill, minmax(240px, 1fr))" gap="12px">
          {levels.map((l) => {
            const count = topics.filter((t) => t.level === l.id).length;
            return (
              <CardButton
                key={l.id}
                style={lv(l.id)}
                rounded="16px"
                p="16px"
                gap="8px"
                _hover={{ borderColor: "var(--gc)" }}
                onClick={() => {
                  setLevelId(l.id);
                  setView("topics");
                }}
              >
                <BigLabel color="var(--gc)">{l.code}</BigLabel>
                <H3>{l.name}</H3>
                <Row gap="6px">
                  {age.typical.includes(l.id) && <Chip variant="level">Bu yaş üçün tipik</Chip>}
                  <Chip>{l.exam}</Chip>
                </Row>
                <Muted small>
                  {l.desc} · {count} mövzu
                </Muted>
              </CardButton>
            );
          })}
        </Grid>
      </Stack>
    );
  }

  if (view === "topics" || !topic) {
    const list = topics
      .filter((t) => t.level === level.id)
      .map((t) => ({ t, fits: !t.ages || t.ages.includes(age.id) }))
      .sort((a, b) => Number(b.fits) - Number(a.fits));
    return (
      <Stack>
        {crumbs}
        {nameBar}
        <Row gap="6px" style={lv(level.id)}>
          <Chip variant="level">
            {level.code} · {level.name}
          </Chip>
          <Chip>{level.exam}</Chip>
        </Row>
        <H2>Mövzunu seç</H2>
        <Grid gap="10px">
          {list.map(({ t, fits }) => {
            const b = student.best[t.id];
            return (
              <CardButton
                key={t.id}
                display="flex"
                alignItems="center"
                gap="14px"
                _hover={{ transform: "none", borderColor: "accent" }}
                onClick={() => start(t)}
              >
                <Grid flex="1" minW="0" gap="2px">
                  <H3>{t.title}</H3>
                  <Muted small>
                    {t.az} · {t.skills.length} bacarıq, hər testdə {quizLength(t)} sual
                  </Muted>
                  {!fits && <Muted small>Əsasən {agesLabel(t)} yaş üçün hazırlanıb</Muted>}
                  {b !== undefined && <Muted small>Ən yaxşı nəticən: {b}%</Muted>}
                </Grid>
                <Text as="span" fontWeight="600" color="accent" whiteSpace="nowrap">
                  Başla →
                </Text>
              </CardButton>
            );
          })}
        </Grid>
      </Stack>
    );
  }

  return (
    <Stack>
      {crumbs}
      <QuizRunner
        key={runKey}
        topic={topic}
        level={level}
        age={age}
        name={student.name}
        onFinish={(pct) => student.recordScore(topic.id, pct)}
        onExit={() => setView("topics")}
        exitLabel="Başqa mövzu seç"
      />
    </Stack>
  );
}
