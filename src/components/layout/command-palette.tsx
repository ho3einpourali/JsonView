"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useJsonStore } from "@/store/json-store";
import { useThemeStore } from "@/store/theme-store";
import { parseJsonSafe, formatJson, minifyJson, generateSampleJson } from "@/lib/json-utils";
import { copyToClipboard } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Search,
  Braces,
  Minimize2,
  Copy,
  Download,
  Upload,
  Undo2,
  Redo2,
  TreePine,
  FileText,
  BarChart3,
  ArrowLeftRight,
  FileCode,
  Moon,
  Sun,
  Monitor,
  ClipboardPaste,
  Trash2,
} from "lucide-react";

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const {
    jsonContent,
    setJsonContent,
    setViewMode,
    viewMode,
    undo,
    redo,
    toggleMinimap,
    toggleWordWrap,
  } = useJsonStore();
  const { setTheme } = useThemeStore();

  const commands: Command[] = useMemo(
    () => [
      {
        id: "format",
        label: "Format JSON",
        shortcut: "Ctrl+Shift+F",
        icon: <Braces className="h-4 w-4" />,
        action: () => {
          const result = parseJsonSafe(jsonContent);
          if (result.data !== null) {
            const formatted = formatJson(result.data);
            setJsonContent(formatted);
          }
        },
        category: "Edit",
      },
      {
        id: "minify",
        label: "Minify JSON",
        icon: <Minimize2 className="h-4 w-4" />,
        action: () => {
          const result = parseJsonSafe(jsonContent);
          if (result.data !== null) {
            setJsonContent(minifyJson(result.data));
          }
        },
        category: "Edit",
      },
      {
        id: "copy",
        label: "Copy JSON",
        shortcut: "Ctrl+C",
        icon: <Copy className="h-4 w-4" />,
        action: () => copyToClipboard(jsonContent),
        category: "Edit",
      },
      {
        id: "paste",
        label: "Paste JSON",
        shortcut: "Ctrl+V",
        icon: <ClipboardPaste className="h-4 w-4" />,
        action: async () => {
          try {
            const text = await navigator.clipboard.readText();
            setJsonContent(text);
          } catch {}
        },
        category: "Edit",
      },
      {
        id: "download",
        label: "Download JSON",
        icon: <Download className="h-4 w-4" />,
        action: () => {
          const blob = new Blob([jsonContent], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "formatted.json";
          a.click();
          URL.revokeObjectURL(url);
        },
        category: "File",
      },
      {
        id: "open",
        label: "Open File",
        icon: <Upload className="h-4 w-4" />,
        action: () => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".json,.txt,.jsonc";
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (ev) => setJsonContent(ev.target?.result as string);
              reader.readAsText(file);
            }
          };
          input.click();
        },
        category: "File",
      },
      {
        id: "undo",
        label: "Undo",
        shortcut: "Ctrl+Z",
        icon: <Undo2 className="h-4 w-4" />,
        action: () => {
          const content = undo();
          if (content !== null) setJsonContent(content);
        },
        category: "Edit",
      },
      {
        id: "redo",
        label: "Redo",
        shortcut: "Ctrl+Shift+Z",
        icon: <Redo2 className="h-4 w-4" />,
        action: () => {
          const content = redo();
          if (content !== null) setJsonContent(content);
        },
        category: "Edit",
      },
      {
        id: "view-raw",
        label: "View: Raw Editor",
        icon: <FileText className="h-4 w-4" />,
        action: () => setViewMode("raw"),
        category: "View",
      },
      {
        id: "view-tree",
        label: "View: Tree Viewer",
        icon: <TreePine className="h-4 w-4" />,
        action: () => setViewMode("tree"),
        category: "View",
      },
      {
        id: "view-split",
        label: "View: Split View",
        icon: <ArrowLeftRight className="h-4 w-4" />,
        action: () => setViewMode("split"),
        category: "View",
      },
      {
        id: "minimap",
        label: "Toggle Minimap",
        icon: <FileCode className="h-4 w-4" />,
        action: toggleMinimap,
        category: "View",
      },
      {
        id: "wordwrap",
        label: "Toggle Word Wrap",
        icon: <FileText className="h-4 w-4" />,
        action: toggleWordWrap,
        category: "View",
      },
      {
        id: "theme-dark",
        label: "Theme: Dark",
        icon: <Moon className="h-4 w-4" />,
        action: () => setTheme("dark"),
        category: "Theme",
      },
      {
        id: "theme-light",
        label: "Theme: Light",
        icon: <Sun className="h-4 w-4" />,
        action: () => setTheme("light"),
        category: "Theme",
      },
      {
        id: "theme-system",
        label: "Theme: System",
        icon: <Monitor className="h-4 w-4" />,
        action: () => setTheme("system"),
        category: "Theme",
      },
      {
        id: "sample",
        label: "Load Sample JSON",
        icon: <FileCode className="h-4 w-4" />,
        action: () => setJsonContent(generateSampleJson()),
        category: "File",
      },
      {
        id: "clear",
        label: "Clear Editor",
        icon: <Trash2 className="h-4 w-4" />,
        action: () => setJsonContent(""),
        category: "Edit",
      },
    ],
    [jsonContent, setJsonContent, setViewMode, undo, redo, toggleMinimap, toggleWordWrap, setTheme]
  );

  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(query.toLowerCase()) ||
        cmd.category.toLowerCase().includes(query.toLowerCase())
    );
  }, [commands, query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (listRef.current) {
      const item = listRef.current.children[selectedIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        filteredCommands[selectedIndex]?.action();
        setOpen(false);
      }
    },
    [filteredCommands, selectedIndex]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 px-4">
          <Search className="h-4 w-4 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            className="flex-1 bg-transparent border-0 py-3 px-3 text-sm outline-none placeholder:text-zinc-400"
          />
          <kbd className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">ESC</kbd>
        </div>
        <div ref={listRef} className="max-h-[300px] overflow-auto py-1">
          {filteredCommands.length === 0 ? (
            <div className="py-6 text-center text-sm text-zinc-500">No commands found</div>
          ) : (
            filteredCommands.map((cmd, i) => (
              <button
                key={cmd.id}
                onClick={() => {
                  cmd.action();
                  setOpen(false);
                }}
                onMouseEnter={() => setSelectedIndex(i)}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-2 text-sm text-left cursor-pointer",
                  i === selectedIndex
                    ? "bg-zinc-100 dark:bg-zinc-800"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                )}
              >
                <span className="text-zinc-400">{cmd.icon}</span>
                <span className="flex-1">{cmd.label}</span>
                {cmd.shortcut && (
                  <kbd className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                    {cmd.shortcut}
                  </kbd>
                )}
                <span className="text-xs text-zinc-400">{cmd.category}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
