import { create } from "zustand";

export type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "dark",
  resolvedTheme: "dark",
  setTheme: (theme) => {
    const resolved = theme === "system" ? getSystemTheme() : theme;
    set({ theme, resolvedTheme: resolved });
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(resolved);
      localStorage.setItem("jsonview-theme", theme);
    }
  },
}));

if (typeof window !== "undefined") {
  const saved = localStorage.getItem("jsonview-theme") as Theme | null;
  const theme = saved || "dark";
  const resolved = theme === "system" ? getSystemTheme() : theme;
  useThemeStore.setState({ theme, resolvedTheme: resolved });
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(resolved);
}
