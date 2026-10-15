"use client";

import { chakra } from "@chakra-ui/react";

export default function ScoreRing({ pct }: { pct: number }) {
  const r = 50;
  const c = 2 * Math.PI * r;
  const color = pct >= 80 ? "var(--chakra-colors-good)" : pct >= 50 ? "var(--chakra-colors-accent)" : "var(--chakra-colors-bad)";
  return (
    <chakra.svg w="120px" h="120px" flex="none" viewBox="0 0 120 120" role="img" aria-label={`${pct} faiz`}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--chakra-colors-accent-soft)" strokeWidth="12" />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={`${(c * pct) / 100} ${c}`}
        transform="rotate(-90 60 60)"
      />
      <chakra.text x="60" y="68" textAnchor="middle" fontSize="26px" fontFamily="heading" fontWeight="800" fill="ink">
        {pct}%
      </chakra.text>
    </chakra.svg>
  );
}
