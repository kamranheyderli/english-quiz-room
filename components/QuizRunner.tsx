"use client";

import { Box, chakra, Flex, Grid, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { burstFrom, rain } from "@/lib/confetti";
import { pickQuestions, shuffle, skillScores } from "@/lib/quiz";
import { useSpeech } from "@/lib/speech";
import { lv, SPRING } from "@/lib/theme";
import type { AgeGroup, Level, Topic } from "@/lib/types";
import ScoreRing from "./ScoreRing";
import { Bar, BarRow, Btn, Card, H2, H3, Label, Muted, Notice, Row, Stack } from "./ui/kit";

type Answer = { qi: number; picked: number; ok: boolean };
type Item = { qi: number; opts: number[] };

const LETTERS = ["A", "B", "C", "D"];
/** Age groups that get confetti and playful feedback on every answer. */
const YOUNG_AGES = ["4-5", "6-8"];
const PRAISE = ["Afərin!", "Super!", "Əla!", "Bravo!", "Çox yaxşı!"];

function Blanked({ text }: { text: string }) {
  const [before, after] = text.split("___");
  if (after === undefined) return <>{text}</>;
  return (
    <>
      {before}
      <chakra.span display="inline-block" minW="3.2em" borderBottom="3px solid" borderColor="marigold" aria-label="boşluq" />
      {after}
    </>
  );
}

const Option = chakra("button", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textAlign: "left",
    borderWidth: "2px",
    borderColor: "line",
    bg: "page",
    rounded: "12px",
    px: "14px",
    py: "12px",
    fontSize: "16px",
    minW: "0",
    cursor: "pointer",
    _hover: { borderColor: "accent" },
    _disabled: { cursor: "default", _hover: { borderColor: "line" } },
    _focusVisible: { outline: "3px solid", outlineColor: "accent", outlineOffset: "2px" },
  },
  variants: {
    state: {
      idle: {},
      right: { borderColor: "good", bg: "good.soft", _disabled: { _hover: { borderColor: "good" } } },
      wrong: { borderColor: "bad", bg: "bad.soft", _disabled: { _hover: { borderColor: "bad" } } },
    },
    picture: {
      true: { justifyContent: "center", flexDirection: "column", gap: "6px", minH: "120px" },
    },
  },
});

const newItems = (topic: Topic): Item[] => pickQuestions(topic).map((qi) => ({ qi, opts: shuffle([0, 1, 2, 3]) }));

type Props = {
  topic: Topic;
  level: Level;
  age: AgeGroup;
  name: string;
  /** Called once per finished attempt with the percentage score. */
  onFinish: (pct: number) => void;
  onExit: () => void;
  exitLabel: string;
  /** Optional follow-up shown on the result screen, e.g. the next grammar lesson. */
  next?: { label: string; onClick: () => void };
};

