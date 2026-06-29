import "server-only";

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SavedAnalysis } from "@/lib/analysis-types";
import {
  assertWritableStorage,
  ensureDatabaseSchema,
  getSql,
  hasDatabase,
  toIsoString,
} from "@/lib/database";

const defaultStorePath = path.join(
  process.cwd(),
  "data",
  "analysis-results.json",
);
const localStorePath = path.join(
  process.cwd(),
  "data",
  "analysis-results.local.json",
);

type AnalysisRow = {
  id: string;
  type: SavedAnalysis["type"];
  title: string;
  source_label: string;
  created_at: unknown;
  tags: unknown;
  input: unknown;
  result: unknown;
};

async function ensureStore() {
  const storePath = getStorePath();

  await mkdir(path.dirname(storePath), { recursive: true });

  try {
    await readFile(storePath, "utf8");
  } catch {
    await writeFile(storePath, "[]\n", "utf8");
  }
}

function getStorePath() {
  if (existsSync(localStorePath)) {
    return localStorePath;
  }

  return defaultStorePath;
}

export async function getSavedAnalyses() {
  if (hasDatabase()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    const rows = (await sql`
      SELECT id, type, title, source_label, created_at, tags, input, result
      FROM saved_analyses
      ORDER BY created_at DESC
      LIMIT 100
    `) as AnalysisRow[];

    return rows.map(rowToAnalysis);
  }

  assertWritableStorage();
  await ensureStore();
  const storePath = getStorePath();
  const raw = await readFile(storePath, "utf8");

  try {
    return JSON.parse(raw) as SavedAnalysis[];
  } catch {
    return [];
  }
}

export async function saveAnalysis(analysis: SavedAnalysis) {
  if (hasDatabase()) {
    await ensureDatabaseSchema();
    const sql = getSql();

    await sql`
      INSERT INTO saved_analyses (
        id, type, title, source_label, created_at, tags, input, result
      )
      VALUES (
        ${analysis.id},
        ${analysis.type},
        ${analysis.title},
        ${analysis.sourceLabel},
        ${analysis.createdAt},
        ${JSON.stringify(analysis.tags ?? [])}::jsonb,
        ${JSON.stringify(analysis.input)}::jsonb,
        ${JSON.stringify(analysis.result)}::jsonb
      )
      ON CONFLICT (id) DO UPDATE SET
        type = EXCLUDED.type,
        title = EXCLUDED.title,
        source_label = EXCLUDED.source_label,
        created_at = EXCLUDED.created_at,
        tags = EXCLUDED.tags,
        input = EXCLUDED.input,
        result = EXCLUDED.result
    `;

    await sql`
      DELETE FROM saved_analyses
      WHERE id IN (
        SELECT id FROM saved_analyses
        ORDER BY created_at DESC
        OFFSET 100
      )
    `;

    return analysis;
  }

  assertWritableStorage();
  const analyses = await getSavedAnalyses();
  const next = [analysis, ...analyses].slice(0, 100);
  const storePath = getStorePath();

  await writeFile(storePath, `${JSON.stringify(next, null, 2)}\n`, "utf8");

  return analysis;
}

export async function getSavedAnalysis(id: string) {
  if (hasDatabase()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    const rows = (await sql`
      SELECT id, type, title, source_label, created_at, tags, input, result
      FROM saved_analyses
      WHERE id = ${id}
      LIMIT 1
    `) as AnalysisRow[];

    return rows[0] ? rowToAnalysis(rows[0]) : null;
  }

  assertWritableStorage();
  const analyses = await getSavedAnalyses();

  return analyses.find((analysis) => analysis.id === id) ?? null;
}

export async function updateAnalysisTags(id: string, tags: string[]) {
  const normalizedTags = Array.from(
    new Set(
      tags
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 12),
    ),
  );

  if (hasDatabase()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    const rows = (await sql`
      UPDATE saved_analyses
      SET tags = ${JSON.stringify(normalizedTags)}::jsonb
      WHERE id = ${id}
      RETURNING id, type, title, source_label, created_at, tags, input, result
    `) as AnalysisRow[];

    if (!rows[0]) {
      throw new Error("저장된 분석 결과를 찾지 못했습니다.");
    }

    return rowToAnalysis(rows[0]);
  }

  assertWritableStorage();
  const analyses = await getSavedAnalyses();
  let updated: SavedAnalysis | null = null;
  const next = analyses.map((analysis) => {
    if (analysis.id !== id) {
      return analysis;
    }

    updated = { ...analysis, tags: normalizedTags };
    return updated;
  });

  if (!updated) {
    throw new Error("저장된 분석 결과를 찾지 못했습니다.");
  }

  const storePath = getStorePath();

  await writeFile(storePath, `${JSON.stringify(next, null, 2)}\n`, "utf8");

  return updated;
}

function rowToAnalysis(row: AnalysisRow): SavedAnalysis {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    sourceLabel: row.source_label,
    createdAt: toIsoString(row.created_at),
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    input: row.input as SavedAnalysis["input"],
    result: row.result as SavedAnalysis["result"],
  };
}
