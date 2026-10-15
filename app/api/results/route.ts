import { randomUUID } from "node:crypto";
import { findAge, findTopic } from "@/lib/curriculum";
import { addAttempt, listAttempts } from "@/lib/storage";

export const dynamic = "force-dynamic";

function teacherAllowed(req: Request) {
  const pin = process.env.TEACHER_PIN;
  return !pin || req.headers.get("x-teacher-pin") === pin;
}

/** Unique integer indices in [0, max); null if the value is not such a list. */
function indexList(value: unknown, max: number): number[] | null {
  if (!Array.isArray(value)) return null;
  if (!value.every((i) => Number.isInteger(i) && i >= 0 && i < max)) return null;
  return new Set(value).size === value.length ? (value as number[]) : null;
}

export async function GET(req: Request) {
  if (!teacherAllowed(req)) {
    return Response.json({ error: "PIN kodu yanlışdır." }, { status: 401 });
  }
  return Response.json({ results: await listAttempts() });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Sorğu boşdur." }, { status: 400 });
  }
  const { name, age, topic, asked, wrong } = body as Record<string, unknown>;
  const t = typeof topic === "string" ? findTopic(topic) : undefined;
  const max = t?.questions.length ?? 0;
  const askedList = indexList(asked, max);
  const wrongList = indexList(wrong, max);
  const cleanName = typeof name === "string" ? name.trim().slice(0, 60) : "";

  if (
    !t ||
    typeof age !== "string" ||
    !findAge(age) ||
    !cleanName ||
    !askedList?.length ||
    !wrongList ||
    !wrongList.every((i) => askedList.includes(i))
  ) {
    return Response.json({ error: "Nəticə məlumatları düzgün deyil." }, { status: 400 });
  }

  const attempt = {
    id: randomUUID(),
    name: cleanName,
    age,
    topic: t.id,
    score: askedList.length - wrongList.length,
    total: askedList.length,
    asked: askedList,
    wrong: wrongList,
    at: new Date().toISOString(),
  };
  await addAttempt(attempt);
  return Response.json({ ok: true, attempt }, { status: 201 });
}
