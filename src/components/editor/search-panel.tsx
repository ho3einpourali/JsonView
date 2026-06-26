"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useJsonStore } from "@/store/json-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, CaseSensitive, WholeWord, Regex, Copy } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

function searchJson(data: unknown, query: string, options: { caseSensitive: boolean; useRegex: boolean; wholeWord: boolean }, path: string = "$"): { key: string; value: string; path: string }[] {
  if (!query) return [];
  const results: { key: string; value: string; path: string }[] = [];

  function match(str: string): boolean {
    if (options.useRegex) {
      try {
        const flags = options.caseSensitive ? "g" : "gi";
        const regex = new RegExp(query, flags);
        return regex.test(str);
      } catch {
        return false;
      }
    }
    const search = options.caseSensitive ? query : query.toLowerCase();
    const target = options.caseSensitive ? str : str.toLowerCase();
    if (options.wholeWord) {
      return new RegExp(`\\b${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, options.caseSensitive ? "" : "i").test(str);
    }
    return target.includes(search);
  }

  function traverse(value: unknown, currentPath: string, key: string | number): void {
    if (value === null || value === undefined) {
      if (match("null")) {
        results.push({ key: String(key), value: "null", path: currentPath });
      }
      return;
    }

    if (typeof value === "object") {
      if (Array.isArray(value)) {
        value.forEach((item, i) => {
          traverse(item, `${currentPath}[${i}]`, i);
        });
      } else {
        Object.entries(value as Record<string, unknown>).forEach(([k, v]) => {
          if (match(k)) {
            results.push({ key: k, value: typeof v === "string" ? v : JSON.stringify(v), path: `${currentPath}.${k}` });
          }
          traverse(v, `${currentPath}.${k}`, k);
        });
      }
    } else {
      const strValue = String(value);
      if (match(strValue)) {
        results.push({ key: String(key), value: strValue, path: currentPath });
      }
    }
  }

  traverse(data, path, "$");
  return results;
}

export function SearchPanel() {
  const { parsedJson, searchQuery, searchOptions, setSearchQuery, setSearchOptions, searchResults, setSearchResults } = useJsonStore();
  const [localQuery, setLocalQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery]);

  useEffect(() => {
    if (parsedJson !== null && searchQuery) {
      const results = searchJson(parsedJson, searchQuery, searchOptions);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [parsedJson, searchQuery, searchOptions, setSearchResults]);

  const toggleCase = useCallback(() => {
    setSearchOptions({ caseSensitive: !searchOptions.caseSensitive });
  }, [searchOptions, setSearchOptions]);

  const toggleRegex = useCallback(() => {
    setSearchOptions({ useRegex: !searchOptions.useRegex });
  }, [searchOptions, setSearchOptions]);

  const toggleWholeWord = useCallback(() => {
    setSearchOptions({ wholeWord: !searchOptions.wholeWord });
  }, [searchOptions, setSearchOptions]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <Input
              placeholder="Search keys and values..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <Tooltip content="Case Sensitive">
            <Button
              variant={searchOptions.caseSensitive ? "default" : "ghost"}
              size="icon"
              onClick={toggleCase}
              className="h-8 w-8"
            >
              <CaseSensitive className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
          <Tooltip content="Regex">
            <Button
              variant={searchOptions.useRegex ? "default" : "ghost"}
              size="icon"
              onClick={toggleRegex}
              className="h-8 w-8"
            >
              <Regex className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
          <Tooltip content="Whole Word">
            <Button
              variant={searchOptions.wholeWord ? "default" : "ghost"}
              size="icon"
              onClick={toggleWholeWord}
              className="h-8 w-8"
            >
              <WholeWord className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
        </div>
        {searchResults.length > 0 && (
          <p className="text-xs text-zinc-500 mt-1.5 px-1">
            {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {searchResults.map((result, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/50 group cursor-pointer"
              onClick={() => copyToClipboard(result.path)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">
                  {result.key}
                </p>
                <p className="text-xs text-zinc-500 truncate">{result.path}</p>
                <p className="text-xs text-zinc-400 truncate mt-0.5">
                  {result.value.length > 60 ? result.value.slice(0, 60) + "..." : result.value}
                </p>
              </div>
              <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-opacity">
                <Copy className="h-3 w-3" />
              </button>
            </div>
          ))}
          {searchQuery && searchResults.length === 0 && (
            <p className="text-xs text-zinc-500 text-center py-4">No results found</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
