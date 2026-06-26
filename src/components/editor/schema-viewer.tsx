"use client";

import { useState, useMemo, useCallback } from "react";
import { useJsonStore } from "@/store/json-store";
import { parseJsonSafe, formatJson } from "@/lib/json-utils";
import { copyToClipboard } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Copy, Download, Check, AlertTriangle } from "lucide-react";

function generateSchema(data: unknown, path: string = ""): Record<string, unknown> {
  if (data === null) return { type: "null" };
  if (typeof data === "string") return { type: "string" };
  if (typeof data === "number") {
    return Number.isInteger(data) ? { type: "integer" } : { type: "number" };
  }
  if (typeof data === "boolean") return { type: "boolean" };

  if (Array.isArray(data)) {
    const schema: Record<string, unknown> = { type: "array" };
    if (data.length > 0) {
      schema.items = generateSchema(data[0], `${path}[0]`);
    }
    return schema;
  }

  if (typeof data === "object") {
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      properties[key] = generateSchema(value, `${path}.${key}`);
      required.push(key);
    }

    return {
      type: "object",
      properties,
      required,
    };
  }

  return {};
}

interface SchemaValidationError {
  path: string;
  message: string;
}

function validateAgainstSchema(data: unknown, schema: Record<string, unknown>, path: string = "$"): SchemaValidationError[] {
  const errors: SchemaValidationError[] = [];

  if (!schema || typeof schema !== "object") return errors;

  const schemaType = schema.type as string | undefined;

  if (schemaType) {
    const actualType = data === null ? "null" : Array.isArray(data) ? "array" : typeof data;
    if (actualType !== schemaType) {
      errors.push({ path, message: `Expected type "${schemaType}", got "${actualType}"` });
    }
  }

  if (schemaType === "object" && typeof data === "object" && data !== null && !Array.isArray(data)) {
    const properties = schema.properties as Record<string, Record<string, unknown>> | undefined;
    const required = (schema.required as string[]) || [];

    for (const key of required) {
      if (!(key in (data as Record<string, unknown>))) {
        errors.push({ path: `${path}.${key}`, message: `Missing required property "${key}"` });
      }
    }

    if (properties) {
      for (const [key, propSchema] of Object.entries(properties)) {
        if (key in (data as Record<string, unknown>)) {
          errors.push(...validateAgainstSchema((data as Record<string, unknown>)[key], propSchema, `${path}.${key}`));
        }
      }
    }
  }

  if (schemaType === "array" && Array.isArray(data)) {
    const items = schema.items as Record<string, unknown> | undefined;
    if (items) {
      data.forEach((item, i) => {
        errors.push(...validateAgainstSchema(item, items, `${path}[${i}]`));
      });
    }
  }

  return errors;
}

export function SchemaViewer() {
  const { parsedJson } = useJsonStore();
  const [schemaInput, setSchemaInput] = useState("");
  const [validationErrors, setValidationErrors] = useState<SchemaValidationError[] | null>(null);

  const generatedSchema = useMemo(() => {
    if (parsedJson === null) return null;
    return generateSchema(parsedJson);
  }, [parsedJson]);

  const handleValidate = useCallback(() => {
    if (parsedJson === null || !schemaInput) return;
    const schemaResult = parseJsonSafe(schemaInput);
    if (schemaResult.error || !schemaResult.data) {
      setValidationErrors([{ path: "$", message: "Invalid schema JSON" }]);
      return;
    }
    const errors = validateAgainstSchema(parsedJson, schemaResult.data as Record<string, unknown>);
    setValidationErrors(errors);
  }, [parsedJson, schemaInput]);

  const handleCopy = useCallback(() => {
    if (generatedSchema) {
      copyToClipboard(formatJson(generatedSchema));
    }
  }, [generatedSchema]);

  const handleDownload = useCallback(() => {
    if (generatedSchema) {
      const blob = new Blob([formatJson(generatedSchema)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "schema.json";
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [generatedSchema]);

  if (parsedJson === null) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400 p-6">
        <p className="text-sm">Enter valid JSON to generate schema</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-medium text-zinc-500">Generated Schema</h4>
          <div className="flex-1" />
          <Button variant="ghost" size="icon" onClick={handleCopy} className="h-7 w-7">
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDownload} className="h-7 w-7">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex items-center gap-1.5">
          <Input
            placeholder="Paste schema JSON to validate against..."
            value={schemaInput}
            onChange={(e) => setSchemaInput(e.target.value)}
            className="h-8 text-xs"
          />
          <Button size="sm" onClick={handleValidate} className="h-8">
            Validate
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {validationErrors !== null && (
            <div className={`p-3 rounded-lg border ${validationErrors.length === 0 ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800" : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"}`}>
              {validationErrors.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                  <Check className="h-4 w-4" /> Valid against schema
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4" /> {validationErrors.length} error(s) found
                  </div>
                  {validationErrors.map((err, i) => (
                    <div key={i} className="text-xs text-red-600 dark:text-red-400">
                      <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">{err.path}</code>{" "}
                      {err.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {generatedSchema && (
            <div>
              <pre className="text-xs font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap overflow-auto max-h-[500px]">
                {formatJson(generatedSchema)}
              </pre>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
