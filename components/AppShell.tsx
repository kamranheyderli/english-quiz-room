"use client";

import { Box, Grid } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

const KEY = "eq-sidebar-collapsed";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  // Animate only user toggles, not restoring the saved state on load.
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(KEY) === "1");
    } catch {}
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function toggle() {
    setCollapsed((c) => {
      try {
        localStorage.setItem(KEY, c ? "0" : "1");
      } catch {}
      return !c;
    });
  }

  return (
    <Grid
      templateColumns={{ base: "minmax(0, 1fr)", md: `${collapsed ? "76px" : "260px"} minmax(0, 1fr)` }}
      templateRows={{ base: "auto 1fr", md: "none" }}
      transition={animate ? "grid-template-columns .2s ease" : undefined}
      minH="100vh"
    >
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <Box as="main" minW="0" w="full" maxW="900px" px={{ base: "16px", md: "32px" }} pt={{ base: "20px", md: "32px" }} pb={{ base: "56px", md: "64px" }}>
        {children}
      </Box>
    </Grid>
  );
}
