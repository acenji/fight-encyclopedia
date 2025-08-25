#!/usr/bin/env node
// SPDX-License-Identifier: ACENji-Custom
/* build-encyclopedia.js
 * Recursively parse .xlsx label|content files and emit:
 * - dist/all.json (combined)
 * - dist/nodes/<path>/file.json (per-node)
 * - dist/manifest.json (tree + lookups)
 */
const path = require("path");
const fs = require("fs-extra");
const fg = require("fast-glob");
const XLSX = require("xlsx");
const slugify = require("slugify");

// ---------- CONFIG ----------
const INPUT_ROOT = path.resolve(process.argv[2] || "../../class"); // default: ../.. from tools folder
const ACENJI_DIRNAME = "acenji"; // any subtree with this folder name gets custom license tag
const OUT_DIR = path.resolve("dist");
const OUT_NODES_DIR = path.join(OUT_DIR, "nodes");
const OUT_COMBINED = path.join(OUT_DIR, "all.json");
const OUT_MANIFEST = path.join(OUT_DIR, "manifest.json");

// ---------- HELPERS ----------
const toSlug = (s) =>
  slugify(String(s || "").trim(), { lower: true, strict: true });

function readXlsx(file) {
  const wb = XLSX.readFile(file);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: "", raw: true });

  // Expect first row to have "label" and "content"
  // Normalize headers to exactly 'label' and 'content'
  const normalized = rows.map((r) => {
    const keys = Object.keys(r);
    // Try to find label/content keys case-insensitively
    const labelKey = keys.find((k) => k.toLowerCase().trim() === "label");
    const contentKey = keys.find((k) => k.toLowerCase().trim() === "content");
    return {
      label: (labelKey ? r[labelKey] : "").toString().trim(),
      content: (contentKey ? r[contentKey] : "").toString().trim(),
    };
  });

  // Convert to a dictionary
  const dict = {};
  for (const { label, content } of normalized) {
    if (!label) continue;
    if (dict[label]) {
      // If duplicate label appears, append with numbered suffix
      let i = 2;
      while (dict[`${label} (${i})`]) i++;
      dict[`${label} (${i})`] = content;
    } else {
      dict[label] = content;
    }
  }
  return dict;
}

function inferTaxonomyFromPath(pathParts, labelsDict) {
  // pathParts starts at INPUT_ROOT basename, e.g.
  // ["Class","Submissions","Chokes and Strangles","Arm Triangles","Head-and-Arm Chokes","Kata Gatame","From Turtle"]
  const tax = {
    Class: "",
    Group: "",
    Family: "",
    SubFamily: "",
    Genus: "",
    Species: "",
    Variety: "",
  };

  // Try to populate taxonomy from labels first (if present)
  for (const key of Object.keys(tax)) {
    if (labelsDict[key]) tax[key] = labelsDict[key];
  }

  // Fill missing levels from path where sensible
  // We expect pathParts[0] === "Class"
  const map = [
    ["Class", 1],
    ["Group", 2],
    ["Family", 3],
    ["SubFamily", 4],
    ["Genus", 5],
    ["Species", 6],
  ];
  for (const [level, idx] of map) {
    if (!tax[level] && pathParts[idx]) tax[level] = pathParts[idx];
  }

  // Variety often equals the file name’s "Entity Name" or labels["Variety"]
  if (!tax.Variety) {
    tax.Variety = labelsDict["Variety"] || labelsDict["Entity Name"] || "";
  }

  return tax;
}

function buildId(pathParts, entityName) {
  // stable ID from path + entity
  return (
    pathParts.map(toSlug).join("--") +
    (entityName ? `--${toSlug(entityName)}` : "")
  ).replace(/(^-+|-$)/g, "");
}

function underAcenji(fullPath) {
  return fullPath.split(path.sep).map((p) => p.toLowerCase()).includes(ACENJI_DIRNAME);
}

// ---------- MAIN ----------
(async function main() {
  console.log(`Input root: ${INPUT_ROOT}`);
  const excelPaths = await fg(["**/*.xls*", "!**/~$*"], {
    cwd: INPUT_ROOT,
    dot: false,
    onlyFiles: true,
    unique: true,
    absolute: true,
    followSymbolicLinks: true,
  });

  if (!excelPaths.length) {
    console.error("No .xlsx files found. Check INPUT_ROOT.");
    process.exit(1);
  }

  const allNodes = [];
  const manifest = { tree: {}, byId: {}, bySlug: {} };

  for (const absFile of excelPaths) {
    try {
      const rel = path.relative(INPUT_ROOT, absFile);
      const parts = rel.split(path.sep);

      // pathParts for taxonomy (include the Input root basename at [0])
      const pathParts = [path.basename(INPUT_ROOT), ...parts.slice(0, -1)];

      // Read the Excel into labels dictionary
      const labelsDict = readXlsx(absFile);

      const title =
        labelsDict["Entity Name"] ||
        path.basename(absFile, path.extname(absFile));

      const slug = toSlug(title);
      const tax = inferTaxonomyFromPath(pathParts, labelsDict);
      const id = buildId(pathParts, title);

      const node = {
        id,
        slug,
        path: pathParts,
        title,
        taxonomy: tax,
        labels: labelsDict,
      };

      if (underAcenji(absFile)) {
        node.license = "ACENji-Custom";
      }

      allNodes.push(node);

      // Write per-node json to dist/nodes/<rel dir>/<file>.json
      const outDir = path.join(OUT_NODES_DIR, path.dirname(rel));
      const outFile = path.join(
        outDir,
        path.basename(absFile, path.extname(absFile)) + ".json"
      );
      await fs.ensureDir(outDir);
      await fs.writeJson(outFile, node, { spaces: 2 });

      // Build manifest indexes
      manifest.byId[node.id] = {
        title: node.title,
        slug: node.slug,
        path: node.path,
        file: path.relative(OUT_DIR, outFile),
      };
      manifest.bySlug[node.slug] = manifest.byId[node.id];

      // Build a simple tree (nested objects)
      let cursor = manifest.tree;
      for (const p of node.path.slice(1)) { // skip root label "Class"
        cursor[p] = cursor[p] || {};
        cursor = cursor[p];
      }
      cursor._items = cursor._items || [];
      cursor._items.push({ id: node.id, title: node.title, slug: node.slug });
    } catch (err) {
      console.error("Failed on:", absFile, err.message);
    }
  }

  await fs.ensureDir(OUT_DIR);
  await fs.writeJson(OUT_COMBINED, { generatedAt: new Date().toISOString(), count: allNodes.length, nodes: allNodes }, { spaces: 2 });
  await fs.writeJson(OUT_MANIFEST, manifest, { spaces: 2 });

  console.log(`Wrote:\n- ${OUT_COMBINED}\n- ${OUT_MANIFEST}\n- ${OUT_NODES_DIR}/... (${allNodes.length} nodes)`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
