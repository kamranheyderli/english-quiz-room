"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function speechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Voices that are installed on most systems and known to work. Chrome on macOS also lists voices the
 * system has not downloaded (e.g. "Arthur", "Martha"); speaking with those fails, so they are not picked first.
 */
const PREFERRED = ["Daniel", "Google UK English Female", "Google UK English Male", "Samantha", "Google US English"];

/** Voices that failed before saying a word in this session; they are skipped from then on. */
const broken = new Set<string>();

/** Prefers a known good voice, then a local British voice, then any English voice. */
export function englishVoice(): SpeechSynthesisVoice | undefined {
  if (!speechSupported()) return undefined;
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en") && !broken.has(v.voiceURI));
  return (
    // macOS Chrome names them with the language, e.g. "Daniel (English (United Kingdom))".
    PREFERRED.map((name) => voices.find((v) => v.name === name || v.name.startsWith(`${name} (`))).find(Boolean) ??
    voices.find((v) => v.lang.startsWith("en-GB") && v.localService) ??
    voices.find((v) => v.lang.startsWith("en-GB")) ??
    voices[0]
  );
}

function setVoice(u: SpeechSynthesisUtterance, voice = englishVoice()) {
  u.voice = voice ?? null;
  u.lang = voice?.lang ?? "en-GB";
}

export function makeUtterance(text: string, rate: number) {
  const u = new SpeechSynthesisUtterance(text);
  setVoice(u);
  u.rate = rate;
  return u;
}

/** Bumped by every intentional stop(), so a cancel we did not ask for can be told apart. */
let stops = 0;

/**
 * Stops all speech on purpose. cancel() is only called when something is queued: on macOS Chrome
 * a cancel() can land late and also cancel the next utterance.
 */
export function stop() {
  if (!speechSupported()) return;
  stops++;
  const synth = window.speechSynthesis;
  if (synth.speaking || synth.pending) synth.cancel();
}

/** The error Chrome reports for an utterance that was cancelled rather than failed. */
export const wasCancelled = (e: SpeechSynthesisErrorEvent) => e.error === "canceled" || e.error === "interrupted";

/**
 * Queues an utterance and recovers from browser failures: if it errors before it starts, the voice is
 * marked broken and the text is spoken with the next voice; if it is cancelled midway without stop()
 * being called, it is spoken again. A speech queue left paused (backgrounded tab) is resumed.
 * `onFail` runs once it gives up.
 */
export function say(u: SpeechSynthesisUtterance, onFail?: () => void, retries = 3) {
  const synth = window.speechSynthesis;
  const at = stops;
  let started = false;
  const onStart = () => (started = true);
  const cleanup = () => {
    u.removeEventListener("start", onStart);
    u.removeEventListener("error", onError);
  };
  const onError = (e: SpeechSynthesisErrorEvent) => {
    cleanup();
    if (at !== stops) return;
    if (!started && u.voice) {
      broken.add(u.voice.voiceURI);
      setVoice(u);
    } else if (!wasCancelled(e)) {
      retries = 0;
    }
    if (retries <= 0) return onFail?.();
    window.setTimeout(() => at === stops && say(u, onFail, retries - 1), 250);
  };
  u.addEventListener("start", onStart);
  u.addEventListener("error", onError);
  u.addEventListener("end", cleanup, { once: true });
  synth.speak(u);
  if (synth.paused) synth.resume();
}

/** One-shot reading of short prompts (quiz questions, "Well done!"). */
export function useSpeech() {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported(speechSupported());
  }, []);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const speak = useCallback((text: string) => {
    if (!speechSupported()) return;
    stop();
    // A short gap after stopping keeps Chrome from dropping the next utterance.
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => say(makeUtterance(text, 0.75)), 60);
  }, []);
  return { supported, speak };
}
