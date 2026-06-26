"use client";

import { useCallback } from "react";
import { useJsonStore } from "@/store/json-store";
import { parseJsonSafe, formatJson, minifyJson } from "@/lib/json-utils";
import { copyToClipboard } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Download,
  Copy,
  FileJson,
  FileText,
  Minimize2,
} from "lucide-react";

export function ExportPanel() {
  const { jsonContent } = useJsonStore();

  const handleDownloadJson = useCallback(() => {
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [jsonContent]);

  const handleDownloadMinified = useCallback(() => {
    const result = parseJsonSafe(jsonContent);
    if (result.data !== null) {
      const content = minifyJson(result.data);
      const blob = new Blob([content], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "minified.json";
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [jsonContent]);

  const handleDownloadTxt = useCallback(() => {
    const blob = new Blob([jsonContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [jsonContent]);

  const handleCopyPretty = useCallback(() => {
    const result = parseJsonSafe(jsonContent);
    if (result.data !== null) {
      copyToClipboard(formatJson(result.data));
    }
  }, [jsonContent]);

  const handleCopyMinified = useCallback(() => {
    const result = parseJsonSafe(jsonContent);
    if (result.data !== null) {
      copyToClipboard(minifyJson(result.data));
    }
  }, [jsonContent]);

  const handleCopyRaw = useCallback(() => {
    copyToClipboard(jsonContent);
  }, [jsonContent]);

  return (
    <div className="p-3 space-y-3">
      <div>
        <h4 className="text-xs font-medium text-zinc-500 mb-2">Download</h4>
        <div className="space-y-1">
          <Button variant="outline" size="sm" onClick={handleDownloadJson} className="w-full justify-start gap-2 h-8 text-xs">
            <FileJson className="h-3.5 w-3.5" /> Pretty JSON (.json)
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadMinified} className="w-full justify-start gap-2 h-8 text-xs">
            <Minimize2 className="h-3.5 w-3.5" /> Minified JSON (.json)
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadTxt} className="w-full justify-start gap-2 h-8 text-xs">
            <FileText className="h-3.5 w-3.5" /> Text File (.txt)
          </Button>
        </div>
      </div>
      <div>
        <h4 className="text-xs font-medium text-zinc-500 mb-2">Copy to Clipboard</h4>
        <div className="space-y-1">
          <Button variant="outline" size="sm" onClick={handleCopyPretty} className="w-full justify-start gap-2 h-8 text-xs">
            <Copy className="h-3.5 w-3.5" /> Pretty JSON
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyMinified} className="w-full justify-start gap-2 h-8 text-xs">
            <Copy className="h-3.5 w-3.5" /> Minified JSON
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyRaw} className="w-full justify-start gap-2 h-8 text-xs">
            <Copy className="h-3.5 w-3.5" /> Raw Content
          </Button>
        </div>
      </div>
    </div>
  );
}
