"use client";

import { Grid } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { suitsAge } from "@/lib/curriculum";
import { stop as stopSpeech } from "@/lib/speech";
import { PASS_PCT, useStudent } from "@/lib/student";
import { lv } from "@/lib/theme";
import type { Curriculum, Story } from "@/lib/types";
import NameBar from "./NameBar";
import QuizRunner from "./QuizRunner";
import StoryReader from "./StoryReader";
import { Btn, Callout, CardButton, Chip, Crumbs, Empty, H2, H3, Label, Muted, Pill, Row, Seg, SegButton, Sep, Stack, TextButton } from "./ui/kit";

type View = "home" | "story" | "quiz";

const wordCount = (s: Story) => s.paragraphs.join(" ").split(/\s+/).filter(Boolean).length;
/** Rough listening time at the normal reading speed (~105 words a minute). */
const minutes = (s: Story) => Math.max(1, Math.round(wordCount(s) / 105));

export default function ListeningApp({ curriculum, stories }: { curriculum: Curriculum; stories: Story[] }) {
  const { ageGroups, levels, topics } = curriculum;
  const student = useStudent();
  const [view, setView] = useState<View>("home");
  const [storyId, setStoryId] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState("all");
  const [runKey, setRunKey] = useState(0);
  const [missing, setMissing] = useState({ name: false, age: false });
  const [heard, setHeard] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const age = ageGroups.find((a) => a.id === student.ageId);
  const ordered = levels.flatMap((l) => stories.filter((s) => s.level === l.id));
  const story = ordered.find((s) => s.id === storyId);
  const levelOf = (s: Story) => levels.find((l) => l.id === s.level)!;
  const topicTitle = (id: string) => topics.find((t) => t.id === id)?.title ?? id;
  const agesLabel = (s: Story) =>
    (s.ages ?? []).map((id) => ageGroups.find((a) => a.id === id)?.label).filter(Boolean).join(", ");

  function open(s: Story) {
    setStoryId(s.id);
    setHeard(false);
    setView("story");
    window.scrollTo({ top: 0 });
  }

  function startQuestions() {
    const need = { name: !student.name.trim(), age: !age };
    if (need.name || need.age) {
      setMissing(need);
      if (need.name) nameRef.current?.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    stopSpeech();
    setRunKey((k) => k + 1);
    setView("quiz");
    window.scrollTo({ top: 0 });
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

  const crumbs = story && (
    <Crumbs>
      <TextButton onClick={() => setView("home")}>Listening</TextButton>
      <Sep />
      {view === "quiz" ? (
        <>
          <TextButton onClick={() => setView("story")}>{story.title}</TextButton>
          <Sep />
          <span>Suallar</span>
        </>
      ) : (
        <span>{story.title}</span>
      )}
    </Crumbs>
  );

  if (view === "quiz" && story && age) {
    const next = ordered[ordered.findIndex((s) => s.id === story.id) + 1];
    return (
      <Stack>
        {crumbs}
        <div>
          <Label>
            {levelOf(story).code} · <span lang="en">Listening</span> · suallar
          </Label>
          <H2>{story.title}</H2>
        </div>
        <QuizRunner
          key={runKey}
          topic={story}
          level={levelOf(story)}
          age={age}
          name={student.name}
          onFinish={(pct) => student.recordScore(story.id, pct)}
          onExit={() => setView("story")}
          exitLabel="Mətni yenidən dinlə"
          next={next && { label: `Növbəti mətn: ${next.title} →`, onClick: () => open(next) }}
        />
      </Stack>
    );
  }

  if (view === "story" && story) {
    const level = levelOf(story);
    return (
      <Stack>
        {crumbs}
        {nameBar}
        <Stack gap="6px" style={lv(level.id)}>
          <Row gap="8px">
            <Chip variant="level">{level.code}</Chip>
            <Muted small>
              {story.az} · {wordCount(story)} söz · ~{minutes(story)} dəq
            </Muted>
          </Row>
          <H2>{story.title}</H2>
          <Row gap="6px">
            <Muted small>Təkrarlanan mövzular:</Muted>
            {story.covers.map((c) => (
              <Chip key={c}>{topicTitle(c)}</Chip>
            ))}
          </Row>
        </Stack>
        <StoryReader key={story.id} paragraphs={story.paragraphs} onFinished={() => setHeard(true)} />
        <Callout>
          <Grid minW="0" gap="2px">
            <Label>{heard ? "Dinləmə bitdi" : "Dinlədikdən sonra"}</Label>
            <H3>{story.questions.length} sual mətn üzrə</H3>
            <Muted small>Cavablar yalnız mətndə var. Nəticə müəllimə göndəriləcək.</Muted>
          </Grid>
          <Btn onClick={startQuestions}>Suallara keç →</Btn>
        </Callout>
      </Stack>
    );
  }

  const shownLevels = levels.filter((l) => stories.some((s) => s.level === l.id));
  const visible = ordered.filter((s) => levelFilter === "all" || s.level === levelFilter);
  const done = ordered.filter((s) => (student.best[s.id] ?? -1) >= PASS_PCT).length;

  return (
    <Stack>
      {nameBar}
      <div>
        <Label>
          {done}/{ordered.length} mətn tamamlanıb
        </Label>
        <H2>Listening</H2>
        <Muted as="p">
          Nağıllar, hekayələr və dialoqlar keçilən mövzular üzrə yazılıb. Mətni dinlə, oxunan söz sarı ilə işarələnir.
          Sonra mətn üzrə suallara cavab ver.
        </Muted>
      </div>

      {!ordered.length ? (
        <Empty>
          <H3>Mətnlər hazırlanır</H3>
          <Muted as="p">Listening mətnləri tezliklə burada olacaq.</Muted>
        </Empty>
      ) : (
        <>
          <Seg aria-label="Səviyyə">
            <SegButton aria-pressed={levelFilter === "all"} onClick={() => setLevelFilter("all")}>
              Hamısı
            </SegButton>
            {shownLevels.map((l) => (
              <SegButton key={l.id} aria-pressed={levelFilter === l.id} onClick={() => setLevelFilter(l.id)}>
                {l.code}
                {age?.typical.includes(l.id) ? " ★" : ""}
              </SegButton>
            ))}
          </Seg>
          {age && <Muted as="p" small>★ {age.label} yaş üçün tipik səviyyələr</Muted>}

          <Grid templateColumns="repeat(auto-fill, minmax(240px, 1fr))" gap="10px">
            {visible.map((s) => {
              const level = levelOf(s);
              const b = student.best[s.id];
              const fits = !age || suitsAge(s, age.id);
              return (
                <CardButton key={s.id} style={lv(level.id)} gap="4px" alignContent="start" _hover={{ borderColor: "var(--gc)" }} onClick={() => open(s)}>
                  <Row gap="8px">
                    <Chip variant="level">{level.code}</Chip>
                    {b !== undefined && (
                      <Pill tone={b >= PASS_PCT ? "good" : "accent"} fontWeight={b >= PASS_PCT ? "600" : "500"}>
                        {b >= PASS_PCT ? "Tamamlandı" : "Ən yaxşı"} · {b}%
                      </Pill>
                    )}
                  </Row>
                  <H3>{s.title}</H3>
                  <Muted small>{s.az}</Muted>
                  <Muted small>
                    ~{minutes(s)} dəq · {s.questions.length} sual · {s.covers.map(topicTitle).join(", ")}
                  </Muted>
                  {!fits && <Muted small>Əsasən {agesLabel(s)} yaş üçün</Muted>}
                </CardButton>
              );
            })}
          </Grid>
        </>
      )}
    </Stack>
  );
}
