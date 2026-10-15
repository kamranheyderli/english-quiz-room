"use client";

import { Box, chakra, Grid } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { makeUtterance, say, speechSupported, stop } from "@/lib/speech";
import { Btn, Card, Muted, Notice, Row, Seg, SegButton } from "./ui/kit";

type Word = { text: string; start: number };
type Sentence = { para: number; text: string; words: Word[] };
type Active = { s: number; w: number } | null;

const SPEEDS = [
  { id: "slow", label: "Yavaş", rate: 0.55 },
  { id: "normal", label: "Normal", rate: 0.7 },
  { id: "fast", label: "Sürətli", rate: 0.85 },
];

/** Splits paragraphs into sentences, and sentences into words with their character offsets. */
function tokenize(paragraphs: string[]): Sentence[] {
  const out: Sentence[] = [];
  paragraphs.forEach((p, para) => {
    const parts = p.match(/[^.!?]+[.!?]+["”’]?\s*|[^.!?]+$/g) ?? [p];
    for (const raw of parts) {
      const text = raw.trim();
      if (!text) continue;
      const words: Word[] = [];
      for (const m of text.matchAll(/\S+/g)) words.push({ text: m[0], start: m.index ?? 0 });
      out.push({ para, text, words });
    }
  });
  return out;
}

export default function StoryReader({ paragraphs, onFinished }: { paragraphs: string[]; onFinished?: () => void }) {
  const sentences = useMemo(() => tokenize(paragraphs), [paragraphs]);
  const [supported, setSupported] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState<Active>(null);
  const [speed, setSpeed] = useState("normal");
  const [hidden, setHidden] = useState(false);
  const runRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const sentenceRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const rate = SPEEDS.find((s) => s.id === speed)!.rate;

  useEffect(() => {
    setSupported(speechSupported());
    return () => {
      runRef.current++;
      clearTimers();
      stop();
    };
  }, []);

  useEffect(() => {
    if (active) sentenceRefs.current[active.s]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [active?.s]); // eslint-disable-line react-hooks/exhaustive-deps

  function clearTimers() {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }

  function speakSentence(si: number, run: number, r: number) {
    if (run !== runRef.current) return;
    if (si >= sentences.length) {
      setPlaying(false);
      setActive(null);
      onFinished?.();
      return;
    }
    const sentence = sentences[si];
    setActive({ s: si, w: 0 });
    const u = makeUtterance(sentence.text, r);
    let boundarySeen = false;

    u.onboundary = (e) => {
      if (run !== runRef.current || (e.name && e.name !== "word")) return;
      boundarySeen = true;
      clearTimers();
      let w = 0;
      sentence.words.forEach((word, i) => {
        if (word.start <= e.charIndex) w = i;
      });
      setActive({ s: si, w });
    };

    // Some voices (often on Android) send no word boundaries: step through the words on an estimated clock.
    u.onstart = () => {
      if (run !== runRef.current) return;
      timersRef.current.push(
        window.setTimeout(() => {
          if (boundarySeen || run !== runRef.current) return;
          const msPerChar = 68 / r;
          let elapsed = 0;
          sentence.words.forEach((word, i) => {
            if (i > 0) {
              const at = elapsed;
              timersRef.current.push(
                window.setTimeout(() => run === runRef.current && setActive({ s: si, w: i }), Math.max(0, at - 450)),
              );
            }
            elapsed += (word.text.length + 1) * msPerChar;
          });
        }, 450),
      );
    };

    u.onend = () => {
      if (run !== runRef.current) return;
      clearTimers();
      speakSentence(si + 1, run, r);
    };
    // say() retries failed or stray-cancelled sentences itself; stop only once it gives up.
    say(u, () => {
      if (run !== runRef.current) return;
      clearTimers();
      setPlaying(false);
    });
  }

  function playFrom(si: number, r = rate) {
    if (!speechSupported()) return;
    const run = ++runRef.current;
    clearTimers();
    stop();
    setPlaying(true);
    // A short gap after stopping keeps Chrome from dropping the next utterance.
    window.setTimeout(() => speakSentence(si, run, r), 60);
  }

  function pause() {
    runRef.current++;
    clearTimers();
    stop();
    setPlaying(false);
  }

  function changeSpeed(id: string) {
    setSpeed(id);
    if (playing && active) playFrom(active.s, SPEEDS.find((s) => s.id === id)!.rate);
  }

  const byPara: { sentence: Sentence; index: number }[][] = [];
  sentences.forEach((sentence, index) => (byPara[sentence.para] ??= []).push({ sentence, index }));

  return (
    <Grid gap="14px">
      {supported ? (
        <Card
          display="flex"
          flexWrap="wrap"
          alignItems="center"
          gap={{ base: "10px", sm: "12px 14px" }}
          rounded="16px"
          px={{ base: "12px", sm: "14px" }}
          py={{ base: "10px", sm: "12px" }}
          position="sticky"
          top={{ base: "64px", md: "8px" }}
          zIndex="2"
        >
          <chakra.button
            flex="none"
            w={{ base: "46px", sm: "52px" }}
            h={{ base: "46px", sm: "52px" }}
            rounded="full"
            border="0"
            bg="marigold"
            color="#1d1606"
            display="grid"
            placeItems="center"
            cursor="pointer"
            css={{ "& svg": { w: "24px", h: "24px", fill: "currentColor", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" } }}
            onClick={() => (playing ? pause() : playFrom(active?.s ?? 0))}
            aria-label={playing ? "Fasilə" : "Dinlə"}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {playing ? <path d="M8 5v14M16 5v14" /> : <path d="M7 4.5v15l12-7.5-12-7.5Z" />}
            </svg>
          </chakra.button>
          <Grid flex="1" minW="140px" gap="1px">
            <strong>{playing ? "Oxunur…" : active ? "Fasilə" : "Dinləməyə başla"}</strong>
            <Muted small>
              {active ? `Cümlə ${active.s + 1} / ${sentences.length}` : `${sentences.length} cümlə · istənilən cümləyə basıb oradan dinlə`}
            </Muted>
          </Grid>
          <Row gap="8px" w={{ base: "full", sm: "auto" }}>
            <Seg aria-label="Sürət" flex={{ base: "1", sm: "initial" }} flexWrap={{ base: "nowrap", sm: "wrap" }} minW="0">
              {SPEEDS.map((s) => (
                <SegButton
                  key={s.id}
                  flex={{ base: "1", sm: "initial" }}
                  px={{ base: "4px", sm: "12px" }}
                  fontSize={{ base: "12.5px", sm: "13px" }}
                  aria-pressed={speed === s.id}
                  onClick={() => changeSpeed(s.id)}
                >
                  {s.label}
                </SegButton>
              ))}
            </Seg>
            {active && !playing && (
              <Btn ghost size={{ base: "sm", sm: "md" }} onClick={() => playFrom(0)}>
                Başdan
              </Btn>
            )}
            <Btn ghost size={{ base: "sm", sm: "md" }} aria-pressed={hidden} onClick={() => setHidden((h) => !h)}>
              {hidden ? "Mətni göstər" : "Mətni gizlət"}
            </Btn>
          </Row>
        </Card>
      ) : (
        <Notice>Bu brauzer mətni səsləndirə bilmir. Mətni oxuyub suallara keçə bilərsən.</Notice>
      )}

      <Card
        position="relative"
        rounded="16px"
        p={{ base: "16px", sm: "20px 22px" }}
        display="grid"
        gap="14px"
        fontSize="clamp(17px, 2.4vw, 19px)"
        lineHeight="1.8"
        aria-live="off"
        css={{
          "& .sent": {
            cursor: "pointer",
            rounded: "6px",
            py: "2px",
            transition: "background .2s",
            boxDecorationBreak: "clone",
            scrollMarginTop: { base: "200px", md: "110px" },
            scrollMarginBottom: "24px",
            _hover: { bg: "accent.soft" },
          },
          "& .sent.on": { bg: "hl.sent" },
          "& .w": { rounded: "4px", px: "1px", transition: "background .12s" },
          "& .w.on": { bg: "hl.word", color: "hl.wordInk" },
          "& p": hidden ? { filter: "blur(7px)", userSelect: "none" } : {},
        }}
      >
        {hidden && (
          <Box position="absolute" inset="0" display="grid" placeItems="center" fontWeight="600" zIndex="1">
            Mətn gizlədilib: əvvəlcə yalnız dinlə
          </Box>
        )}
        {byPara.map((list, p) => (
          <p key={p}>
            {list.map(({ sentence, index }) => (
              <span
                key={index}
                ref={(el) => {
                  sentenceRefs.current[index] = el;
                }}
                className={active?.s === index ? "sent on" : "sent"}
                onClick={() => supported && playFrom(index)}
              >
                {sentence.words.map((w, wi) => (
                  <span key={wi}>
                    <span className={active?.s === index && active.w === wi ? "w on" : "w"}>{w.text}</span>{" "}
                  </span>
                ))}
              </span>
            ))}
          </p>
        ))}
      </Card>
    </Grid>
  );
}
