"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useJsonStore } from "@/store/json-store";
import { useThemeStore } from "@/store/theme-store";
import { generateSampleJson } from "@/lib/json-utils";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Logo } from "@/components/ui/logo";
import {
  Braces,
  ArrowRight,
  Zap,
  Shield,
  Search,
  TreePine,
  BarChart3,
  ArrowLeftRight,
  FileCode,
  ExternalLink,
  Eye,
  Smartphone,
  Keyboard,
  Globe,
  Moon,
  Sun,
  Lock,
  Download,
  Copy,
  Layers,
    GitFork,
} from "lucide-react";

function LandingPage() {
  const router = useRouter();
  const { setJsonContent } = useJsonStore();
  const { theme, setTheme } = useThemeStore();

  const handleOpenJson = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.txt,.jsonc";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setJsonContent(ev.target?.result as string);
          router.push("/editor");
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [setJsonContent, router]);

  const handlePasteJson = useCallback(() => {
    navigator.clipboard.readText().then((text) => {
      setJsonContent(text);
      router.push("/editor");
    }).catch(() => {
      router.push("/editor");
    });
  }, [setJsonContent, router]);

  const handleSample = useCallback(() => {
    setJsonContent(generateSampleJson());
    router.push("/editor");
  }, [setJsonContent, router]);

  const features = [
    { icon: <Braces className="h-5 w-5" />, title: "Monaco Editor", desc: "Full-featured editor with syntax highlighting, folding, and multiple cursors" },
    { icon: <TreePine className="h-5 w-5" />, title: "Tree Viewer", desc: "Interactive tree with expand/collapse, search, and path copying" },
    { icon: <Search className="h-5 w-5" />, title: "Powerful Search", desc: "Search keys, values, regex, case-sensitive, whole word matching" },
    { icon: <GitFork className="h-5 w-5" />, title: "Path Finder", desc: "Click any node to copy JSONPath like $.users[2].email" },
    { icon: <BarChart3 className="h-5 w-5" />, title: "Statistics", desc: "Object count, array count, depth, types, and file size" },
    { icon: <ArrowLeftRight className="h-5 w-5" />, title: "Diff Viewer", desc: "Compare two JSON documents side by side" },
    { icon: <FileCode className="h-5 w-5" />, title: "Schema Support", desc: "Auto-generate JSON Schema and validate against schemas" },
    { icon: <Layers className="h-5 w-5" />, title: "Format Converter", desc: "Convert JSON to YAML, XML, CSV, TOML, Markdown" },
    { icon: <Zap className="h-5 w-5" />, title: "Lightning Fast", desc: "Handles 100MB+ files with virtual rendering" },
    { icon: <Shield className="h-5 w-5" />, title: "Privacy First", desc: "Everything stays in your browser. Nothing is uploaded." },
    { icon: <Smartphone className="h-5 w-5" />, title: "Responsive", desc: "Works beautifully on mobile, tablet, and desktop" },
    { icon: <Keyboard className="h-5 w-5" />, title: "Keyboard Shortcuts", desc: "⌘K command palette and full keyboard navigation" },
    { icon: <Download className="h-5 w-5" />, title: "Export", desc: "Download as JSON, copy to clipboard, or share" },
    { icon: <Moon className="h-5 w-5" />, title: "Dark Mode", desc: "Beautiful dark, light, and system theme support" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">JsonView</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push("/editor")}>
              Open Editor
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="h-8 w-8">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-blue-500/5 to-transparent dark:from-violet-500/10 dark:via-blue-500/10" />
        <div className="relative max-w-4xl mx-auto text-center px-4 pt-20 pb-16 sm:pt-28 sm:pb-24">
          <div className="inline-flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-full px-4 py-1.5 mb-6">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              The fastest JSON tool in your browser
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
            The fastest way to
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              inspect JSON.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
            Format, validate, search, convert, and visualize JSON with a beautiful,
            blazing-fast developer tool. Everything stays in your browser.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={handleOpenJson} className="gap-2 px-6">
              Open JSON <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={handlePasteJson} className="gap-2 px-6">
              Paste JSON
            </Button>
            <Button size="lg" variant="ghost" onClick={handleSample} className="gap-2 px-6">
              Try Sample
            </Button>
          </div>

          <div className="mt-12 mx-auto max-w-3xl rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-hidden shadow-2xl shadow-zinc-200/50 dark:shadow-zinc-900/50">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/50">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <span className="text-xs text-zinc-400 font-mono ml-2">editor.json</span>
            </div>
            <pre className="p-6 text-left text-xs sm:text-sm font-mono text-zinc-700 dark:text-zinc-300 overflow-x-auto">
              <code>{`{
  "name": "JsonView",
  "version": "1.0.0",
  "features": [
    "Monaco Editor",
    "Tree Viewer",
    "Search & Filter",
    "Schema Support"
  ],
  "config": {
    "theme": "dark",
    "autoFormat": true
  }
}`}</code>
            </pre>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
            Everything you need for JSON
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            A complete toolkit for working with JSON. From quick formatting to deep analysis.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="group p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all hover:shadow-lg hover:shadow-zinc-200/20 dark:hover:shadow-zinc-900/20"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  {f.title}
                </h3>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full px-4 py-1.5 mb-6">
            <Lock className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Privacy First</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
            Your data never leaves your browser
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto mb-8">
            JsonView runs entirely in your browser. No data is sent to any server.
            No accounts, no tracking, no nonsense.
          </p>
          <div className="inline-flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> No uploads
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" /> Works offline
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" /> Open source
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 text-center mb-8">
          Keyboard Shortcuts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
          {[
            { keys: "Ctrl + K", action: "Command Palette" },
            { keys: "Ctrl + Shift + F", action: "Format JSON" },
            { keys: "Ctrl + Z", action: "Undo" },
            { keys: "Ctrl + Shift + Z", action: "Redo" },
            { keys: "Ctrl + S", action: "Save / Download" },
            { keys: "Ctrl + C", action: "Copy JSON" },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">{s.action}</span>
              <kbd className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-1 rounded">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <span className="text-sm text-zinc-500">
              JsonView &mdash; The VS Code of JSON
            </span>
          </div>
          <a
            href="https://github.com/ho3einpourali"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span className="text-xs">GitHub</span>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <ThemeProvider>
      <LandingPage />
    </ThemeProvider>
  );
}
