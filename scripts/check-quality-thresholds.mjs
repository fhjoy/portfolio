import { readFile } from "node:fs/promises";

const summary = JSON.parse(await readFile("quality/latest.json", "utf8"));

if (summary.status !== "passing") {
  const failedCategories = Object.entries(summary.thresholds)
    .filter(([key, threshold]) => summary.scores[key] < threshold)
    .map(
      ([key, threshold]) =>
        `${key}: ${summary.scores[key]}/100 (required ${threshold})`,
    );

  console.error(`Quality gate failed:\n${failedCategories.join("\n")}`);
  process.exit(1);
}

console.log("Quality gate passed.");

