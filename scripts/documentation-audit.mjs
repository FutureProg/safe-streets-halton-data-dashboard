#!/usr/bin/env node
/**
 * Documentation Factory: a manually-invoked audit that checks this repository's
 * documentation for gaps, formatting issues, and drift against the actual code.
 *
 * Usage: `npm run docs:audit` (or `node scripts/documentation-audit.mjs`)
 *
 * This script only inspects files that actually exist in the working tree; it
 * never fabricates findings about content it hasn't read. It prints a report to
 * stdout and writes the same report to docs/DOCUMENTATION_AUDIT_REPORT.md.
 */
import { existsSync, readFileSync, mkdirSync, writeFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);

/** @type {{severity: "high"|"medium"|"low", area: string, message: string}[]} */
const findings = [];

function add(severity, area, message) {
  findings.push({ severity, area, message });
}

function read(relPath) {
  const full = path.join(root, relPath);
  return existsSync(full) ? readFileSync(full, "utf8") : null;
}

function walk(dir, exts, out = []) {
  const full = path.join(root, dir);
  if (!existsSync(full)) return out;
  for (const entry of readdirSync(full)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const rel = path.join(dir, entry);
    const abs = path.join(root, rel);
    const stat = statSync(abs);
    if (stat.isDirectory()) {
      walk(rel, exts, out);
    } else if (exts.some((e) => entry.endsWith(e))) {
      out.push(rel);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// 1. Missing documentation in key areas
// ---------------------------------------------------------------------------
const readme = read("README.md");
if (!readme) {
  add("high", "missing-docs", "README.md is missing entirely.");
} else {
  for (const section of ["Installation", "Usage", "Development", "Contributing"]) {
    if (!new RegExp(`^#{1,3}\\s*${section}`, "im").test(readme)) {
      add("medium", "missing-docs", `README.md has no "${section}" section.`);
    }
  }
}

if (!read("LICENSE") && !read("LICENSE.md") && !read("LICENSE.txt")) {
  add("low", "missing-docs", "No LICENSE file found at the repository root.");
}

if (!read("CONTRIBUTING.md")) {
  add("medium", "missing-docs", "No CONTRIBUTING.md found describing how to propose changes.");
}

const docsDirExists = existsSync(path.join(root, "docs"));
if (!docsDirExists) {
  add("medium", "missing-docs", "No docs/ directory found for deeper reference material (API, configuration, architecture).");
}

const envSchema = read(".env.schema");
if (envSchema && readme && !/\.env\.schema/.test(readme)) {
  add("low", "missing-docs", "README.md does not mention .env.schema, which is the source of truth for required environment variables.");
}

const apiRouteFiles = walk("src/app/api", [".ts", ".tsx"]).filter((f) => f.endsWith("route.ts") || f.endsWith("route.tsx"));
if (apiRouteFiles.length > 0 && !docsDirExists) {
  add("medium", "missing-docs", `${apiRouteFiles.length} API route handler(s) found under src/app/api (${apiRouteFiles.join(", ")}) with no docs/API.md describing them.`);
}

// ---------------------------------------------------------------------------
// 2. Formatting / structure validation for existing Markdown files
// ---------------------------------------------------------------------------
const markdownFiles = walk(".", [".md"]).filter((f) => !f.startsWith("node_modules"));
for (const file of markdownFiles) {
  const content = read(file);
  if (content === null) continue;
  const lines = content.split("\n");

  // Heading hierarchy: flag a jump of more than one level (e.g. "#" then "###").
  let lastLevel = 0;
  lines.forEach((line, i) => {
    const match = /^(#{1,6})\s+\S/.exec(line);
    if (match) {
      const level = match[1].length;
      if (lastLevel > 0 && level > lastLevel + 1) {
        add("low", "formatting", `${file}:${i + 1} skips a heading level (## → ${match[1]}).`);
      }
      lastLevel = level;
    }
  });

  // Fenced code blocks without a language tag.
  lines.forEach((line, i) => {
    if (/^```\s*$/.test(line.trim())) {
      add("low", "formatting", `${file}:${i + 1} has a fenced code block with no language tag.`);
    }
  });

  // Relative markdown links that point at files that don't exist.
  const linkRegex = /\[[^\]]*\]\(([^)#]+)(#[^)]*)?\)/g;
  let m;
  while ((m = linkRegex.exec(content))) {
    const target = m[1];
    if (/^(https?:)?\/\//.test(target) || target.startsWith("mailto:")) continue;
    const resolved = path.resolve(path.dirname(path.join(root, file)), target);
    if (!existsSync(resolved)) {
      add("medium", "formatting", `${file} links to "${target}", which does not exist.`);
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Outdated / inaccurate documentation vs. actual code
// ---------------------------------------------------------------------------
const pkg = JSON.parse(read("package.json") ?? "{}");
const scripts = pkg.scripts ?? {};
if (readme) {
  for (const scriptName of Object.keys(scripts)) {
    if (!readme.includes(scriptName)) {
      add("low", "outdated", `package.json script "${scriptName}" is not mentioned anywhere in README.md.`);
    }
  }
}

// Database engine drift: README should reflect the actual ORM driver in package.json.
const dbDrivers = Object.keys(pkg.dependencies ?? {}).filter((d) => /mysql|pg|postgres/i.test(d));
if (readme && dbDrivers.length > 0) {
  const mentionsMysql = /mysql/i.test(readme);
  const mentionsPostgres = /postgres/i.test(readme);
  const hasPgDriver = dbDrivers.some((d) => /pg|postgres/i.test(d));
  const hasMysqlDriver = dbDrivers.some((d) => /mysql/i.test(d));
  if (hasPgDriver && !hasMysqlDriver && mentionsMysql && !mentionsPostgres) {
    add("high", "outdated", "README.md describes the database as MySQL, but package.json only lists a Postgres driver dependency - the migration described in the README may already be complete.");
  }
}

// CI workflow drift: README/AGENTS shouldn't claim triggers the workflow doesn't have.
const workflowDir = path.join(root, ".github/workflows");
if (existsSync(workflowDir)) {
  for (const wf of readdirSync(workflowDir)) {
    const content = read(`.github/workflows/${wf}`);
    if (content && !/workflow_dispatch/.test(content) && readme && /manually/i.test(readme) && new RegExp(wf).test(readme)) {
      add("low", "outdated", `.github/workflows/${wf} is referenced as manual in documentation but has no workflow_dispatch trigger.`);
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
const order = { high: 0, medium: 1, low: 2 };
findings.sort((a, b) => order[a.severity] - order[b.severity]);

const counts = { high: 0, medium: 0, low: 0 };
for (const f of findings) counts[f.severity]++;

const lines = [];
lines.push("# Documentation Audit Report");
lines.push("");
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push("");
lines.push(`This report was produced by \`scripts/documentation-audit.mjs\` (run via \`npm run docs:audit\`), which only inspects files present in the working tree at run time.`);
lines.push("");
lines.push(`## Summary`);
lines.push("");
lines.push(`- High severity: ${counts.high}`);
lines.push(`- Medium severity: ${counts.medium}`);
lines.push(`- Low severity: ${counts.low}`);
lines.push("");
if (findings.length === 0) {
  lines.push("No findings - documentation looks consistent with the checks this script performs.");
} else {
  lines.push("## Findings");
  lines.push("");
  for (const f of findings) {
    lines.push(`- **[${f.severity.toUpperCase()}] ${f.area}**: ${f.message}`);
  }
}
lines.push("");

const report = lines.join("\n");
console.log(report);

mkdirSync(path.join(root, "docs"), { recursive: true });
writeFileSync(path.join(root, "docs/DOCUMENTATION_AUDIT_REPORT.md"), report);

process.exitCode = counts.high > 0 ? 1 : 0;
