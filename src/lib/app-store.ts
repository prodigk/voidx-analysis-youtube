import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  AppStoreData,
  SavedChannel,
  SavedVideoPlan,
} from "@/lib/app-store-types";
import {
  ensureDatabaseSchema,
  getSql,
  hasDatabase,
  toIsoString,
} from "@/lib/database";
import type { YouTubeChannelStats } from "@/lib/youtube";

const storePath = path.join(process.cwd(), "data", "app-store.json");

const emptyStore: AppStoreData = {
  channels: [],
  videoPlans: [],
};

type ChannelRow = {
  id: string;
  channel: unknown;
  favorite: boolean;
  saved_at: unknown;
  updated_at: unknown;
};

type VideoPlanRow = {
  id: string;
  title: string;
  category_name: string;
  topic: string;
  book: string;
  tone: string;
  audience: string;
  thumbnail_memo: string;
  title_candidates: unknown;
  created_at: unknown;
  updated_at: unknown;
};

async function ensureStore() {
  await mkdir(path.dirname(storePath), { recursive: true });

  try {
    await readFile(storePath, "utf8");
  } catch {
    await writeStore(emptyStore);
  }
}

async function readStore() {
  await ensureStore();
  const raw = await readFile(storePath, "utf8");

  try {
    const parsed = JSON.parse(raw) as Partial<AppStoreData>;

    return {
      channels: Array.isArray(parsed.channels) ? parsed.channels : [],
      videoPlans: Array.isArray(parsed.videoPlans) ? parsed.videoPlans : [],
    } satisfies AppStoreData;
  } catch {
    return { ...emptyStore, channels: [], videoPlans: [] };
  }
}

async function writeStore(data: AppStoreData) {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function getSavedChannels() {
  if (hasDatabase()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    const rows = (await sql`
      SELECT id, channel, favorite, saved_at, updated_at
      FROM saved_channels
      ORDER BY favorite DESC, updated_at DESC
      LIMIT 200
    `) as ChannelRow[];

    return rows.map(rowToChannel);
  }

  const store = await readStore();

  return [...store.channels].sort((a, b) => {
    if (a.favorite !== b.favorite) {
      return a.favorite ? -1 : 1;
    }

    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

export async function saveChannel(channel: YouTubeChannelStats) {
  if (hasDatabase()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    const now = new Date().toISOString();
    const rows = (await sql`
      INSERT INTO saved_channels (id, channel, favorite, saved_at, updated_at)
      VALUES (
        ${channel.id},
        ${JSON.stringify(channel)}::jsonb,
        false,
        ${now},
        ${now}
      )
      ON CONFLICT (id) DO UPDATE SET
        channel = EXCLUDED.channel,
        favorite = saved_channels.favorite,
        saved_at = saved_channels.saved_at,
        updated_at = EXCLUDED.updated_at
      RETURNING id, channel, favorite, saved_at, updated_at
    `) as ChannelRow[];

    return rowToChannel(rows[0]);
  }

  const store = await readStore();
  const existing = store.channels.find((item) => item.id === channel.id);
  const now = new Date().toISOString();
  const saved: SavedChannel = {
    id: channel.id,
    channel,
    favorite: existing?.favorite ?? false,
    savedAt: existing?.savedAt ?? now,
    updatedAt: now,
  };

  store.channels = [
    saved,
    ...store.channels.filter((item) => item.id !== channel.id),
  ].slice(0, 200);

  await writeStore(store);

  return saved;
}

export async function setChannelFavorite(channelId: string, favorite: boolean) {
  if (hasDatabase()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    const rows = (await sql`
      UPDATE saved_channels
      SET favorite = ${favorite}, updated_at = ${new Date().toISOString()}
      WHERE id = ${channelId}
      RETURNING id, channel, favorite, saved_at, updated_at
    `) as ChannelRow[];

    if (!rows[0]) {
      throw new Error("저장된 채널을 찾지 못했습니다.");
    }

    return rowToChannel(rows[0]);
  }

  const store = await readStore();
  const target = store.channels.find((item) => item.id === channelId);

  if (!target) {
    throw new Error("저장된 채널을 찾지 못했습니다.");
  }

  target.favorite = favorite;
  target.updatedAt = new Date().toISOString();
  await writeStore(store);

  return target;
}

export async function getVideoPlans() {
  if (hasDatabase()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    const rows = (await sql`
      SELECT
        id,
        title,
        category_name,
        topic,
        book,
        tone,
        audience,
        thumbnail_memo,
        title_candidates,
        created_at,
        updated_at
      FROM video_plans
      ORDER BY updated_at DESC
      LIMIT 200
    `) as VideoPlanRow[];

    return rows.map(rowToVideoPlan);
  }

  const store = await readStore();

  return [...store.videoPlans].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export async function saveVideoPlan(
  plan: Omit<SavedVideoPlan, "id" | "createdAt" | "updatedAt">,
) {
  if (hasDatabase()) {
    await ensureDatabaseSchema();
    const sql = getSql();
    const now = new Date().toISOString();
    const id = `${Date.now()}-${crypto.randomUUID()}`;
    const rows = (await sql`
      INSERT INTO video_plans (
        id,
        title,
        category_name,
        topic,
        book,
        tone,
        audience,
        thumbnail_memo,
        title_candidates,
        created_at,
        updated_at
      )
      VALUES (
        ${id},
        ${plan.title},
        ${plan.categoryName},
        ${plan.topic},
        ${plan.book},
        ${plan.tone},
        ${plan.audience},
        ${plan.thumbnailMemo},
        ${JSON.stringify(plan.titleCandidates)}::jsonb,
        ${now},
        ${now}
      )
      RETURNING
        id,
        title,
        category_name,
        topic,
        book,
        tone,
        audience,
        thumbnail_memo,
        title_candidates,
        created_at,
        updated_at
    `) as VideoPlanRow[];

    return rowToVideoPlan(rows[0]);
  }

  const store = await readStore();
  const now = new Date().toISOString();
  const saved: SavedVideoPlan = {
    ...plan,
    id: `${Date.now()}-${crypto.randomUUID()}`,
    createdAt: now,
    updatedAt: now,
  };

  store.videoPlans = [saved, ...store.videoPlans].slice(0, 200);

  await writeStore(store);

  return saved;
}

function rowToChannel(row: ChannelRow): SavedChannel {
  return {
    id: row.id,
    channel: row.channel as YouTubeChannelStats,
    favorite: row.favorite,
    savedAt: toIsoString(row.saved_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function rowToVideoPlan(row: VideoPlanRow): SavedVideoPlan {
  return {
    id: row.id,
    title: row.title,
    categoryName: row.category_name,
    topic: row.topic,
    book: row.book,
    tone: row.tone,
    audience: row.audience,
    thumbnailMemo: row.thumbnail_memo,
    titleCandidates: Array.isArray(row.title_candidates)
      ? row.title_candidates
      : [],
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}
