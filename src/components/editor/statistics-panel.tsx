"use client";

import { useMemo } from "react";
import { useJsonStore } from "@/store/json-store";
import { calculateStats } from "@/lib/json-utils";
import { formatBytes, formatNumber } from "@/lib/utils";
import {
  Braces,
  Brackets,
  Hash,
  Type,
  Binary,
  CircleOff,
  Layers,
  GitFork,
  FileText,
} from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
      <div className={`p-2 rounded-md ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{value}</p>
      </div>
    </div>
  );
}

export function StatisticsPanel() {
  const { parsedJson, jsonContent } = useJsonStore();

  const stats = useMemo(() => {
    if (parsedJson === null) return null;
    const s = calculateStats(parsedJson);
    s.fileSize = new Blob([jsonContent]).size;
    return s;
  }, [parsedJson, jsonContent]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400 p-6">
        <p className="text-sm">Enter valid JSON to see statistics</p>
      </div>
    );
  }

  return (
    <div className="p-4 grid grid-cols-2 gap-2">
      <StatCard label="File Size" value={formatBytes(stats.fileSize)} icon={<FileText className="h-4 w-4 text-blue-500" />} color="bg-blue-100 dark:bg-blue-900/30" />
      <StatCard label="Total Nodes" value={formatNumber(stats.totalNodes)} icon={<Layers className="h-4 w-4 text-purple-500" />} color="bg-purple-100 dark:bg-purple-900/30" />
      <StatCard label="Max Depth" value={String(stats.maxDepth)} icon={<GitFork className="h-4 w-4 text-orange-500" />} color="bg-orange-100 dark:bg-orange-900/30" />
      <StatCard label="Objects" value={formatNumber(stats.objectCount)} icon={<Braces className="h-4 w-4 text-cyan-500" />} color="bg-cyan-100 dark:bg-cyan-900/30" />
      <StatCard label="Arrays" value={formatNumber(stats.arrayCount)} icon={<Brackets className="h-4 w-4 text-emerald-500" />} color="bg-emerald-100 dark:bg-emerald-900/30" />
      <StatCard label="Keys" value={formatNumber(stats.keyCount)} icon={<Hash className="h-4 w-4 text-amber-500" />} color="bg-amber-100 dark:bg-amber-900/30" />
      <StatCard label="Strings" value={formatNumber(stats.stringCount)} icon={<Type className="h-4 w-4 text-pink-500" />} color="bg-pink-100 dark:bg-pink-900/30" />
      <StatCard label="Numbers" value={formatNumber(stats.numberCount)} icon={<Hash className="h-4 w-4 text-indigo-500" />} color="bg-indigo-100 dark:bg-indigo-900/30" />
      <StatCard label="Booleans" value={formatNumber(stats.booleanCount)} icon={<Binary className="h-4 w-4 text-teal-500" />} color="bg-teal-100 dark:bg-teal-900/30" />
      <StatCard label="Nulls" value={formatNumber(stats.nullCount)} icon={<CircleOff className="h-4 w-4 text-zinc-500" />} color="bg-zinc-100 dark:bg-zinc-800" />
    </div>
  );
}
