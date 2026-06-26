"use client";

import { useJsonStore } from "@/store/json-store";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function ValidationPanel() {
  const { parseError, jsonContent } = useJsonStore();

  if (!jsonContent) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-3 p-6">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        <p className="text-sm">Paste or type JSON to validate</p>
      </div>
    );
  }

  if (parseError) {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              {parseError.message}
            </p>
            <div className="flex gap-3 text-xs text-red-600 dark:text-red-400">
              <span>Line {parseError.line}</span>
              <span>Column {parseError.column}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-3 p-6">
      <CheckCircle2 className="h-10 w-10 text-emerald-500" />
      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Valid JSON</p>
      <p className="text-xs text-zinc-500">No errors found</p>
    </div>
  );
}
