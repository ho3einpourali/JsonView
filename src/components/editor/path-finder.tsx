"use client";

import { useState, useCallback } from "react";
import { useJsonStore } from "@/store/json-store";
import { resolveJsonPath } from "@/lib/json-utils";
import { copyToClipboard, cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Copy, ArrowRight, Star, StarOff } from "lucide-react";

export function PathFinder() {
  const { parsedJson, pinnedPaths, togglePinPath } = useJsonStore();
  const [path, setPath] = useState("$");
  const [result, setResult] = useState<{ value: unknown; path: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResolve = useCallback(() => {
    if (parsedJson === null) {
      setError("No JSON loaded");
      return;
    }
    try {
      const value = resolveJsonPath(parsedJson, path);
      if (value === undefined) {
        setError("Path not found");
        setResult(null);
      } else {
        setResult({ value, path });
        setError(null);
      }
    } catch {
      setError("Invalid path");
      setResult(null);
    }
  }, [parsedJson, path]);

  const copyPath = useCallback(() => {
    copyToClipboard(path);
  }, [path]);

  const copyValue = useCallback(() => {
    if (result) {
      copyToClipboard(typeof result.value === "string" ? result.value : JSON.stringify(result.value, null, 2));
    }
  }, [result]);

  const formatValue = (value: unknown): string => {
    if (value === null) return "null";
    if (typeof value === "string") return `"${value}"`;
    return JSON.stringify(value, null, 2);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <Input
              placeholder="$.path.to.value"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleResolve()}
              className="pl-8 h-8 text-xs font-mono"
            />
          </div>
          <Button size="sm" onClick={handleResolve} className="h-8">
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={copyPath} className="h-8 w-8">
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {error && (
          <div className="p-4 text-center text-sm text-red-500">{error}</div>
        )}

        {result && (
          <div className="p-3 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Path:</span>
              <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono">
                {result.path}
              </code>
              <div className="flex-1" />
              <button
                onClick={() => togglePinPath(result.path)}
                className={cn(
                  "p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700",
                  pinnedPaths.includes(result.path) && "text-amber-500"
                )}
              >
                {pinnedPaths.includes(result.path) ? (
                  <StarOff className="h-3.5 w-3.5" />
                ) : (
                  <Star className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-xs text-zinc-500">Value</span>
                <Button variant="ghost" size="sm" onClick={copyValue} className="h-6 text-xs">
                  <Copy className="h-3 w-3 mr-1" /> Copy
                </Button>
              </div>
              <pre className="p-3 text-xs font-mono overflow-auto max-h-[300px] text-zinc-700 dark:text-zinc-300">
                {formatValue(result.value)}
              </pre>
            </div>
          </div>
        )}

        {pinnedPaths.length > 0 && !result && (
          <div className="p-3">
            <h4 className="text-xs font-medium text-zinc-500 mb-2">Pinned Paths</h4>
            <div className="space-y-1">
              {pinnedPaths.map((p) => (
                <button
                  key={p}
                  onClick={() => { setPath(p); }}
                  className="flex items-center gap-2 w-full p-2 rounded-md text-xs font-mono hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-left"
                >
                  <Star className="h-3 w-3 text-amber-500 shrink-0" />
                  <span className="truncate">{p}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
