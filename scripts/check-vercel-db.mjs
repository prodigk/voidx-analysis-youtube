import { existsSync, readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const envPath = ".env.local";

if (!existsSync(envPath)) {
  throw new Error(".env.local이 없습니다. 먼저 `npm run sync:vercel-env`를 실행하세요.");
}

const env = parseEnv(readFileSync(envPath, "utf8"));
const databaseUrl = env.get("DATABASE_URL");

if (!databaseUrl) {
  throw new Error(
    ".env.local에 DATABASE_URL이 없습니다. 먼저 `npm run sync:vercel-env`를 실행하세요.",
  );
}

const sql = neon(databaseUrl);
const rows = await sql`
  SELECT
    to_regclass('public.saved_analyses') IS NOT NULL AS has_analyses,
    to_regclass('public.saved_channels') IS NOT NULL AS has_channels,
    to_regclass('public.video_plans') IS NOT NULL AS has_video_plans
`;

const tableState = rows[0];
const [analysisCount, channelCount, videoPlanCount] = await Promise.all([
  tableState.has_analyses
    ? sql`SELECT COUNT(*)::int AS count FROM saved_analyses`
    : [{ count: 0 }],
  tableState.has_channels
    ? sql`SELECT COUNT(*)::int AS count FROM saved_channels`
    : [{ count: 0 }],
  tableState.has_video_plans
    ? sql`SELECT COUNT(*)::int AS count FROM video_plans`
    : [{ count: 0 }],
]);

console.log("Vercel DB connection: ok");
console.log(`saved_analyses: ${Number(analysisCount[0]?.count ?? 0)}`);
console.log(`saved_channels: ${Number(channelCount[0]?.count ?? 0)}`);
console.log(`video_plans: ${Number(videoPlanCount[0]?.count ?? 0)}`);

function parseEnv(source) {
  const entries = new Map();

  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");

    if (equalsIndex <= 0) {
      continue;
    }

    entries.set(
      trimmed.slice(0, equalsIndex).trim(),
      normalizeValue(trimmed.slice(equalsIndex + 1).trim()),
    );
  }

  return entries;
}

function normalizeValue(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
