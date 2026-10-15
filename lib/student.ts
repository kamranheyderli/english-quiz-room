"use client";

import { useCallback, useEffect, useState } from "react";

/** A topic counts as completed once its best score reaches this percentage. */
export const PASS_PCT = 70;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/** The student's name, age group and best score per topic, kept in this browser. */
export function useStudent() {
  const [name, setNameState] = useState("");
  const [ageId, setAgeState] = useState<string | null>(null);
  const [best, setBestState] = useState<Record<string, number>>({});

  useEffect(() => {
    setNameState(load("eq-name", ""));
    setAgeState(load<string | null>("eq-age", null));
    setBestState(load("eq-best", {}));
  }, []);

  const setName = useCallback((value: string) => {
    setNameState(value);
    save("eq-name", value);
  }, []);

  const setAge = useCallback((value: string) => {
    setAgeState(value);
    save("eq-age", value);
  }, []);

  const recordScore = useCallback((topicId: string, pct: number) => {
    setBestState((prev) => {
      if (prev[topicId] !== undefined && prev[topicId] >= pct) return prev;
      const next = { ...prev, [topicId]: pct };
      save("eq-best", next);
      return next;
    });
  }, []);

  return { name, setName, ageId, setAge, best, recordScore };
}
