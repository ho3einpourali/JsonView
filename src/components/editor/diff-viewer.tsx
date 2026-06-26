"use client";

import { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { parseJsonSafe, formatJson } from "@/lib/json-utils";
import { useJsonStore } from "@/store/json-store";
import { cn } from "@/lib/utils";
import { ArrowLeftRight, Plus, Minus } from "lucide-react";

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  leftNum: number;
  rightNum: number;
  left?: string;
  right?: string;
}

function buildLCS(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0)
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp;
}

function buildDiff(dp: number[][], a: string[], b: string[]): DiffLine[] {
  const lines: DiffLine[] = [];
  let i = a.length;
  let j = b.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      lines.unshift({
        type: "unchanged",
        leftNum: i,
        rightNum: j,
        left: a[i - 1],
        right: b[j - 1],
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      lines.unshift({ type: "added", leftNum: 0, rightNum: j, right: b[j - 1] });
      j--;
    } else {
      lines.unshift({ type: "removed", leftNum: i, rightNum: 0, left: a[i - 1] });
      i--;
    }
  }
  return lines;
}

function runDiff(leftJson: string, rightJson: string): { diff: DiffLine[]; error: string | null } {
  const leftResult = parseJsonSafe(leftJson);
  const rightResult = parseJsonSafe(rightJson);

  if (leftResult.error) return { diff: [], error: `Left JSON: ${leftResult.error.message}` };
  if (rightResult.error) return { diff: [], error: `Right JSON: ${rightResult.error.message}` };

  const leftLines = formatJson(leftResult.data).split("\n");
  const rightLines = formatJson(rightResult.data).split("\n");
  const dp = buildLCS(leftLines, rightLines);
  return { diff: buildDiff(dp, leftLines, rightLines), error: null };
}

export function DiffViewer() {
  const { jsonContent } = useJsonStore();
  const leftRef = useRef<HTMLTextAreaElement>(null);
  const rightRef = useRef<HTMLTextAreaElement>(null);
  const [diff, setDiff] = useState<DiffLine[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = () => {
    const left = leftRef.current?.value ?? "";
    const right = rightRef.current?.value ?? "";
    if (!left.trim() || !right.trim()) return;
    const result = runDiff(left, right);
    setDiff(result.diff);
    setError(result.error);
  };

  const stats = useMemo(() => {
    if (!diff) return { added: 0, removed: 0, unchanged: 0 };
    return {
      added: diff.filter((d) => d.type === "added").length,
      removed: diff.filter((d) => d.type === "removed").length,
      unchanged: diff.filter((d) => d.type === "unchanged").length,
    };
  }, [diff]);

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-2 gap-2 p-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Left (Original)</label>
          <textarea
            ref={leftRef}
            defaultValue={jsonContent}
            placeholder="Paste original JSON..."
            className="w-full h-32 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Right (Modified)</label>
          <textarea
            ref={rightRef}
            placeholder="Paste modified JSON..."
            className="w-full h-32 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 px-2 py-1.5 border-b border-zinc-200 dark:border-zinc-800">
        <Button size="sm" onClick={handleCompare}>
          <ArrowLeftRight className="h-3.5 w-3.5 mr-1" /> Compare
        </Button>
        {diff && !error && (
          <div className="flex items-center gap-3 text-xs ml-2">
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Plus className="h-3 w-3" /> {stats.added} added
            </span>
            <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
              <Minus className="h-3 w-3" /> {stats.removed} removed
            </span>
            <span className="text-zinc-500">{stats.unchanged} unchanged</span>
          </div>
        )}
      </div>

      {error && (
        <div className="px-3 py-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border-b border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <ScrollArea className="flex-1">
        {diff ? (
          <div className="font-mono text-xs">
            {diff.map((line, i) => (
              <div
                key={i}
                className={cn(
                  "flex border-b border-zinc-100 dark:border-zinc-800/50",
                  line.type === "added" && "bg-emerald-50 dark:bg-emerald-900/10",
                  line.type === "removed" && "bg-red-50 dark:bg-red-900/10"
                )}
              >
                <span className="w-10 text-right pr-1 py-0.5 text-zinc-400 shrink-0 select-none">
                  {line.leftNum || ""}
                </span>
                <span className="w-10 text-right pr-1 py-0.5 text-zinc-400 shrink-0 select-none">
                  {line.rightNum || ""}
                </span>
                <span className="w-5 text-center py-0.5 shrink-0 select-none">
                  {line.type === "added" && <Plus className="h-3 w-3 text-emerald-500 inline" />}
                  {line.type === "removed" && <Minus className="h-3 w-3 text-red-500 inline" />}
                </span>
                <span
                  className={cn(
                    "flex-1 py-0.5 px-2 overflow-x-auto whitespace-pre border-r border-zinc-200 dark:border-zinc-700",
                    line.type === "removed" ? "text-red-700 dark:text-red-300" : "text-zinc-700 dark:text-zinc-300"
                  )}
                >
                  {line.left ?? ""}
                </span>
                <span
                  className={cn(
                    "flex-1 py-0.5 px-2 overflow-x-auto whitespace-pre",
                    line.type === "added" ? "text-emerald-700 dark:text-emerald-300" : "text-zinc-700 dark:text-zinc-300"
                  )}
                >
                  {line.right ?? ""}
                </span>
              </div>
            ))}
            {stats.added === 0 && stats.removed === 0 && (
              <div className="flex items-center justify-center py-8 text-zinc-400">
                <p className="text-sm">Both inputs are identical</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-400 p-6">
            <p className="text-sm">Paste JSON on both sides, then click Compare</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
