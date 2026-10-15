"use client";

import { Box, Button, chakra, Grid, Text, type BoxProps, type ButtonProps, type TextProps } from "@chakra-ui/react";

/** White panel with a hairline border: the base of most cards. */
export const Card = chakra("div", {
  base: { bg: "surface", borderWidth: "1px", borderColor: "line", rounded: "14px" },
});

/** A whole card that is a button, lifting slightly on hover. */
export const CardButton = chakra("button", {
  base: {
    textAlign: "left",
    bg: "surface",
    borderWidth: "1px",
    borderColor: "line",
    rounded: "14px",
    p: "14px 16px",
    display: "grid",
    cursor: "pointer",
    transition: "transform .15s, border-color .15s",
    _hover: { transform: "translateY(-2px)", borderColor: "accent" },
    _disabled: { cursor: "default", opacity: 0.55, _hover: { transform: "none", borderColor: "line" } },
    _focusVisible: { outline: "3px solid", outlineColor: "accent", outlineOffset: "2px" },
  },
});

export function Btn({ ghost, ...props }: ButtonProps & { ghost?: boolean; ref?: React.Ref<HTMLButtonElement> }) {
  return (
    <Button
      colorPalette="accent"
      variant={ghost ? "outline" : "solid"}
      borderColor={ghost ? "line" : undefined}
      rounded="10px"
      fontWeight="600"
      fontSize="15px"
      px="18px"
      {...props}
    />
  );
}

export const Chip = chakra("span", {
  base: { fontSize: "12px", px: "9px", py: "2px", rounded: "full", whiteSpace: "nowrap" },
  variants: {
    variant: {
      soft: { bg: "accent.soft", color: "ink" },
      /** Coloured with the level of the nearest lv() container. */
      level: { bg: "var(--gc, var(--chakra-colors-accent))", color: "white", fontWeight: "600" },
    },
  },
  defaultVariants: { variant: "soft" },
});

/** Small rounded status label: done, tried, or a score grade. */
export const Pill = chakra("span", {
  base: { display: "inline-block", fontSize: "12px", fontWeight: "600", px: "9px", py: "2px", rounded: "full" },
  variants: {
    tone: {
      good: { bg: "good.soft", color: "good" },
      accent: { bg: "accent.soft", color: "accent" },
      bad: { bg: "bad.soft", color: "bad" },
    },
  },
});

/** Uppercase caption above headings. */
export function Label(props: TextProps) {
  return <Text fontSize="11px" letterSpacing=".08em" textTransform="uppercase" color="ink.muted" fontWeight="600" {...props} />;
}

export function Muted({ small, ...props }: TextProps & { small?: boolean }) {
  return <Text as="span" color="ink.muted" fontSize={small ? "13px" : undefined} {...props} />;
}

export function H2(props: TextProps) {
  return <Text as="h2" fontFamily="heading" fontSize="22px" fontWeight="800" m="0" {...props} />;
}

export function H3(props: TextProps) {
  return <Text as="h3" fontFamily="heading" fontSize="17px" fontWeight="600" m="0" {...props} />;
}

export function Stack(props: BoxProps) {
  return <Grid gap="14px" {...props} />;
}

export function Row(props: BoxProps) {
  return <Box display="flex" flexWrap="wrap" gap="10px" alignItems="center" {...props} />;
}

/** Segmented control; its buttons mark the current choice with aria-pressed. */
export function Seg(props: BoxProps) {
  return (
    <Box
      role="group"
      display="flex"
      flexWrap="wrap"
      gap="4px"
      bg="surface"
      borderWidth="1px"
      borderColor="line"
      rounded="12px"
      p="4px"
      {...props}
    />
  );
}

export const SegButton = chakra("button", {
  base: {
    border: "0",
    bg: "transparent",
    px: "12px",
    py: "6px",
    rounded: "9px",
    fontSize: "13px",
    fontWeight: "500",
    color: "ink.muted",
    cursor: "pointer",
    _pressed: { bg: "ink", color: "page" },
    _focusVisible: { outline: "3px solid", outlineColor: "accent", outlineOffset: "2px" },
  },
});

/** Small outlined icon-and-label button in the sidebar (theme, collapse). */
export const SideButton = chakra("button", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: "none",
    borderWidth: "1px",
    borderColor: "line",
    bg: "page",
    color: "ink.muted",
    rounded: "12px",
    p: { base: "8px", md: "8px 12px" },
    fontSize: "13px",
    fontWeight: "500",
    whiteSpace: "nowrap",
    cursor: "pointer",
    transition: "color .15s, border-color .15s",
    _hover: { color: "ink", borderColor: "ink.muted" },
    _focusVisible: { outline: "3px solid", outlineColor: "accent", outlineOffset: "2px" },
    "& svg": { flex: "none", w: "18px", h: "18px", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" },
  },
  variants: {
    /** Icon only, centred: used when the sidebar is collapsed on desktop. */
    iconOnly: { true: { justifyContent: { md: "center" }, p: { md: "8px" } } },
  },
});

/** Breadcrumb trail; give it TextButtons and plain spans separated by <Sep />. */
export function Crumbs(props: BoxProps) {
  return <Box as="nav" display="flex" flexWrap="wrap" gap="6px" alignItems="center" fontSize="13px" {...props} />;
}

export const TextButton = chakra("button", {
  base: {
    border: "0",
    bg: "none",
    color: "accent",
    p: "0",
    cursor: "pointer",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
  },
});

export const Sep = () => <Muted>/</Muted>;

/** Thin horizontal bar; `value` is a percentage. */
export function Bar({ value, color = "var(--gc)", h = "10px", ...props }: BoxProps & { value: number; color?: string }) {
  return (
    <Box h={h} bg="accent.soft" rounded="full" overflow="hidden" {...props}>
      <Box h="full" rounded="full" bg={color} width={`${value}%`} transition="width .3s" />
    </Box>
  );
}

/** Highlighted call-to-action strip, e.g. "continue where you stopped". */
export function Callout(props: BoxProps) {
  return (
    <Box
      display="flex"
      flexWrap="wrap"
      alignItems="center"
      justifyContent="space-between"
      gap="12px"
      bg="accent.soft"
      rounded="16px"
      px="18px"
      py="16px"
      {...props}
    />
  );
}

export function Notice(props: TextProps) {
  return <Text fontSize="13px" px="12px" py="10px" rounded="10px" bg="accent.soft" {...props} />;
}

export function Empty(props: BoxProps) {
  return (
    <Grid
      bg="surface"
      borderWidth="1px"
      borderStyle="dashed"
      borderColor="line"
      rounded="14px"
      p="24px"
      textAlign="center"
      gap="8px"
      justifyItems="center"
      {...props}
    />
  );
}

export function ErrorText(props: TextProps) {
  return <Text color="bad" fontSize="13px" {...props} />;
}

/** One labelled bar row: name, bar, number. Used for topic and skill averages. */
export function BarRow({ label, title, value, color, num }: { label: React.ReactNode; title?: string; value: number; color?: string; num: React.ReactNode }) {
  return (
    <Grid templateColumns={{ base: "minmax(0, 1fr) 70px 44px", sm: "minmax(0, 220px) 1fr 52px" }} gap="10px" alignItems="center" fontSize="13px">
      <Text as="span" title={title} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
        {label}
      </Text>
      <Bar value={value} color={color} />
      <Text as="span" textAlign="right" fontVariantNumeric="tabular-nums">
        {num}
      </Text>
    </Grid>
  );
}
