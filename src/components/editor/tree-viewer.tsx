"use client";

import { useState, useCallback, useMemo, memo } from "react";
import { useJsonStore } from "@/store/json-store";
import { cn, copyToClipboard } from "@/lib/utils";
import {
  ChevronRight,
  ChevronDown,
  Braces,
  Brackets,
  Hash,
  Type,
  ToggleLeft,
  CircleOff,
  Copy,
  MapPin,
} from "lucide-react";

interface TreeNodeProps {
  keyName: string | number;
  value: unknown;
  path: string;
  depth: number;
  isLast: boolean;
  searchQuery: string;
  pinnedPaths: string[];
}

function getValueIcon(value: unknown) {
  if (value === null) return <CircleOff className="h-3.5 w-3.5 text-zinc-500" />;
  if (typeof value === "boolean") return <ToggleLeft className="h-3.5 w-3.5 text-teal-500" />;
  if (typeof value === "number") return <Hash className="h-3.5 w-3.5 text-indigo-500" />;
  if (typeof value === "string") return <Type className="h-3.5 w-3.5 text-pink-500" />;
  if (Array.isArray(value)) return <Brackets className="h-3.5 w-3.5 text-emerald-500" />;
  return <Braces className="h-3.5 w-3.5 text-cyan-500" />;
}

function getValueColor(value: unknown) {
  if (value === null) return "text-zinc-500";
  if (typeof value === "boolean") return "text-teal-600 dark:text-teal-400";
  if (typeof value === "number") return "text-indigo-600 dark:text-indigo-400";
  if (typeof value === "string") return "text-pink-600 dark:text-pink-400";
  return "text-zinc-700 dark:text-zinc-300";
}

function matchesSearch(text: string, query: string): boolean {
  if (!query) return true;
  return text.toLowerCase().includes(query.toLowerCase());
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <span className="bg-yellow-200 dark:bg-yellow-800 text-zinc-900 dark:text-yellow-100 rounded px-0.5">
        {text.slice(index, index + query.length)}
      </span>
      {text.slice(index + query.length)}
    </>
  );
}

const TreeNode = memo(function TreeNode({
  keyName,
  value,
  path,
  depth,
  isLast,
  searchQuery,
  pinnedPaths,
}: TreeNodeProps) {
  const { treeExpandedPaths, toggleTreePath, togglePinPath } = useJsonStore();
  const isExpanded = treeExpandedPaths.has(path) || treeExpandedPaths.has("*");
  const isObject = value !== null && typeof value === "object";
  const isArray = Array.isArray(value);
  const isPinned = pinnedPaths.includes(path);

  const toggle = useCallback(() => {
    toggleTreePath(path);
  }, [path, toggleTreePath]);

  const copyPath = useCallback(() => {
    copyToClipboard(path);
  }, [path]);

  const copyValue = useCallback(() => {
    copyToClipboard(typeof value === "string" ? value : JSON.stringify(value, null, 2));
  }, [value]);

  const childEntries = useMemo(() => {
    if (!isObject) return [];
    if (isArray) {
      return value.map((item, i) => ({
        key: i,
        value: item,
        path: `${path}[${i}]`,
      }));
    }
    return Object.entries(value as Record<string, unknown>).map(([k, v]) => ({
      key: k,
      value: v,
      path: `${path}.${k}`,
    }));
  }, [value, isObject, isArray, path]);

  const matches = useMemo(() => {
    const keyStr = String(keyName);
    const valStr = isObject ? "" : String(value);
    return matchesSearch(keyStr, searchQuery) || matchesSearch(valStr, searchQuery);
  }, [keyName, value, isObject, searchQuery]);

  if (searchQuery && !matches && !isObject) {
    return null;
  }

  const expandedCount = isArray ? (value as unknown[]).length : isObject ? Object.keys(value as Record<string, unknown>).length : 0;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1.5 py-0.5 px-1 rounded group hover:bg-zinc-100 dark:hover:bg-zinc-800/50 cursor-pointer select-none",
          !matches && searchQuery && "opacity-30"
        )}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={isObject ? toggle : undefined}
      >
        {isObject ? (
          isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          )
        ) : (
          <span className="w-3.5 shrink-0" />
        )}

        {getValueIcon(value)}

        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {typeof keyName === "number" ? (
            highlightText(String(keyName), searchQuery)
          ) : (
            <>
              {highlightText(String(keyName), searchQuery)}
              <span className="text-zinc-400">:</span>
            </>
          )}
        </span>

        {!isObject && (
          <span className={cn("text-xs truncate max-w-[200px]", getValueColor(value))}>
            {highlightText(
              typeof value === "string" ? `"${value}"` : String(value),
              searchQuery
            )}
          </span>
        )}

        {isObject && (
          <span className="text-xs text-zinc-400">
            {isArray ? "[" : "{"}
            {!isExpanded && `${expandedCount}`}
            {!isExpanded && (isArray ? "]" : "}")}
          </span>
        )}

        <div className="flex-1" />

        <div className="hidden group-hover:flex items-center gap-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); togglePinPath(path); }}
            className={cn("p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700", isPinned && "text-amber-500")}
          >
            <MapPin className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); copyPath(); }}
            className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            <Copy className="h-3 w-3" />
          </button>
        </div>
      </div>

      {isExpanded && isObject && (
        <>
          {childEntries.map((child, i) => (
            <TreeNode
              key={child.key}
              keyName={child.key}
              value={child.value}
              path={child.path}
              depth={depth + 1}
              isLast={i === childEntries.length - 1}
              searchQuery={searchQuery}
              pinnedPaths={pinnedPaths}
            />
          ))}
          <div
            className="text-xs text-zinc-400 py-0.5"
            style={{ paddingLeft: `${depth * 16 + 28}px` }}
          >
            {isArray ? "]" : "}"}
          </div>
        </>
      )}
    </div>
  );
});

export function TreeViewer() {
  const { parsedJson, searchQuery, pinnedPaths } = useJsonStore();

  if (parsedJson === null) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400 p-6">
        <p className="text-sm">Enter valid JSON to view tree</p>
      </div>
    );
  }

  return (
    <div className="p-2 font-mono text-sm overflow-auto h-full">
      <TreeNode
        keyName="$"
        value={parsedJson}
        path="$"
        depth={0}
        isLast={true}
        searchQuery={searchQuery}
        pinnedPaths={pinnedPaths}
      />
    </div>
  );
}
