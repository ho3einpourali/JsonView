import { create } from "zustand";

export type ViewMode = "raw" | "tree" | "split";

export interface Tab {
  id: string;
  name: string;
  content: string;
  modified: boolean;
}

interface JsonState {
  tabs: Tab[];
  activeTabId: string;
  viewMode: ViewMode;
  jsonContent: string;
  parsedJson: unknown;
  parseError: { message: string; line: number; column: number } | null;
  searchQuery: string;
  searchOptions: { caseSensitive: boolean; useRegex: boolean; wholeWord: boolean };
  searchResults: { key: string; value: string; path: string }[];
  pinnedPaths: string[];
  history: string[];
  historyIndex: number;
  treeExpandedPaths: Set<string>;
  showMinimap: boolean;
  wordWrap: boolean;

  setJsonContent: (content: string) => void;
  setParsedJson: (data: unknown) => void;
  setParseError: (error: { message: string; line: number; column: number } | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  setSearchOptions: (options: Partial<JsonState["searchOptions"]>) => void;
  setSearchResults: (results: { key: string; value: string; path: string }[]) => void;
  togglePinPath: (path: string) => void;
  pushHistory: (content: string) => void;
  undo: () => string | null;
  redo: () => string | null;
  toggleTreePath: (path: string) => void;
  expandAllTree: () => void;
  collapseAllTree: () => void;
  toggleMinimap: () => void;
  toggleWordWrap: () => void;
  addTab: (name: string, content: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabContent: (id: string, content: string) => void;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export const useJsonStore = create<JsonState>((set, get) => ({
  tabs: [{ id: generateId(), name: "Untitled", content: "", modified: false }],
  activeTabId: "",
  viewMode: "raw",
  jsonContent: "",
  parsedJson: null,
  parseError: null,
  searchQuery: "",
  searchOptions: { caseSensitive: false, useRegex: false, wholeWord: false },
  searchResults: [],
  pinnedPaths: [],
  history: [""],
  historyIndex: 0,
  treeExpandedPaths: new Set(["$"]),
  showMinimap: true,
  wordWrap: false,

  setJsonContent: (content) => {
    const state = get();
    const newTabs = state.tabs.map((t) =>
      t.id === state.activeTabId ? { ...t, content, modified: true } : t
    );
    set({ jsonContent: content, tabs: newTabs });
  },

  setParsedJson: (data) => set({ parsedJson: data }),
  setParseError: (error) => set({ parseError: error }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchOptions: (options) =>
    set((s) => ({ searchOptions: { ...s.searchOptions, ...options } })),
  setSearchResults: (results) => set({ searchResults: results }),
  togglePinPath: (path) =>
    set((s) => ({
      pinnedPaths: s.pinnedPaths.includes(path)
        ? s.pinnedPaths.filter((p) => p !== path)
        : [...s.pinnedPaths, path],
    })),
  pushHistory: (content) =>
    set((s) => {
      const newHistory = s.history.slice(0, s.historyIndex + 1);
      newHistory.push(content);
      if (newHistory.length > 100) newHistory.shift();
      return { history: newHistory, historyIndex: newHistory.length - 1 };
    }),
  undo: () => {
    const s = get();
    if (s.historyIndex > 0) {
      const newIndex = s.historyIndex - 1;
      set({ historyIndex: newIndex });
      return s.history[newIndex];
    }
    return null;
  },
  redo: () => {
    const s = get();
    if (s.historyIndex < s.history.length - 1) {
      const newIndex = s.historyIndex + 1;
      set({ historyIndex: newIndex });
      return s.history[newIndex];
    }
    return null;
  },
  toggleTreePath: (path) =>
    set((s) => {
      const newSet = new Set(s.treeExpandedPaths);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return { treeExpandedPaths: newSet };
    }),
  expandAllTree: () => set({ treeExpandedPaths: new Set(["*"]) }),
  collapseAllTree: () => set({ treeExpandedPaths: new Set(["$"]) }),
  toggleMinimap: () => set((s) => ({ showMinimap: !s.showMinimap })),
  toggleWordWrap: () => set((s) => ({ wordWrap: !s.wordWrap })),
  addTab: (name, content) => {
    const id = generateId();
    set((s) => ({
      tabs: [...s.tabs, { id, name, content, modified: false }],
      activeTabId: id,
      jsonContent: content,
    }));
  },
  closeTab: (id) =>
    set((s) => {
      const newTabs = s.tabs.filter((t) => t.id !== id);
      if (newTabs.length === 0) {
        const newTab = { id: generateId(), name: "Untitled", content: "", modified: false };
        return { tabs: [newTab], activeTabId: newTab.id, jsonContent: "" };
      }
      const newActiveId =
        s.activeTabId === id ? newTabs[Math.max(0, newTabs.length - 1)].id : s.activeTabId;
      const activeTab = newTabs.find((t) => t.id === newActiveId);
      return { tabs: newTabs, activeTabId: newActiveId, jsonContent: activeTab?.content ?? "" };
    }),
  setActiveTab: (id) =>
    set((s) => {
      const tab = s.tabs.find((t) => t.id === id);
      return { activeTabId: id, jsonContent: tab?.content ?? "" };
    }),
  updateTabContent: (id, content) =>
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === id ? { ...t, content, modified: true } : t)),
    })),
}));

const initialTabId = useJsonStore.getState().tabs[0].id;
useJsonStore.setState({ activeTabId: initialTabId });
