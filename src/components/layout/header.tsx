"use client";

import { useRouter } from "next/navigation";
import { useJsonStore } from "@/store/json-store";
import { useThemeStore } from "@/store/theme-store";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import {
  Code,
  TreePine,
  ArrowLeftRight,
  Moon,
  Sun,
  Monitor,
  Keyboard,
  Home,
} from "lucide-react";
import type { SidebarPanel } from "@/components/layout/sidebar";

interface HeaderProps {
  activePanel: SidebarPanel;
  onPanelChange: (panel: SidebarPanel, mode?: "raw" | "tree" | "split") => void;
}

export function Header({ activePanel, onPanelChange }: HeaderProps) {
  const router = useRouter();
  const { viewMode, parseError, parsedJson } = useJsonStore();
  const { theme, setTheme } = useThemeStore();

  const cycleTheme = () => {
    const next = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
    setTheme(next);
  };

  return (
    <header className="flex items-center h-12 px-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-2.5">
        <Logo size={28} />
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          JsonView
        </span>
        <span className="text-[10px] font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full">
          v1.0
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
          <Tooltip content="Raw Editor">
            <button
              onClick={() => onPanelChange("editor")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer",
                viewMode === "raw" && activePanel === "editor"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              )}
            >
              <Code className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Editor</span>
            </button>
          </Tooltip>
          <Tooltip content="Tree View">
            <button
              onClick={() => onPanelChange("tree")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer",
                viewMode === "tree" && activePanel === "tree"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              )}
            >
              <TreePine className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tree</span>
            </button>
          </Tooltip>
          <Tooltip content="Split View">
            <button
              onClick={() => onPanelChange("editor", "split")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer",
                viewMode === "split"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              )}
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {parseError && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs mr-2">
            <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Error
          </div>
        )}
        {parsedJson !== null && !parseError && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs mr-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Valid
          </div>
        )}

        <Tooltip content={`Cmd/Ctrl+K for command palette`}>
          <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex" onClick={() => {
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
          }}>
            <Keyboard className="h-4 w-4" />
          </Button>
        </Tooltip>

        <Tooltip content={`Theme: ${theme}`}>
          <Button variant="ghost" size="icon" onClick={cycleTheme} className="h-8 w-8">
            {theme === "dark" ? (
              <Moon className="h-4 w-4" />
            ) : theme === "light" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Monitor className="h-4 w-4" />
            )}
          </Button>
        </Tooltip>

        <Tooltip content="Home">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="h-8 w-8">
            <Home className="h-4 w-4" />
          </Button>
        </Tooltip>
      </div>
    </header>
  );
}
