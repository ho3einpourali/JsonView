"use client";

import { useState, useCallback, useEffect } from "react";
import { useJsonStore, type ViewMode } from "@/store/json-store";
import { parseJsonSafe, generateSampleJson } from "@/lib/json-utils";
import { Header } from "@/components/layout/header";
import { Sidebar, type SidebarPanel } from "@/components/layout/sidebar";
import { CommandPalette } from "@/components/layout/command-palette";
import { JsonEditor } from "@/components/editor/json-editor";
import { TreeViewer } from "@/components/editor/tree-viewer";
import { SearchPanel } from "@/components/editor/search-panel";
import { PathFinder } from "@/components/editor/path-finder";
import { ValidationPanel } from "@/components/editor/validation-panel";
import { StatisticsPanel } from "@/components/editor/statistics-panel";
import { DiffViewer } from "@/components/editor/diff-viewer";
import { SchemaViewer } from "@/components/editor/schema-viewer";
import { FormatConverter } from "@/components/editor/format-converter";
import { ExportPanel } from "@/components/editor/export-panel";
import { UrlImport } from "@/components/editor/url-import";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function EditorPage() {
  const {
    jsonContent,
    setJsonContent,
    setParsedJson,
    setParseError,
    viewMode,
    setViewMode,
  } = useJsonStore();
  const [activePanel, setActivePanel] = useState<SidebarPanel>("editor");

  useEffect(() => {
    if (!jsonContent) {
      setParsedJson(null);
      setParseError(null);
      return;
    }
    const result = parseJsonSafe(jsonContent);
    if (result.error) {
      setParsedJson(null);
      setParseError(result.error);
    } else {
      setParsedJson(result.data);
      setParseError(null);
    }
  }, [jsonContent, setParsedJson, setParseError]);

  const handlePanelChange = useCallback(
    (panel: SidebarPanel, mode?: "raw" | "tree" | "split") => {
      setActivePanel(panel);
      if (mode) setViewMode(mode);
      else if (panel === "editor") setViewMode("raw");
      else if (panel === "tree") setViewMode("tree");
      else if (["search", "path", "validation", "statistics"].includes(panel)) setViewMode("raw");
    },
    [setViewMode]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const text = ev.target?.result as string;
          setJsonContent(text);
        };
        reader.readAsText(file);
      }
    },
    [setJsonContent]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const renderMainPanel = () => {
    switch (activePanel) {
      case "search":
        return <SearchPanel />;
      case "path":
        return <PathFinder />;
      case "validation":
        return <ValidationPanel />;
      case "statistics":
        return <StatisticsPanel />;
      case "diff":
        return <DiffViewer />;
      case "schema":
        return <SchemaViewer />;
      case "converter":
        return <FormatConverter />;
      case "export":
        return <ExportPanel />;
      case "url":
        return <UrlImport />;
      default:
        return null;
    }
  };

  const renderEditorArea = () => {
    const mainPanel = renderMainPanel();
    const showEditor = activePanel === "editor" || activePanel === "tree" || activePanel === "validation" || activePanel === "statistics" || activePanel === "path" || activePanel === "search";

    if (activePanel === "diff" || activePanel === "schema" || activePanel === "converter" || activePanel === "export" || activePanel === "url") {
      return (
        <div className="flex-1 min-h-0 overflow-hidden">
          {mainPanel}
        </div>
      );
    }

    if (viewMode === "split") {
      return (
        <div className="flex-1 flex min-h-0 overflow-hidden">
          <div className="flex-1 min-w-0 border-r border-zinc-200 dark:border-zinc-800">
            <JsonEditor />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <TreeViewer />
          </div>
        </div>
      );
    }

    if (viewMode === "tree") {
      return (
        <div className="flex-1 min-h-0 overflow-hidden">
          <TreeViewer />
        </div>
      );
    }

    return (
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="flex-1 min-w-0">
          <JsonEditor />
        </div>
        {mainPanel && activePanel !== "editor" && (
          <div className="w-[320px] border-l border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {mainPanel}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="flex flex-col h-screen bg-white dark:bg-zinc-950"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Header activePanel={activePanel} onPanelChange={handlePanelChange} />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar activePanel={activePanel} onPanelChange={handlePanelChange} />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {renderEditorArea()}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