export default function QuizRunner({ topic, level, age, name, onFinish, onExit, exitLabel, next }: Props) {
  const [items, setItems] = useState<Item[]>(() => newItems(topic));
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const nextRef = useRef<HTMLButtonElement>(null);
  const speech = useSpeech();
  const currentSay = done ? undefined : topic.questions[items[index].qi].say;
  const young = YOUNG_AGES.includes(age.id);
  const [praise, setPraise] = useState(PRAISE[0]);

  useEffect(() => {
    if (picked !== null) nextRef.current?.focus();
  }, [picked]);

  useEffect(() => {
    if (currentSay) speech.speak(currentSay);
  }, [currentSay, index, items, speech.speak]);

  function restart() {
    setItems(newItems(topic));
    setIndex(0);
    setAnswers([]);
    setPicked(null);
    setDone(false);
    setSaveMsg("");
  }

  function choose(qi: number, option: number, button: HTMLElement) {
    const q = topic.questions[qi];
    if (young && option === q.answer) {
      burstFrom(button);
      setPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
    }
    if (q.say) speech.speak(option === q.answer ? "Well done!" : "Oops! Try again next time.");
    setPicked(option);
    setAnswers((prev) => [...prev, { qi, picked: option, ok: option === topic.questions[qi].answer }]);
  }

  async function advance() {
    setPicked(null);
    if (index + 1 < items.length) {
      setIndex(index + 1);
      return;
    }
    const score = answers.filter((a) => a.ok).length;
    const finalPct = Math.round((score / answers.length) * 100);
    onFinish(finalPct);
    if (finalPct === 100 || (young && finalPct >= 50)) window.setTimeout(() => rain(finalPct === 100 ? 220 : 140), 150);
    setDone(true);
    setSaveMsg("Nəticə müəllimə göndərilir…");
    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          age: age.id,
          topic: topic.id,
          asked: answers.map((a) => a.qi),
          wrong: answers.filter((a) => !a.ok).map((a) => a.qi),
        }),
      });
      setSaveMsg(res.ok ? "Nəticə müəllimə göndərildi." : "Nəticə göndərilmədi. Bir az sonra yenidən cəhd et.");
    } catch {
      setSaveMsg("İnternet bağlantısı yoxdur, nəticə göndərilmədi.");
    }
  }

  if (!done) {
    const item = items[index];
    const q = topic.questions[item.qi];
    const answered = picked !== null;
    const correct = answered && picked === q.answer;
    const bigPic = q.pictureOptions && q.picture;
    return (
      <Card as="section" rounded="18px" p={{ base: "16px", sm: "22px" }} display="grid" gap="18px">
        <Flex justify="space-between" gap="8px" fontSize="13px" color="ink.muted" fontVariantNumeric="tabular-nums">
          <span>
            Sual {index + 1} / {items.length}
          </span>
          <span>Düzgün: {answers.filter((a) => a.ok).length}</span>
        </Flex>
        <Bar h="8px" color="accent" value={((index + (answered ? 1 : 0)) / items.length) * 100} />
        {q.say && speech.supported && (
          <Row gap="12px">
            <chakra.button
              display="inline-flex"
              alignItems="center"
              gap="8px"
              border="0"
              bg="marigold"
              color="#1d1606"
              fontWeight="600"
              px="16px"
              py="10px"
              rounded="full"
              fontSize="16px"
              cursor="pointer"
              onClick={() => speech.speak(q.say!)}
              css={{ "& svg": { w: "22px", h: "22px", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11 5 6 9H3v6h3l5 4V5Zm4.5 3.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" />
              </svg>
              Dinlə
            </chakra.button>
            <Muted small>Sualı yenidən eşitmək üçün bas</Muted>
          </Row>
        )}
        <Text fontFamily="heading" fontWeight="600" fontSize="clamp(20px, 4vw, 26px)" lineHeight="1.3">
          {q.picture && (
            <chakra.span
              aria-hidden="true"
              display={bigPic ? "block" : "inline"}
              fontSize={bigPic ? "2.4em" : "1.6em"}
              mr={bigPic ? "0" : "8px"}
              mb={bigPic ? "8px" : "0"}
              verticalAlign="-0.15em"
            >
              {q.picture}
            </chakra.span>
          )}
          <Blanked text={q.question} />
        </Text>
        <Grid templateColumns={q.pictureOptions ? "repeat(2, minmax(0, 1fr))" : "repeat(auto-fit, minmax(200px, 1fr))"} gap="10px">
          {item.opts.map((oi, k) => {
            const state = answered && oi === q.answer ? "right" : answered && oi === picked ? "wrong" : "idle";
            return (
              <Option
                key={oi}
                state={state}
                picture={q.pictureOptions || undefined}
                animation={young && state === "right" ? `pop .45s ${SPRING}` : young && state === "wrong" ? "wiggle .4s ease-in-out" : undefined}
                disabled={answered}
                onClick={(e) => choose(item.qi, oi, e.currentTarget)}
              >
                {!q.pictureOptions && (
                  <chakra.span
                    flex="none"
                    w="28px"
                    h="28px"
                    rounded="8px"
                    display="grid"
                    placeItems="center"
                    bg="surface"
                    borderWidth="1px"
                    borderColor="line"
                    fontSize="13px"
                    fontWeight="600"
                    color="ink.muted"
                  >
                    {LETTERS[k]}
                  </chakra.span>
                )}
                {q.pictureOptions ? (
                  <chakra.span fontSize="clamp(44px, 9vw, 64px)" lineHeight="1.1" textAlign="center" wordBreak="break-all">
                    {q.options[oi]}
                  </chakra.span>
                ) : (
                  <span>{q.options[oi]}</span>
                )}
              </Option>
            );
          })}
        </Grid>
        {answered && (
          <>
            <Grid
              rounded="12px"
              px="14px"
              py="12px"
              gap="4px"
              bg={correct ? "good.soft" : "bad.soft"}
              animation={young && correct ? `pop .4s ${SPRING}` : undefined}
            >
              <Text as="strong" fontWeight="600" fontFamily={young && correct ? "heading" : undefined} fontSize={young && correct ? "20px" : undefined}>
                {correct
                  ? young
                    ? `⭐ ${praise}`
                    : "Düzdür! Əla."
                  : young
                    ? `Heç nə olmaz! Düzgün cavab: ${q.options[q.answer]}`
                    : `Səhvdir. Düzgün cavab: ${q.options[q.answer]}`}
              </Text>
              {q.explain && <span>{q.explain}</span>}
            </Grid>
            <Row justifyContent="flex-end">
              <Btn ref={nextRef} onClick={advance}>
                {index + 1 < items.length ? "Növbəti sual →" : "Nəticəni gör"}
              </Btn>
            </Row>
          </>
        )}
      </Card>
    );
  }

  const score = answers.filter((a) => a.ok).length;
  const pct = Math.round((score / answers.length) * 100);
  const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : pct > 0 ? 1 : 0;
  const message = young
    ? pct === 100
      ? "Möhtəşəm! Hamısını tapdın! 🎉"
      : pct >= 60
        ? "Çox yaxşı! Bir az da qalıb, yenə oynayaq? 🌟"
        : "Yaxşı başladın! Gəl bir dəfə də oynayaq 💪"
    : pct === 100
      ? "Mükəmməl! Bütün suallar düzdür."
      : pct >= 80
        ? "Çox yaxşı nəticə!"
        : pct >= 50
          ? "Pis deyil. Səhvlərə bax və yenidən cəhd et."
          : "Bu mövzunu təkrarlamaq lazımdır.";

  return (
    <Stack>
      <Flex wrap="wrap" align="center" gap="20px">
        <ScoreRing pct={pct} />
        {young && (
          <Flex gap="4px" fontSize="44px" lineHeight="1" aria-label={`${stars} ulduz`}>
            {[1, 2, 3].map((n) => (
              <chakra.span
                key={n}
                color={n <= stars ? "marigold" : "line"}
                animation={n <= stars ? `starIn .6s ${SPRING} both` : undefined}
                animationDelay={`${n * 0.25}s`}
              >
                ★
              </chakra.span>
            ))}
          </Flex>
        )}
        <Stack gap="4px">
          <Label>
            {name} · {age.label} yaş · {level.code} · <span lang="en">{topic.title}</span>
          </Label>
          <H2>
            {score} / {answers.length} düzgün cavab
          </H2>
          <Muted>{message}</Muted>
        </Stack>
      </Flex>
      {saveMsg && <Notice>{saveMsg}</Notice>}
      <Row>
        {next && <Btn onClick={next.onClick}>{next.label}</Btn>}
        <Btn ghost={!!next} onClick={restart}>
          Yenidən başla
        </Btn>
        <Btn ghost onClick={onExit}>
          {exitLabel}
        </Btn>
      </Row>
      <H3>Bacarıqlar üzrə</H3>
      <Grid gap="8px" style={lv(level.id)}>
        {skillScores(
          topic,
          answers.map((a) => a.qi),
          answers.filter((a) => !a.ok).map((a) => a.qi),
        ).map((s) => (
          <BarRow
            key={s.id}
            label={s.label}
            title={s.label}
            value={(s.right / s.total) * 100}
            color={s.right === s.total ? "good" : s.right * 2 >= s.total ? "var(--gc)" : "bad"}
            num={`${s.right}/${s.total}`}
          />
        ))}
      </Grid>
      <H3>Cavabların</H3>
      <Grid gap="8px">
        {answers.map((a, n) => {
          const q = topic.questions[a.qi];
          return (
            <Card key={n} rounded="12px" px="14px" py="10px" display="grid" gap="3px">
              <Box as="span" fontWeight="600" color={a.ok ? "good" : "bad"}>
                {n + 1}. {a.ok ? "Düz" : "Səhv"}{" "}
                <Muted small fontWeight="400">
                  · {topic.skills.find((s) => s.id === q.skill)?.label}
                </Muted>
              </Box>
              <span>
                {q.picture ? `${q.picture} ` : ""}
                {q.question}
              </span>
              <Muted small>
                {a.ok
                  ? `Cavab: ${q.options[q.answer]}`
                  : `Sənin cavabın: ${q.options[a.picked]} · Düzgün: ${q.options[q.answer]}`}
              </Muted>
              {!a.ok && q.explain && <Text fontSize="13px">{q.explain}</Text>}
            </Card>
          );
        })}
      </Grid>
    </Stack>
  );
}
