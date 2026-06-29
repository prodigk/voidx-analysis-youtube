import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const outputPath = resolve(process.cwd(), "data", "analysis-results.local.json");
const curl = spawnSync(
  "npx",
  ["vercel", "curl", "/api/analysis", "--", "--silent", "--show-error"],
  {
    cwd: process.cwd(),
    encoding: "utf8",
  },
);

if (curl.status !== 0) {
  process.stderr.write(curl.stderr);
  process.exit(curl.status ?? 1);
}

const payload = parseJsonPayload(curl.stdout);

if (!Array.isArray(payload.analyses)) {
  throw new Error("Vercel /api/analysis 응답에서 analyses 배열을 찾지 못했습니다.");
}

const remoteAnalyses = payload.analyses;
const localAnalyses = readLocalAnalyses(outputPath);
const remoteIds = new Set(remoteAnalyses.map((analysis) => analysis.id));
const merged = [
  ...remoteAnalyses,
  ...localAnalyses.filter((analysis) => !remoteIds.has(analysis.id)),
];

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");

console.log(`Synced ${remoteAnalyses.length} analyses from Vercel.`);
console.log(`Local analysis-results.local.json now has ${merged.length} analyses.`);

function parseJsonPayload(source) {
  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");

  if (start < 0 || end < start) {
    throw new Error("Vercel curl 응답에서 JSON 본문을 찾지 못했습니다.");
  }

  return JSON.parse(source.slice(start, end + 1));
}

function readLocalAnalyses(path) {
  if (!existsSync(path)) {
    return [];
  }

  try {
    const parsed = JSON.parse(readFileSync(path, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
