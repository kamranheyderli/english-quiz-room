"use client";

import { Box, chakra, Grid, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  {
    href: "/",
    label: "Şagird",
    hint: "Səviyyələr üzrə testlər",
    icon: (
      <path d="M12 3 2 8l10 5 10-5-10-5Zm-6 7.5V15c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5M22 8v6" />
    ),
  },
  {
    href: "/grammar",
    label: "Qrammatika",
    hint: "Nitq hissələri, dərs-dərs",
    icon: <path d="M4 19.5V5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2Zm0 0A2 2 0 0 0 6 22h13v-4M9 7h6M9 11h4" />,
  },
  {
    href: "/listening",
    label: "Listening",
    hint: "Dinlə, izlə, cavab ver",
    icon: <path d="M3 14v-2a9 9 0 0 1 18 0v2M3 14h3v6H4a1 1 0 0 1-1-1v-5Zm18 0h-3v6h2a1 1 0 0 0 1-1v-5Z" />,
  },
  {
    href: "/teacher",
    label: "Müəllim paneli",
    short: "Müəllim",
    hint: "Nəticələr və analiz",
    icon: <path d="M4 20V10m6 10V4m6 16v-7m4 7H2" />,
  },
];

const Link = chakra(NextLink);

const NavLink = chakra(NextLink, {
  base: {
    display: "flex",
    flex: "none",
    alignItems: "center",
    gap: "12px",
    px: { base: "8px", sm: "10px", md: "12px" },
    py: { base: "8px", md: "10px" },
    fontSize: { base: "14px", sm: "15px" },
    rounded: "12px",
    color: "ink.muted",
    textDecoration: "none",
    fontWeight: "500",
    transition: "background .15s, color .15s",
    _hover: { bg: "page", color: "ink" },
    _currentPage: { bg: "accent.soft", color: "ink", "& svg": { stroke: "accent" } },
    _focusVisible: { outline: "3px solid", outlineColor: "accent", outlineOffset: "2px" },
    "& svg": {
      display: { base: "none", sm: "block" },
      flex: "none",
      w: "20px",
      h: "20px",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.8,
      strokeLinecap: "round",
      strokeLinejoin: "round",
    },
  },
});

/** Round chevron on the sidebar's right border, level with the brand mark. Desktop only. */
const CollapseButton = chakra("button", {
  base: {
    display: { base: "none", md: "grid" },
    placeItems: "center",
    position: "absolute",
    top: "32px",
    right: "-12px",
    zIndex: 1,
    w: "24px",
    h: "24px",
    rounded: "full",
    borderWidth: "1px",
    borderColor: "line",
    bg: "surface",
    color: "ink.muted",
    cursor: "pointer",
    transition: "color .15s, border-color .15s",
    _hover: { color: "ink", borderColor: "ink.muted" },
    _focusVisible: { outline: "3px solid", outlineColor: "accent", outlineOffset: "2px" },
    "& svg": { w: "14px", h: "14px", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" },
  },
});

export default function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const path = usePathname();
  /** Desktop-only value: hidden when the sidebar is collapsed. */
  const wide = (value: string) => (collapsed ? "none" : value);
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <Box
      as="aside"
      position="sticky"
      top={{ base: "env(safe-area-inset-top, 0px)", md: "0" }}
      zIndex={{ base: 10, md: "auto" }}
      h={{ base: "auto", md: "100vh" }}
      minW="0"
      bg="surface"
      borderColor="line"
      borderRightWidth={{ base: "0", md: "1px" }}
      borderBottomWidth={{ base: "1px", md: "0" }}
    >
      <CollapseButton
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Paneli aç" : "Paneli yığ"}
        title={collapsed ? "Paneli aç" : "Paneli yığ"}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d={collapsed ? "m9 18 6-6-6-6" : "m15 18-6-6 6-6"} />
        </svg>
      </CollapseButton>
      {/* Clips the labels while the width animates; the collapse button sits outside it on the border. */}
      <Box
        h="full"
        display="flex"
        flexDirection={{ base: "row", md: "column" }}
        alignItems={{ base: "center", md: "stretch" }}
        justifyContent={{ base: "space-between", md: "flex-start" }}
        gap={{ base: "10px", md: "28px" }}
        minW="0"
        overflow={{ md: "hidden" }}
        px="16px"
        py={{ base: "10px", md: "24px" }}
      >
        <Link
          href="/"
          display={{ base: "none", sm: "flex" }}
          flex="none"
          alignItems="center"
          gap="12px"
          textDecoration="none"
          color="ink"
          justifyContent={{ md: collapsed ? "center" : "flex-start" }}
          px={{ base: "0", md: collapsed ? "0" : "8px" }}
          title={collapsed ? "English Quiz Room" : undefined}
        >
          <Box
            aria-hidden="true"
            flex="none"
            w={{ base: "34px", md: "40px" }}
            h={{ base: "34px", md: "40px" }}
            rounded="12px"
            display="grid"
            placeItems="center"
            bg="ink"
            color="page"
            fontFamily="heading"
            fontWeight="800"
            fontSize={{ base: "15px", md: "18px" }}
          >
            Aa
          </Box>
          <Grid lineHeight="1.25" minW="0" display={{ md: wide("grid") }}>
            <Text as="strong" fontFamily="heading" fontWeight="800" fontSize="17px">
              English Quiz Room
            </Text>
            <Text as="span" display={{ base: "none", md: "inline" }} color="ink.muted" fontSize="13px">
              Pre-A1 – C1
            </Text>
          </Grid>
        </Link>
        <Box
          as="nav"
          aria-label="Bölmələr"
          display={{ base: "flex", md: "grid" }}
          gap="4px"
          flex={{ base: "1", md: "none" }}
          minW="0"
          justifyContent={{ base: "flex-start", sm: "flex-end", md: "normal" }}
          overflowX={{ base: "auto", md: "visible" }}
          scrollbar="hidden"
        >
          {LINKS.map((l) => (
            <NavLink
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              aria-label={collapsed ? l.label : undefined}
              title={collapsed ? l.label : undefined}
              justifyContent={{ md: collapsed ? "center" : "flex-start" }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {l.icon}
              </svg>
              <Grid as="span" lineHeight="1.3" display={{ md: wide("grid") }}>
                <Text as="span" display={l.short ? { base: "none", sm: "inline" } : "inline"}>
                  {l.label}
                </Text>
                {l.short && (
                  <Text as="span" display={{ base: "inline", sm: "none" }}>
                    {l.short}
                  </Text>
                )}
                <Text as="span" display={{ base: "none", md: "inline" }} fontSize="12px" fontWeight="400" color="ink.muted">
                  {l.hint}
                </Text>
              </Grid>
            </NavLink>
          ))}
        </Box>
        <ThemeToggle iconOnly={collapsed} />
        <Text display={{ base: "none", md: wide("block") }} mt="auto" px="8px" color="ink.muted" fontSize="13px">
          İngilis dili · yaş qruplarına və CEFR səviyyələrinə görə testlər
        </Text>
      </Box>
    </Box>
  );
}
