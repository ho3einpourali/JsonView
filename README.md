# JsonView

**JSON viewer, formatter, analyzer, and debugging tool.**

The fastest way to inspect JSON. Format, validate, search, convert, and visualize JSON with a beautiful, blazing-fast developer tool. Everything stays in your browser.

![JsonView](https://img.shields.io/badge/JSON-Viewer-blue?style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)

## Features

- **Monaco Editor** - Full-featured editor with syntax highlighting, folding, multiple cursors
- **Tree Viewer** - Interactive tree with expand/collapse, search, and path copying
- **Powerful Search** - Search keys, values, regex, case-sensitive, whole word matching
- **Path Finder** - Click any node to copy JSONPath like `$.users[2].email`
- **Live Validation** - Real-time error detection with line/column info
- **Statistics** - Object count, array count, depth, types, and file size
- **Diff Viewer** - Compare two JSON documents side by side
- **Schema Support** - Auto-generate JSON Schema and validate against schemas
- **Format Converter** - Convert JSON to YAML, XML, CSV, TOML, Markdown
- **Dark Mode** - Beautiful dark, light, and system theme support
- **Command Palette** - `Ctrl+K` / `Cmd+K` for every action
- **Keyboard Shortcuts** - Full keyboard navigation
- **Drag & Drop** - Drop JSON files directly into the editor
- **URL Import** - Fetch JSON from any URL
- **Export** - Download as JSON, copy to clipboard
- **Responsive** - Works on mobile, tablet, and desktop
- **Privacy First** - Everything stays in your browser. Nothing is uploaded.
- **Offline** - Works completely offline
- **Multi-tab** - Work with multiple JSON files simultaneously

## Tech Stack

- [Next.js 16](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS 4](https://tailwindcss.com/) - Styling
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Lucide Icons](https://lucide.dev/) - Icons
- [js-yaml](https://github.com/nodeca/js-yaml) - YAML conversion
- [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) - XML conversion
- [PapaParse](https://www.papaparse.com/) - CSV conversion

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

```bash
git clone https://github.com/ho3einpourali/jsonview.git
cd jsonview
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `Cmd+K` | Command Palette |
| `Ctrl+Shift+F` | Format JSON |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+S` | Save / Download |
| `Ctrl+C` | Copy JSON |

## Project Structure

```
src/
  app/
    page.tsx              # Landing page
    editor/page.tsx       # Main editor
    layout.tsx            # Root layout
  components/
    ui/                   # Reusable UI components
    editor/               # Editor-specific components
    layout/               # Layout components
  lib/
    utils.ts              # Utility functions
    json-utils.ts         # JSON processing utilities
    storage.ts            # IndexedDB persistence
  store/
    json-store.ts         # JSON state management
    theme-store.ts        # Theme state management
```

## Acknowledgments

- Inspired by [VS Code](https://code.visualstudio.com/), [Raycast](https://www.raycast.com/), [Linear](https://linear.app/), [GitHub](https://github.com/), [Vercel](https://vercel.com/)