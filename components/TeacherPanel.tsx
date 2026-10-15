"use client";

import { Box, Grid, Input, NativeSelect, Table, Text, type TableCellProps, type TableColumnHeaderProps } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ALL_TOPICS } from "@/lib/curriculum";
import { skillScores } from "@/lib/quiz";
import { lv } from "@/lib/theme";
import type { AgeGroup, Attempt, Curriculum, Level, Topic } from "@/lib/types";
import { BarRow, Btn, Card, Empty, ErrorText, H2, H3, Label, Muted, Pill, Row, Stack } from "./ui/kit";

type Row = Attempt & { ageGroup: AgeGroup; level: Level; topicInfo: Topic; pct: number };

const grade = (p: number) => (p >= 80 ? "hi" : p >= 50 ? "mid" : "lo");
const TONE = { hi: "good", mid: "accent", lo: "bad" } as const;
const field = { bg: "surface", borderColor: "line", rounded: "10px", fontSize: "15px", color: "ink", size: "sm" } as const;
const tableProps = { size: "sm", fontSize: "14px", bg: "transparent" } as const;

const TableBox = (props: { children: React.ReactNode }) => (
  <Table.ScrollArea bg="surface" borderWidth="1px" borderColor="line" rounded="14px" {...props} />
);
const Th = (props: TableColumnHeaderProps) => (
  <Table.ColumnHeader fontSize="11px" letterSpacing=".06em" textTransform="uppercase" color="ink.muted" fontWeight="600" whiteSpace="nowrap" px="12px" py="10px" borderColor="line" {...props} />
);
const Td = (props: TableCellProps) => <Table.Cell whiteSpace="nowrap" px="12px" py="10px" borderColor="line" css={{ "tr:last-of-type > &": { borderBottomWidth: 0 } }} {...props} />;
/** Which sidebar section a topic belongs to. */
const sectionOf = (t: Topic) => ("covers" in t ? "listening" : t.category ? "grammar" : "levels");
const fmt = (iso: string) =>
  new Date(iso).toLocaleString("az-AZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export default function TeacherPanel({ curriculum }: { curriculum: Curriculum }) {
  const { ageGroups, levels } = curriculum;
  const topics = ALL_TOPICS;
  const [results, setResults] = useState<Attempt[] | null>(null);
  const [needPin, setNeedPin] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [fAge, setFAge] = useState("");
  const [fLevel, setFLevel] = useState("");
  const [fSection, setFSection] = useState("");
  const [fName, setFName] = useState("");

  const fetchResults = useCallback(async (pinValue: string) => {
    setError("");
    try {
      const res = await fetch("/api/results", { headers: pinValue ? { "x-teacher-pin": pinValue } : {} });
      if (res.status === 401) {
        setNeedPin(true);
        if (pinValue) setError("PIN kodu yanlışdır.");
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNeedPin(false);
      setResults(data.results);
      try {
        sessionStorage.setItem("eq-pin", pinValue);
      } catch {}
    } catch {
      setError("Nəticələri yükləmək olmadı. Səhifəni yeniləyin.");
    }
  }, []);

  useEffect(() => {
    let saved = "";
    try {
      saved = sessionStorage.getItem("eq-pin") || "";
    } catch {}
    setPin(saved);
    fetchResults(saved);
  }, [fetchResults]);

  const allRows: Row[] = useMemo(() => {
    if (!results) return [];
    const out: Row[] = [];
    for (const a of results) {
      const ageGroup = ageGroups.find((x) => x.id === a.age);
      const topicInfo = topics.find((x) => x.id === a.topic);
      const level = topicInfo && levels.find((x) => x.id === topicInfo.level);
      if (!ageGroup || !topicInfo || !level) continue;
      out.push({ ...a, ageGroup, level, topicInfo, pct: Math.round((a.score / a.total) * 100) });
    }
    return out;
  }, [results, ageGroups, levels, topics]);

  const rows = useMemo(
    () =>
      allRows.filter(
        (r) =>
          (!fAge || r.age === fAge) &&
          (!fLevel || r.level.id === fLevel) &&
          (!fSection || sectionOf(r.topicInfo) === fSection) &&
          (!fName || r.name.toLowerCase().includes(fName.toLowerCase())),
      ),
    [allRows, fAge, fLevel, fSection, fName],
  );

  const topicStats = useMemo(() => {
    const map = new Map<string, { topic: Topic; level: Level; sum: number; n: number }>();
    for (const r of rows) {
      const cur = map.get(r.topic) ?? { topic: r.topicInfo, level: r.level, sum: 0, n: 0 };
      cur.sum += r.pct;
      cur.n++;
      map.set(r.topic, cur);
    }
    return [...map.values()].map((v) => ({ ...v, avg: Math.round(v.sum / v.n) })).sort((a, b) => a.avg - b.avg);
  }, [rows]);

  const weakSkills = useMemo(() => {
    const map = new Map<string, { topic: Topic; level: Level; label: string; right: number; total: number }>();
    for (const r of rows) {
      for (const s of skillScores(r.topicInfo, r.asked ?? [], r.wrong)) {
        const key = `${r.topic}|${s.id}`;
        const cur = map.get(key) ?? { topic: r.topicInfo, level: r.level, label: s.label, right: 0, total: 0 };
        cur.right += s.right;
        cur.total += s.total;
        map.set(key, cur);
      }
    }
    return [...map.entries()]
      .map(([key, v]) => ({ key, ...v, pct: Math.round((v.right / v.total) * 100) }))
      .filter((v) => v.total >= 3 && v.pct < 70)
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 8);
  }, [rows]);

  // Students per age × level, counting each student once at the highest level they attempted.
  const matrix = useMemo(() => {
    const order = levels.map((l) => l.id);
    const top = new Map<string, { age: string; level: string }>();
    for (const r of allRows) {
      const key = r.name.toLowerCase();
      const cur = top.get(key);
      if (!cur || order.indexOf(r.level.id) > order.indexOf(cur.level)) top.set(key, { age: r.age, level: r.level.id });
    }
    const counts: Record<string, number> = {};
    for (const v of top.values()) counts[`${v.age}|${v.level}`] = (counts[`${v.age}|${v.level}`] ?? 0) + 1;
    return counts;
  }, [allRows, levels]);

  if (needPin) {
    return (
      <Empty
        as="form"
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          fetchResults(pin);
        }}
      >
        <H3>Müəllim paneli</H3>
        <Muted as="p">Nəticələrə baxmaq üçün PIN kodu daxil edin.</Muted>
        <Row gap="8px" justifyContent="center">
          <Input
            id="teacher-pin"
            type="password"
            inputMode="numeric"
            aria-label="PIN kodu"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            {...field}
            bg="page"
            w="160px"
          />
          <Btn type="submit">Daxil ol</Btn>
        </Row>
        {error && <ErrorText>{error}</ErrorText>}
      </Empty>
    );
  }

  if (!results) {
    return <Empty>{error ? <ErrorText>{error}</ErrorText> : <H3>Nəticələr yüklənir…</H3>}</Empty>;
  }

  if (allRows.length === 0) {
    return (
      <Stack>
        <H2>Müəllim paneli</H2>
        <Empty>
          <H3>Hələ nəticə yoxdur</H3>
          <Muted as="p">Şagirdlər testi bitirən kimi nəticələri burada görünəcək.</Muted>
          <Btn ghost onClick={() => fetchResults(pin)}>
            Yenilə
          </Btn>
        </Empty>
      </Stack>
    );
  }

  const students = new Set(rows.map((r) => r.name.toLowerCase())).size;
  const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.pct, 0) / rows.length) : 0;

  return (
    <Stack>
      <Row justifyContent="space-between">
        <div>
          <H2>Müəllim paneli</H2>
          <Muted as="p">Şagirdlərin test nəticələri. Nəticələr müvəqqəti saxlanılır.</Muted>
        </div>
        <Btn ghost onClick={() => fetchResults(pin)}>
          Yenilə
        </Btn>
      </Row>

      <H3>Yaş və səviyyə üzrə şagirdlər</H3>
      <Muted as="p" small mt="-8px">
        Hər şagird işlədiyi ən yüksək səviyyədə sayılır.
      </Muted>
      <TableBox>
        <Table.Root {...tableProps}>
          <Table.Header>
            <Table.Row bg="transparent">
              <Th>Yaş</Th>
              {levels.map((l) => (
                <Th key={l.id} textAlign="center">
                  {l.code}
                </Th>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {ageGroups.map((a) => (
              <Table.Row key={a.id} bg="transparent">
                <Td>{a.label} yaş</Td>
                {levels.map((l) => {
                  const n = matrix[`${a.id}|${l.id}`] ?? 0;
                  return (
                    <Td key={l.id} textAlign="center">
                      <Box
                        as="span"
                        display="inline-grid"
                        placeItems="center"
                        minW="28px"
                        h="28px"
                        rounded="8px"
                        fontWeight="600"
                        fontVariantNumeric="tabular-nums"
                        bg={n ? "accent.soft" : undefined}
                        color={n ? "accent" : "line"}
                      >
                        {n || "·"}
                      </Box>
                    </Td>
                  );
                })}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </TableBox>

      <Row gap="8px">
        <NativeSelect.Root w="auto">
          <NativeSelect.Field id="f-age" aria-label="Yaş qrupu" {...field} value={fAge} onChange={(e) => setFAge(e.target.value)}>
            <option value="">Bütün yaşlar</option>
            {ageGroups.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label} yaş
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        <NativeSelect.Root w="auto">
          <NativeSelect.Field id="f-section" aria-label="Bölmə" {...field} value={fSection} onChange={(e) => setFSection(e.target.value)}>
            <option value="">Bütün bölmələr</option>
            <option value="levels">Səviyyə mövzuları</option>
            <option value="grammar">Qrammatika</option>
            <option value="listening">Listening</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        <NativeSelect.Root w="auto">
          <NativeSelect.Field id="f-level" aria-label="Səviyyə" {...field} value={fLevel} onChange={(e) => setFLevel(e.target.value)}>
            <option value="">Bütün səviyyələr</option>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.code} · {l.name}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        <Input
          id="f-name"
          placeholder="Şagird adı ilə axtar"
          aria-label="Şagird adı"
          value={fName}
          onChange={(e) => setFName(e.target.value)}
          {...field}
          flex="1 1 180px"
          w="auto"
          minW="0"
        />
      </Row>

      <Grid templateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap="10px">
        {[
          ["Şagird", students],
          ["Test cəhdi", rows.length],
          ["Orta nəticə", `${avg}%`],
        ].map(([label, value]) => (
          <Card key={label} px="14px" py="12px">
            <Label>{label}</Label>
            <Text fontFamily="heading" fontSize="28px" fontWeight="800" fontVariantNumeric="tabular-nums">
              {value}
            </Text>
          </Card>
        ))}
      </Grid>

      {topicStats.length > 0 && (
        <>
          <H3>
            Mövzular üzrə orta nəticə{" "}
            <Muted small fontWeight="400">
              (ən zəifdən başlayaraq)
            </Muted>
          </H3>
          <Grid gap="8px">
            {topicStats.map((t) => (
              <Box key={t.topic.id} style={lv(t.level.id)}>
                <BarRow label={`${t.level.code} · ${t.topic.title}`} title={t.topic.title} value={t.avg} num={`${t.avg}%`} />
              </Box>
            ))}
          </Grid>
        </>
      )}

      {weakSkills.length > 0 && (
        <>
          <H3>
            Təkrar tələb edən bacarıqlar{" "}
            <Muted small fontWeight="400">
              (düzgün cavab 70%-dən az)
            </Muted>
          </H3>
          <Grid gap="8px">
            {weakSkills.map((s) => (
              <BarRow
                key={s.key}
                title={`${s.topic.title} · ${s.label}`}
                label={
                  <>
                    {s.level.code} · {s.label}
                    <Muted> · {s.topic.title}</Muted>
                  </>
                }
                value={s.pct}
                color="bad"
                num={`${s.pct}%`}
              />
            ))}
          </Grid>
        </>
      )}

      <TableBox>
        <Table.Root {...tableProps}>
          <Table.Header>
            <Table.Row bg="transparent">
              <Th>Şagird</Th>
              <Th>Yaş</Th>
              <Th>Səviyyə</Th>
              <Th>Mövzu</Th>
              <Th>Nəticə</Th>
              <Th>Tarix</Th>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row bg="transparent">
                <Td colSpan={6} color="ink.muted">
                  Filtrə uyğun nəticə yoxdur.
                </Td>
              </Table.Row>
            ) : (
              rows.map((r) => (
                <Table.Row key={r.id} bg="transparent">
                  <Td>
                    {r.name}
                    {r.sample && (
                      <Box as="span" fontSize="11px" color="ink.muted" borderWidth="1px" borderColor="line" rounded="6px" px="5px" ml="6px">
                        Nümunə
                      </Box>
                    )}
                  </Td>
                  <Td>{r.ageGroup.label}</Td>
                  <Td>{r.level.code}</Td>
                  <Td>{r.topicInfo.title}</Td>
                  <Td fontVariantNumeric="tabular-nums">
                    <Pill tone={TONE[grade(r.pct)]}>
                      {r.score}/{r.total} · {r.pct}%
                    </Pill>
                  </Td>
                  <Td fontVariantNumeric="tabular-nums" color="ink.muted">
                    {fmt(r.at)}
                  </Td>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </TableBox>
    </Stack>
  );
}
