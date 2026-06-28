import "server-only";

import { neon } from "@neondatabase/serverless";

type SqlClient = ReturnType<typeof neon>;

let sqlClient: SqlClient | null = null;
let schemaReady = false;

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export function canUseFileFallback() {
  return !process.env.VERCEL;
}

export function getStorageMode() {
  if (hasDatabase()) {
    return "postgres";
  }

  return canUseFileFallback() ? "file-fallback" : "missing-database";
}

export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL 환경변수가 설정되지 않았습니다.");
  }

  if (!sqlClient) {
    sqlClient = neon(process.env.DATABASE_URL);
  }

  return sqlClient;
}

export async function ensureDatabaseSchema() {
  if (!hasDatabase() || schemaReady) {
    return;
  }

  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS saved_analyses (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      source_label TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      input JSONB NOT NULL,
      result JSONB NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS saved_channels (
      id TEXT PRIMARY KEY,
      channel JSONB NOT NULL,
      favorite BOOLEAN NOT NULL DEFAULT false,
      saved_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS video_plans (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category_name TEXT NOT NULL,
      topic TEXT NOT NULL DEFAULT '',
      book TEXT NOT NULL DEFAULT '',
      tone TEXT NOT NULL DEFAULT '',
      audience TEXT NOT NULL DEFAULT '',
      thumbnail_memo TEXT NOT NULL DEFAULT '',
      title_candidates JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    )
  `;

  schemaReady = true;
}

export function assertWritableStorage() {
  if (!hasDatabase() && !canUseFileFallback()) {
    throw new Error(
      "DATABASE_URL 환경변수가 없어 운영 저장소를 사용할 수 없습니다. Vercel Marketplace에서 Neon 연결 상태를 확인하세요.",
    );
  }
}

export function toIsoString(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}
