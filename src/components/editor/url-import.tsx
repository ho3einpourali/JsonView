"use client";

import { useState, useCallback } from "react";
import { useJsonStore } from "@/store/json-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Globe, Loader2, AlertCircle } from "lucide-react";

export function UrlImport() {
  const { setJsonContent } = useJsonStore();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = useCallback(async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url.trim());
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const text = await response.text();
      setJsonContent(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch URL");
    } finally {
      setLoading(false);
    }
  }, [url, setJsonContent]);

  return (
    <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <Input
            placeholder="https://api.example.com/data.json"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFetch()}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <Button size="sm" onClick={handleFetch} disabled={loading} className="h-8">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Fetch"}
        </Button>
      </div>
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  );
}
