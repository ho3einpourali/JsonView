export interface JsonStats {
  fileSize: number;
  objectCount: number;
  arrayCount: number;
  keyCount: number;
  stringCount: number;
  numberCount: number;
  booleanCount: number;
  nullCount: number;
  maxDepth: number;
  totalNodes: number;
}

export function parseJsonSafe(text: string): { data: unknown; error: null } | { data: null; error: { message: string; line: number; column: number } } {
  try {
    const data = JSON.parse(text);
    return { data, error: null };
  } catch (e) {
    const err = e as SyntaxError;
    const match = err.message.match(/position\s+(\d+)/);
    let line = 1;
    let column = 1;
    if (match) {
      const pos = parseInt(match[1], 10);
      const beforeError = text.slice(0, pos);
      const lines = beforeError.split("\n");
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }
    return {
      data: null,
      error: { message: err.message, line, column },
    };
  }
}

export function calculateStats(data: unknown): JsonStats {
  const stats: JsonStats = {
    fileSize: 0,
    objectCount: 0,
    arrayCount: 0,
    keyCount: 0,
    stringCount: 0,
    numberCount: 0,
    booleanCount: 0,
    nullCount: 0,
    maxDepth: 0,
    totalNodes: 0,
  };

  function traverse(value: unknown, depth: number): void {
    stats.totalNodes++;
    if (depth > stats.maxDepth) stats.maxDepth = depth;

    if (value === null) {
      stats.nullCount++;
    } else if (typeof value === "boolean") {
      stats.booleanCount++;
    } else if (typeof value === "number") {
      stats.numberCount++;
    } else if (typeof value === "string") {
      stats.stringCount++;
    } else if (Array.isArray(value)) {
      stats.arrayCount++;
      for (const item of value) {
        traverse(item, depth + 1);
      }
    } else if (typeof value === "object") {
      stats.objectCount++;
      const keys = Object.keys(value as Record<string, unknown>);
      stats.keyCount += keys.length;
      for (const key of keys) {
        traverse((value as Record<string, unknown>)[key], depth + 1);
      }
    }
  }

  traverse(data, 0);
  return stats;
}

export function getJsonPath(data: unknown, target: unknown, currentPath: string = "$"): string | null {
  if (data === target) return currentPath;
  if (data === null || typeof data !== "object") return null;

  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const result = getJsonPath(data[i], target, `${currentPath}[${i}]`);
      if (result) return result;
    }
  } else {
    for (const key of Object.keys(data as Record<string, unknown>)) {
      const result = getJsonPath(
        (data as Record<string, unknown>)[key],
        target,
        `${currentPath}.${key}`
      );
      if (result) return result;
    }
  }

  return null;
}

export function resolveJsonPath(data: unknown, path: string): unknown {
  const parts = path.replace(/^\$\.?/, "").split(/\.|\[|\]/).filter(Boolean);
  let current: unknown = data;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    const index = parseInt(part, 10);
    if (Array.isArray(current)) {
      current = current[index];
    } else if (typeof current === "object") {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function minifyJson(data: unknown): string {
  return JSON.stringify(data);
}

export function generateSampleJson(): string {
  return JSON.stringify({
    name: "JsonView",
    version: "1.0.0",
    description: "The best JSON viewer, formatter, analyzer, and debugging tool",
    features: [
      "JSON Editor with Monaco",
      "Tree Viewer",
      "Search & Filter",
      "Validation",
      "Statistics",
      "Diff Viewer",
      "Schema Support",
      "Format Conversion",
    ],
    config: {
      theme: "dark",
      autoFormat: true,
      maxFileSize: 100000000,
    },
    users: [
      { id: 1, name: "Alice", email: "alice@example.com", active: true },
      { id: 2, name: "Bob", email: "bob@example.com", active: false },
      { id: 3, name: "Charlie", email: "charlie@example.com", active: true },
    ],
    metadata: {
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-06-25T00:00:00Z",
      tags: ["json", "developer-tools", "open-source"],
    },
  }, null, 2);
}
