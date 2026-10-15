import mock from "@/data/mock-results.json";
import type { Attempt } from "./types";

// Mock storage: sample results come from data/mock-results.json, new results
// live in this serverless instance's memory and disappear when Vercel recycles it.
// To move to a real database, replace only the two functions below.

const MAX_LIVE = 500;
const live: Attempt[] = [];

export async function listAttempts(): Promise<Attempt[]> {
  const samples = (mock as Attempt[]).map((a) => ({ ...a, sample: true }));
  return [...live, ...samples].sort((a, b) => b.at.localeCompare(a.at));
}

export async function addAttempt(attempt: Attempt): Promise<void> {
  live.unshift(attempt);
  if (live.length > MAX_LIVE) live.length = MAX_LIVE;
}
