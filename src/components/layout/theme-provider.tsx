"use client";

import { useEffect, type ReactNode } from "react";
import { useThemeStore } from "@/store/theme-store";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    const saved = localStorage.getItem("jsonview-theme") as "light" | "dark" | "system" | null;
    if (saved) {
      setTheme(saved);
    } else {
      setTheme("system");
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (useThemeStore.getState().theme === "system") {
        setTheme("system");
      }
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [setTheme]);

  return <>{children}</>;
}
