"use client";

import { useState, useMemo, useCallback } from "react";
import { useJsonStore } from "@/store/json-store";
import { parseJsonSafe } from "@/lib/json-utils";
import { copyToClipboard } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy, Download } from "lucide-react";
import * as yaml from "js-yaml";
import { XMLBuilder } from "fast-xml-parser";
import Papa from "papaparse";

function jsonToYaml(data: unknown): string {
  return yaml.dump(data as object, { indent: 2, lineWidth: 120 });
}

function jsonToXml(data: unknown): string {
  const builder = new XMLBuilder({ ignoreAttributes: false, format: true });
  return builder.build({ root: data });
}

function jsonToCsv(data: unknown): string {
  if (Array.isArray(data)) {
    return Papa.unparse(data);
  }
  if (typeof data === "object" && data !== null) {
    const records = Object.entries(data as Record<string, unknown>).map(([k, v]) => ({
      key: k,
      value: typeof v === "string" ? v : JSON.stringify(v),
    }));
    return Papa.unparse(records);
  }
  return String(data);
}

function jsonToMarkdownTable(data: unknown): string {
  if (!Array.isArray(data) || data.length === 0) return "No array data";

  const firstItem = data[0];
  if (typeof firstItem !== "object" || firstItem === null) {
    return data.map((item) => `| ${item} |`).join("\n");
  }

  const headers = Object.keys(firstItem as Record<string, unknown>);
  const headerRow = `| ${headers.join(" | ")} |`;
  const separatorRow = `| ${headers.map(() => "---").join(" | ")} |`;
  const rows = data.map((item) =>
    `| ${headers.map((h) => String((item as Record<string, unknown>)[h] ?? "")).join(" | ")} |`
  );

  return [headerRow, separatorRow, ...rows].join("\n");
}

function jsonToToml(data: unknown): string {
  if (typeof data !== "object" || data === null) return String(data);

  let toml = "";
  const entries = Object.entries(data as Record<string, unknown>);

  for (const [key, value] of entries) {
    if (typeof value === "string") {
      toml += `${key} = "${value}"\n`;
    } else if (typeof value === "number" || typeof value === "boolean") {
      toml += `${key} = ${value}\n`;
    } else if (value === null) {
      toml += `${key} = null\n`;
    } else if (Array.isArray(value)) {
      toml += `${key} = [${value.map((v) => typeof v === "string" ? `"${v}"` : String(v)).join(", ")}]\n`;
    } else if (typeof value === "object") {
      toml += `\n[${key}]\n`;
      toml += jsonToToml(value);
    }
  }

  return toml;
}

export function FormatConverter() {
  const { parsedJson } = useJsonStore();
  const [activeFormat, setActiveFormat] = useState("yaml");

  const converters = useMemo(() => {
    if (parsedJson === null) return {};
    return {
      yaml: jsonToYaml(parsedJson),
      xml: jsonToXml(parsedJson),
      csv: jsonToCsv(parsedJson),
      markdown: jsonToMarkdownTable(parsedJson),
      toml: jsonToToml(parsedJson),
    };
  }, [parsedJson]);

  const handleCopy = useCallback(() => {
    const content = converters[activeFormat as keyof typeof converters];
    if (content) copyToClipboard(content);
  }, [converters, activeFormat]);

  const handleDownload = useCallback(() => {
    const content = converters[activeFormat as keyof typeof converters];
    if (!content) return;
    const extensions: Record<string, string> = { yaml: "yaml", xml: "xml", csv: "csv", markdown: "md", toml: "toml" };
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted.${extensions[activeFormat] || "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [converters, activeFormat]);

  if (parsedJson === null) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400 p-6">
        <p className="text-sm">Enter valid JSON to convert</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="yaml" className="flex flex-col h-full" onValueChange={setActiveFormat}>
        <div className="flex items-center justify-between px-2 py-1 border-b border-zinc-200 dark:border-zinc-800">
          <TabsList>
            <TabsTrigger value="yaml">YAML</TabsTrigger>
            <TabsTrigger value="xml">XML</TabsTrigger>
            <TabsTrigger value="csv">CSV</TabsTrigger>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
            <TabsTrigger value="toml">TOML</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleCopy} className="h-7 w-7">
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDownload} className="h-7 w-7">
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {Object.entries(converters).map(([format, content]) => (
          <TabsContent key={format} value={format} className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <pre className="p-4 text-xs font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {content}
              </pre>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
