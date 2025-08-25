# ACENji

This folder contains **ACENji-licensed** code and assets for the Fight Encyclopedia project, including the **exporter tool** that converts your Excel-based taxonomy into JSON for the website and ACENji ingestion.

> **License:** Everything under `/ACENji/` is licensed under the **ACENji Custom License** (see [`ACENji/LICENSE-ACENJI.txt`](./LICENSE-ACENJI.txt)).  
> Content outside `/ACENji/` (e.g., `/class` or `/Class`) remains under its own license (e.g., MIT), unless stated otherwise.

---

## Repository Layout

```
repo-root/
├─ ACENji/
│  ├─ LICENSE-ACENJI.txt
│  ├─ README.md                      ← this file
│  └─ tools/
│     └─ fight-export/               ← exporter tool (Node.js)
│        ├─ build-encyclopedia.js
│        ├─ package.json
│        ├─ .gitignore
│        └─ dist/                    ← build outputs (generated)
├─ class/                ← taxonomy root (Excel files)
└─ (other folders…)
```

---

## What the Exporter Does

The exporter walks your **taxonomy folders** (top = `class/`), reads every adjacent **`.xlsx`** that uses the schema:

- Header: `label | content` (case-insensitive)
- ~27 rows (your encyclopedia fields)

…and produces three outputs in `ACENji/tools/fight-export/dist/`:

1) **Per-node JSON** (`dist/nodes/**.json`)  
   - One JSON **per Excel**  
   - Mirrors your folder structure  
   - Best for the **website** (fast, lazy loading)

2) **Combined JSON** (`dist/all.json`)  
   - A single file containing **every node**  
   - Best for **DB import, search indexing, backups, ML pipelines**

3) **Manifest** (`dist/manifest.json`)  
   - A tree for **navigation** + maps **slugs → file paths**  
   - Lets the frontend render the sidebar and lazy-load per-node JSON on click

Nodes that live under any folder named `acenji` (case-insensitive) are auto-tagged with:
```json
{ "license": "ACENji-Custom" }
```

---

## Prerequisites

- **Node.js 18+**
- Excel files placed under your taxonomy root (`class/` or `Class/`) with:
  - Header: `label | content`
  - Your standard set of rows (≈27 fields)

> ⚠️ **Case sensitivity:** On Linux, `class` ≠ `Class`. Use the exact folder name in paths and scripts.

---

## Setup

From repo root:

```bash
cd ACENji/tools/fight-export
npm init -y
npm install xlsx fast-glob fs-extra slugify
```

Create `.gitignore` in `ACENji/tools/fight-export/`:

```
node_modules
dist
```

Ensure the exporter script exists at `ACENji/tools/fight-export/build-encyclopedia.js` and begins with:

```js
#!/usr/bin/env node
// SPDX-License-Identifier: ACENji-Custom
```

> If you prefer calling with `node` (as we do below), the shebang is optional. Keep the SPDX header.

---

## Configure NPM Script

Edit `ACENji/tools/fight-export/package.json` and add:

```json
{
  "scripts": {
    "build": "node ./build-encyclopedia.js ../../../class"
  }
}
```

- Change `../../../class` to `../../../Class` if your folder is capitalized.
- Outputs are written to `ACENji/tools/fight-export/dist/`.

---

## Run the Exporter

```bash
cd ACENji/tools/fight-export
npm run build
```

Expected console output:

```
Input root: /absolute/path/to/class
Wrote:
- dist/all.json
- dist/manifest.json
- dist/nodes/... (N nodes)
```

Verify outputs:

- `ACENji/tools/fight-export/dist/all.json`
- `ACENji/tools/fight-export/dist/manifest.json`
- `ACENji/tools/fight-export/dist/nodes/**.json`

---

## Using the Outputs

### Website (recommended)
- Load `dist/manifest.json` at startup to build the **left-nav tree**.
- When a user selects a node:
  1) Look up `bySlug[slug]` (or `byId`) inside the manifest.
  2) Read the `file` path from the lookup.
  3) Fetch the corresponding `dist/nodes/**.json`.
- Render the node’s `labels` plus `taxonomy`.

### ACENji / DB / Search Index
- Import `dist/all.json` directly. It contains:
  ```json
  {
    "generatedAt": "ISO-8601 timestamp",
    "count": 123,
    "nodes": [ { node }, { node }, ... ]
  }
  ```
- Index commonly searched fields: `labels.Description`, `labels.Training Notes`, `labels.Tags`, and `taxonomy.*` for filters.

---

## Why Both Per-node and Combined JSON?

- **Per-node JSON** → great for the web: small payloads, lazy loading, and clean Git diffs when a single technique changes.
- **Combined JSON** → great for bulk import into databases, search indexing, analytics, or ML pipelines.

Keep both; use each where it fits best.

---

## Licensing & SPDX

- All files in `/ACENji/` are under **ACENji Custom License**.
- Add SPDX headers to ACENji files (including the exporter script):
  ```js
  // SPDX-License-Identifier: ACENji-Custom
  ```
- Public taxonomy (e.g., `/class`) can have a different license (e.g., MIT) and may use:
  ```js
  // SPDX-License-Identifier: MIT
  ```

---

## Troubleshooting

**Error:** `MODULE_NOT_FOUND` for `build-encyclopedia.js`  
- Ensure you are in `ACENji/tools/fight-export` when running `npm run build`.  
- Confirm the script is named exactly `build-encyclopedia.js`.  
- In `package.json`, use a relative path with `./`:
  ```json
  "build": "node ./build-encyclopedia.js ../../../class"
  ```

**Error:** `SyntaxError: Invalid or unexpected token` at `#!/usr/bin/env node`  
- The shebang must be the **first line**. Either make it line 1 and put SPDX on line 2, **or** remove the shebang and keep `node` in the npm script.

**No `.xlsx` found**  
- Ensure files end with `.xlsx` (or `.xls`) and aren’t temporary (`~$...`).  
- Ensure header names exist (`label`, `content`, any case).

**Path case mismatch (`Class` vs `class`)**  
- On Linux, fix the path to match the real folder name in both the npm script and your filesystem.

---

## Git Hygiene

**Commit:**
- `ACENji/LICENSE-ACENJI.txt`
- `ACENji/tools/fight-export/**` (including `package.json`, `package-lock.json`, and `build-encyclopedia.js`)
- Optional: `ACENji/tools/fight-export/README.md` (this file content)

**Do NOT commit (generated):**
- `ACENji/tools/fight-export/node_modules/`
- `ACENji/tools/fight-export/dist/`

Add to `.gitignore` (repo or tool-level):

```
ACENji/tools/fight-export/node_modules
ACENji/tools/fight-export/dist
```

---

## Optional Enhancements

- **Validator:** fail the build if a sheet is missing required labels or expected row count.
- **Watch mode:** rebuild on changes (e.g., with `chokidar`).
- **CI workflow:** GitHub Action to run the exporter on push and upload `dist/` artifacts for the website to consume.
