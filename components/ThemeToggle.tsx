"use client";

import { chakra } from "@chakra-ui/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SideButton } from "./ui/kit";

export default function ThemeToggle({ iconOnly }: { iconOnly?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  // The saved theme is only known in the browser; render the light-mode label until then.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dark = mounted && resolvedTheme === "dark";
  const label = dark ? "İşıqlı rejim" : "Qaranlıq rejim";
  return (
    <SideButton iconOnly={iconOnly} onClick={() => setTheme(dark ? "light" : "dark")} aria-label={label} title={label}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {dark ? (
          <path d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.41-1.41M4.93 19.07l1.41-1.41m0-11.32L4.93 4.93m14.14 14.14-1.41-1.41M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
        ) : (
          <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
        )}
      </svg>
      <chakra.span display={{ base: "none", md: iconOnly ? "none" : "inline" }}>{label}</chakra.span>
    </SideButton>
  );
}
