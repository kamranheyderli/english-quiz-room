import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import type { CSSProperties } from "react";

/** A semantic colour with its light and dark value. */
const c = (light: string, dark: string) => ({ value: { _light: light, _dark: dark } });

/** One colour per CEFR level; set as --gc on a container and read with var(--gc). */
export const LEVEL_COLORS: Record<string, string> = {
  early: "#e0607e",
  "pre-a1": "#e39a2d",
  a1: "#3fa874",
  a2: "#1f9aa8",
  b1: "#2a5bd7",
  b2: "#8a56d6",
  c1: "#d14f7a",
};

export const lv = (levelId: string) => ({ "--gc": LEVEL_COLORS[levelId] }) as CSSProperties;

const accent = c("#2a5bd7", "#7fa2ff");
const accentInk = c("#ffffff", "#0f1424");
const accentSoft = c("#e6edfc", "#233260");
const page = c("#f5f7fb", "#0f1424");
const surface = c("#ffffff", "#18203a");
const ink = c("#16213e", "#e8ecf8");
const muted = c("#5b6684", "#9aa5c4");
const line = c("#dde3ef", "#2a3556");

const config = defineConfig({
  globalCss: {
    body: { bg: "page", color: "ink", fontFamily: "body", fontSize: "15px", lineHeight: 1.55 },
    "h1, h2, h3": { fontFamily: "heading", textWrap: "balance", lineHeight: 1.15 },
    "*": {
      "@media (prefers-reduced-motion: reduce)": { transition: "none !important", animation: "none !important" },
    },
  },
  theme: {
    breakpoints: { sm: "520px", md: "800px", lg: "1024px", xl: "1280px", "2xl": "1536px" },
    tokens: {
      fonts: {
        heading: { value: 'var(--font-display), "Avenir Next", system-ui, sans-serif' },
        body: { value: 'var(--font-body), "Segoe UI", system-ui, sans-serif' },
      },
    },
    semanticTokens: {
      colors: {
        page,
        surface,
        ink: { DEFAULT: ink, muted },
        line,
        marigold: c("#f2a93b", "#f2a93b"),
        good: { DEFAULT: c("#1f8a5b", "#5fd39c"), soft: c("#e1f4ea", "#173a2c") },
        bad: { DEFAULT: c("#c9423a", "#ff8a80"), soft: c("#fbe6e4", "#4a2220") },
        hl: { sent: c("#fff6cc", "#3a3418"), word: c("#ffd54a", "#f2c230"), wordInk: c("#1d1606", "#1d1606") },
        // A full palette so Chakra components accept colorPalette="accent".
        accent: {
          DEFAULT: accent,
          ink: accentInk,
          soft: accentSoft,
          solid: accent,
          contrast: accentInk,
          fg: accent,
          muted: line,
          subtle: accentSoft,
          emphasized: accentSoft,
          focusRing: accent,
        },
        // Chakra's own defaults, pointed at the app palette so built-in components match.
        bg: { DEFAULT: page, panel: surface },
        fg: { DEFAULT: ink, muted },
        border: { DEFAULT: line },
      },
    },
    keyframes: {
      pop: { "0%": { transform: "scale(1)" }, "45%": { transform: "scale(1.08)" }, "100%": { transform: "scale(1)" } },
      wiggle: {
        "0%, 100%": { transform: "translateX(0)" },
        "25%": { transform: "translateX(-6px)" },
        "75%": { transform: "translateX(6px)" },
      },
      starIn: {
        "0%": { transform: "scale(0) rotate(-40deg)", opacity: 0 },
        "100%": { transform: "scale(1) rotate(0)", opacity: 1 },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);

/** Springy easing used by the playful animations for young students. */
export const SPRING = "cubic-bezier(.3, 1.6, .5, 1)";
