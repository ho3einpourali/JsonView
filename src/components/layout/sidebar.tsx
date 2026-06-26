"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import {
  Code,
  TreePine,
  Search,
  MapPin,
  AlertCircle,
  BarChart3,
  ArrowLeftRight,
  FileCode,
  FileJson,
  Download,
  Globe,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export type SidebarPanel =
  | "editor"
  | "tree"
  | "search"
  | "path"
  | "validation"
  | "statistics"
  | "diff"
  | "schema"
  | "converter"
  | "export"
  | "url";

interface SidebarProps {
  activePanel: SidebarPanel;
  onPanelChange: (panel: SidebarPanel, mode?: "raw" | "tree" | "split") => void;
}

const panels: { id: SidebarPanel; label: string; icon: ReactNode }[] = [
  { id: "editor", label: "Editor", icon: <Code className="h-4 w-4" /> },
  { id: "tree", label: "Tree View", icon: <TreePine className="h-4 w-4" /> },
  { id: "search", label: "Search", icon: <Search className="h-4 w-4" /> },
  { id: "path", label: "Path Finder", icon: <MapPin className="h-4 w-4" /> },
  { id: "validation", label: "Validation", icon: <AlertCircle className="h-4 w-4" /> },
  { id: "statistics", label: "Statistics", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "diff", label: "Diff Viewer", icon: <ArrowLeftRight className="h-4 w-4" /> },
  { id: "schema", label: "Schema", icon: <FileCode className="h-4 w-4" /> },
  { id: "converter", label: "Converter", icon: <FileJson className="h-4 w-4" /> },
  { id: "export", label: "Export", icon: <Download className="h-4 w-4" /> },
  { id: "url", label: "URL Import", icon: <Globe className="h-4 w-4" /> },
];

export function Sidebar({ activePanel, onPanelChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 transition-all duration-200",
        collapsed ? "w-12" : "w-12 lg:w-44"
      )}
    >
      <div className="flex-1 py-2 space-y-0.5">
        {panels.map((panel) => (
          <Tooltip key={panel.id} content={panel.label} side="right">
            <button
              onClick={() => onPanelChange(panel.id)}
              className={cn(
                "flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors cursor-pointer",
                activePanel === panel.id
                  ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
              )}
            >
              {panel.icon}
              <span className={cn("truncate", collapsed ? "hidden" : "hidden lg:inline")}>{panel.label}</span>
            </button>
          </Tooltip>
        ))}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </div>
  );
}
