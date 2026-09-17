# Graph Report - sevr  (2026-09-17)

## Corpus Check
- Corpus is ~9,715 words - fits in a single context window. You may not need a graph.

## Summary
- 154 nodes · 252 edges · 14 communities (11 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10

## God Nodes (most connected - your core abstractions)
1. `lucide-react` - 20 edges
2. `compilerOptions` - 12 edges
3. `react` - 8 edges
4. `getResponse()` - 6 edges
5. `SevrFile` - 6 edges
6. `scripts` - 5 edges
7. `react-router-dom` - 5 edges
8. `handleRequest()` - 5 edges
9. `apiClient` - 5 edges
10. `TLPLabel` - 5 edges

## Surprising Connections (you probably didn't know these)
- `TlpSelectorProps` --references--> `TLPLabel`  [EXTRACTED]
  frontend/src/components/tlp/TlpSelector.tsx → frontend/src/types/index.ts

## Import Cycles
- None detected.

## Communities (14 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.18
Nodes (13): AlertCard(), DetectionAlertItem, AlertList(), Shell(), Sidebar(), TopBar(), DetectionAlertsPage(), INITIAL_ALERTS (+5 more)

### Community 1 - "Community 1"
Cohesion: 0.17
Nodes (14): FileCard(), FileList(), UploadDropzone(), STYLES, TlpBadge(), TlpSelector(), TlpSelectorProps, ProjectWorkspace() (+6 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (18): name, private, scripts, build, dev, msw:init, preview, type (+10 more)

### Community 3 - "Community 3"
Cohesion: 0.14
Nodes (12): usingMocks, App(), frontend_src_index, bootstrap(), worker, auditLog, files, handlers (+4 more)

### Community 4 - "Community 4"
Cohesion: 0.21
Nodes (7): apiClient, AuditEntryRow(), getActionIcon(), AuditTrailPage(), AuditEntry, Project, axios

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (13): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, resolveJsonModule (+5 more)

### Community 6 - "Community 6"
Cohesion: 0.20
Nodes (10): devDependencies, autoprefixer, msw, postcss, tailwindcss, @types/react, @types/react-dom, typescript (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.36
Nodes (8): activeClientIds, getResponse(), handleRequest(), IS_MOCKED_RESPONSE, resolveMainClient(), respondWithMock(), sendToClient(), serializeRequest()

### Community 8 - "Community 8"
Cohesion: 0.36
Nodes (4): ExportOutcomeBanner(), ShareDialog(), ExportSharePage(), ExportDecision

### Community 9 - "Community 9"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, preview, version

### Community 10 - "Community 10"
Cohesion: 0.33
Nodes (6): dependencies, axios, lucide-react, react, react-dom, react-router-dom

## Knowledge Gaps
- **58 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+53 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 71 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `lucide-react` connect `Community 0` to `Community 8`, `Community 1`, `Community 2`, `Community 4`?**
  _High betweenness centrality (0.176) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Community 6` to `Community 2`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Why does `react` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 8`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _58 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.14166666666666666 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._