import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const environment = process.argv.includes("--preview")
  ? "preview"
  : process.argv.includes("--development")
    ? "development"
    : "production";

const root = process.cwd();
const pulledEnvPath = resolve(root, `.env.vercel.${environment}.local`);
const localEnvPath = resolve(root, ".env.local");

const syncedKeys = new Set([
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_URL_NO_SSL",
  "POSTGRES_HOST",
  "POSTGRES_DATABASE",
  "POSTGRES_USER",
  "POSTGRES_PASSWORD",
  "PGHOST",
  "PGHOST_UNPOOLED",
  "PGDATABASE",
  "PGUSER",
  "PGPASSWORD",
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
  "YOUTUBE_API_KEY",
  "PDF_KOREAN_FONT_PATH",
]);

const blockedPrefixes = ["VERCEL", "TURBO", "NX_", "NEXT_RUNTIME"];
const blockedKeys = new Set(["VITE_NEON_AUTH_URL", "NEON_AUTH_BASE_URL"]);

const pull = spawnSync(
  "npx",
  [
    "vercel",
    "env",
    "pull",
    pulledEnvPath,
    `--environment=${environment}`,
    "--yes",
  ],
  {
    cwd: root,
    stdio: "inherit",
  },
);

if (pull.status !== 0) {
  process.exit(pull.status ?? 1);
}

const pulled = parseEnv(readFileSync(pulledEnvPath, "utf8"));
const current = existsSync(localEnvPath)
  ? parseEnv(readFileSync(localEnvPath, "utf8"))
  : new Map();
let syncedCount = 0;

for (const [key, value] of pulled) {
  if (shouldSync(key) && value) {
    current.set(key, value);
    syncedCount += 1;
  }
}

for (const key of Array.from(current.keys())) {
  if (shouldBlock(key) || (syncedKeys.has(key) && !current.get(key))) {
    current.delete(key);
  }
}

if (!current.has("DATABASE_URL")) {
  console.warn(
    `${environment} 환경에서 읽을 수 있는 DATABASE_URL을 찾지 못했습니다. 민감 변수는 Vercel CLI에서 빈 값으로 내려올 수 있습니다.`,
  );
}

const nextEnv = [
  "# Generated for local development. Do not commit.",
  "# Run `npm run sync:vercel-env` to refresh values from Vercel production.",
  ...Array.from(current.entries()).map(([key, value]) => `${key}=${value}`),
  "",
].join("\n");

writeFileSync(localEnvPath, nextEnv, "utf8");

console.log(
  `Synced ${syncedCount} local env keys from Vercel ${environment} to .env.local.`,
);

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

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = normalizeValue(trimmed.slice(equalsIndex + 1).trim());

    entries.set(key, value);
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

function shouldSync(key) {
  return syncedKeys.has(key) && !shouldBlock(key);
}

function shouldBlock(key) {
  return (
    blockedKeys.has(key) ||
    blockedPrefixes.some((prefix) => key === prefix || key.startsWith(prefix))
  );
}
