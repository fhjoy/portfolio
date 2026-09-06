import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const reportsDirectory = path.resolve(".lighthouseci");
const outputPath = path.resolve("quality/latest.json");
const categoryMap = {
  performance: "performance",
  accessibility: "accessibility",
  bestPractices: "best-practices",
  seo: "seo",
};
const thresholds = {
  performance: 80,
  accessibility: 95,
  bestPractices: 90,
  seo: 90,
};

async function findJsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return findJsonFiles(entryPath);
      return entry.isFile() && entry.name.endsWith(".json") ? [entryPath] : [];
    }),
  );
  return nestedFiles.flat();
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function normalisePath(reportUrl) {
  const url = new URL(reportUrl);
  return url.pathname.replace(/\/index\.html$/, "/") || "/";
}

const jsonFiles = await findJsonFiles(reportsDirectory);
const reports = [];

for (const filePath of jsonFiles) {
  try {
    const candidate = JSON.parse(await readFile(filePath, "utf8"));
    if (candidate?.categories && candidate?.finalUrl) reports.push(candidate);
  } catch {
    // Ignore LHCI support files such as manifests; only LHR documents are used.
  }
}

if (!reports.length) {
  throw new Error("No Lighthouse result documents were found.");
}

const pageGroups = new Map();
for (const report of reports) {
  const pagePath = normalisePath(report.finalUrl);
  const pageReports = pageGroups.get(pagePath) || [];
  pageReports.push(report);
  pageGroups.set(pagePath, pageReports);
}

const pageScores = [...pageGroups.values()].map((pageReports) => {
  return Object.fromEntries(
    Object.entries(categoryMap).map(([publicKey, lighthouseKey]) => {
      const values = pageReports
        .map((report) => Number(report.categories[lighthouseKey]?.score))
        .filter(Number.isFinite)
        .map((score) => score * 100);

      if (!values.length) {
        throw new Error(`Missing Lighthouse category: ${lighthouseKey}`);
      }

      return [publicKey, Math.round(median(values))];
    }),
  );
});

const scores = Object.fromEntries(
  Object.keys(categoryMap).map((key) => [
    key,
    Math.min(...pageScores.map((page) => page[key])),
  ]),
);
const passing = Object.entries(thresholds).every(
  ([key, threshold]) => scores[key] >= threshold,
);

const summary = {
  schemaVersion: 1,
  status: passing ? "passing" : "attention",
  updatedAt: new Date().toISOString(),
  commit: process.env.GITHUB_SHA?.slice(0, 7) || null,
  runs: reports.length,
  pages: pageGroups.size,
  scores,
  thresholds,
};

await writeFile(outputPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
console.log(`Quality summary written for ${summary.pages} pages and ${summary.runs} runs.`);

