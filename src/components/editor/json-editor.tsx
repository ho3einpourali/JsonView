"use client";

import { useRef, useCallback, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useJsonStore } from "@/store/json-store";
import { parseJsonSafe, formatJson, minifyJson } from "@/lib/json-utils";
import { copyToClipboard } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import {
  Braces,
  Minimize2,
  Copy,
  Download,
  Upload,
  Undo2,
  Redo2,
  WrapText,
  Map,
  ClipboardPaste,
} from "lucide-react";
import type { OnMount, OnChange } from "@monaco-editor/react";

export function JsonEditor() {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const {
    jsonContent,
    setJsonContent,
    setParsedJson,
    setParseError,
    pushHistory,
    undo,
    redo,
    showMinimap,
    wordWrap,
    toggleMinimap,
    toggleWordWrap,
  } = useJsonStore();

  const handleEditorMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;

      monaco.editor.defineTheme("jsonview-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#09090b",
          "editor.foreground": "#fafafa",
          "editorLineNumber.foreground": "#52525b",
          "editorLineNumber.activeForeground": "#a1a1aa",
          "editor.lineHighlightBackground": "#18181b",
          "editor.selectionBackground": "#27272a",
          "editorCursor.foreground": "#d4d4d8",
        },
      });

      monaco.editor.defineTheme("jsonview-light", {
        base: "vs",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#ffffff",
          "editor.foreground": "#09090b",
          "editorLineNumber.foreground": "#a1a1aa",
          "editorLineNumber.activeForeground": "#52525b",
          "editor.lineHighlightBackground": "#f4f4f5",
          "editor.selectionBackground": "#e4e4e7",
        },
      });

      const isDark = document.documentElement.classList.contains("dark");
      monaco.editor.setTheme(isDark ? "jsonview-dark" : "jsonview-light");

      editor.updateOptions({
        fontSize: 14,
        fontFamily: "var(--font-geist-mono), monospace",
        lineNumbers: "on",
        minimap: { enabled: showMinimap },
        wordWrap: wordWrap ? "on" : "off",
        tabSize: 2,
        bracketPairColorization: { enabled: true },
        guides: { bracketPairs: true, indentation: true },
        scrollBeyondLastLine: false,
        renderLineHighlight: "all",
        smoothScrolling: true,
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        padding: { top: 12, bottom: 12 },
        automaticLayout: true,
      });

      editor.focus();
    },
    [showMinimap, wordWrap]
  );

  const handleChange: OnChange = useCallback(
    (value) => {
      const content = value || "";
      setJsonContent(content);
      const result = parseJsonSafe(content);
      if (result.error) {
        setParsedJson(null);
        setParseError(result.error);
      } else {
        setParsedJson(result.data);
        setParseError(null);
      }
    },
    [setJsonContent, setParsedJson, setParseError]
  );

  useEffect(() => {
    if (editorRef.current) {
      const isDark = document.documentElement.classList.contains("dark");
      const monaco = editorRef.current.getModel();
      if (monaco) {
        editorRef.current.updateOptions({
          minimap: { enabled: showMinimap },
          wordWrap: wordWrap ? "on" : "off",
        });
      }
    }
  }, [showMinimap, wordWrap]);

  const handleFormat = useCallback(() => {
    const result = parseJsonSafe(jsonContent);
    if (result.data !== null) {
      const formatted = formatJson(result.data);
      setJsonContent(formatted);
      pushHistory(formatted);
      if (editorRef.current) {
        editorRef.current.setValue(formatted);
      }
    }
  }, [jsonContent, setJsonContent, pushHistory]);

  const handleMinify = useCallback(() => {
    const result = parseJsonSafe(jsonContent);
    if (result.data !== null) {
      const minified = minifyJson(result.data);
      setJsonContent(minified);
      pushHistory(minified);
      if (editorRef.current) {
        editorRef.current.setValue(minified);
      }
    }
  }, [jsonContent, setJsonContent, pushHistory]);

  const handleCopy = useCallback(() => {
    copyToClipboard(jsonContent);
  }, [jsonContent]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonContent(text);
      if (editorRef.current) {
        editorRef.current.setValue(text);
      }
    } catch {}
  }, [setJsonContent]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [jsonContent]);

  const handleFileOpen = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.txt,.jsonc";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const text = ev.target?.result as string;
          setJsonContent(text);
          if (editorRef.current) {
            editorRef.current.setValue(text);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [setJsonContent]);

  const handleUndo = useCallback(() => {
    const content = undo();
    if (content !== null && editorRef.current) {
      editorRef.current.setValue(content);
      setJsonContent(content);
    }
  }, [undo, setJsonContent]);

  const handleRedo = useCallback(() => {
    const content = redo();
    if (content !== null && editorRef.current) {
      editorRef.current.setValue(content);
      setJsonContent(content);
    }
  }, [redo, setJsonContent]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 px-2 py-1 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        <Tooltip content="Format (Ctrl+Shift+F)">
          <Button variant="ghost" size="icon" onClick={handleFormat} className="h-7 w-7">
            <Braces className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
        <Tooltip content="Minify">
          <Button variant="ghost" size="icon" onClick={handleMinify} className="h-7 w-7">
            <Minimize2 className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />
        <Tooltip content="Copy">
          <Button variant="ghost" size="icon" onClick={handleCopy} className="h-7 w-7">
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
        <Tooltip content="Paste">
          <Button variant="ghost" size="icon" onClick={handlePaste} className="h-7 w-7">
            <ClipboardPaste className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />
        <Tooltip content="Open File">
          <Button variant="ghost" size="icon" onClick={handleFileOpen} className="h-7 w-7">
            <Upload className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
        <Tooltip content="Download">
          <Button variant="ghost" size="icon" onClick={handleDownload} className="h-7 w-7">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />
        <Tooltip content="Undo">
          <Button variant="ghost" size="icon" onClick={handleUndo} className="h-7 w-7">
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
        <Tooltip content="Redo">
          <Button variant="ghost" size="icon" onClick={handleRedo} className="h-7 w-7">
            <Redo2 className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
        <div className="flex-1" />
        <Tooltip content="Toggle Word Wrap">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleWordWrap}
            className={`h-7 w-7 ${wordWrap ? "text-blue-500" : ""}`}
          >
            <WrapText className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
        <Tooltip content="Toggle Minimap">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMinimap}
            className={`h-7 w-7 ${showMinimap ? "text-blue-500" : ""}`}
          >
            <Map className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          defaultLanguage="json"
          value={jsonContent}
          onChange={handleChange}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "var(--font-geist-mono), monospace",
            lineNumbers: "on",
            minimap: { enabled: showMinimap },
            wordWrap: wordWrap ? "on" : "off",
            tabSize: 2,
            bracketPairColorization: { enabled: true },
            scrollBeyondLastLine: false,
            renderLineHighlight: "all",
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            padding: { top: 12, bottom: 12 },
            automaticLayout: true,
          }}
          loading={
            <div className="flex items-center justify-center h-full bg-zinc-950 text-zinc-400">
              <div className="flex flex-col items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-200" />
                <span className="text-sm">Loading editor...</span>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
