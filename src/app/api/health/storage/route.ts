import { NextResponse } from "next/server";
import {
  ensureDatabaseSchema,
  getSql,
  getStorageMode,
  hasDatabase,
} from "@/lib/database";

type CountRow = { count: number };

export async function GET() {
  const mode = getStorageMode();

  if (!hasDatabase()) {
    return NextResponse.json(
      {
        ok: mode === "file-fallback",
        storage: mode,
        databaseConfigured: false,
        message:
          mode === "file-fallback"
            ? "로컬 개발용 JSON fallback을 사용 중입니다."
            : "DATABASE_URL이 없어 운영 저장소를 사용할 수 없습니다.",
      },
      { status: mode === "file-fallback" ? 200 : 500 },
    );
  }

  try {
    await ensureDatabaseSchema();
    const sql = getSql();
    const [analysisCount, channelCount, planCount] = (await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM saved_analyses`,
      sql`SELECT COUNT(*)::int AS count FROM saved_channels`,
      sql`SELECT COUNT(*)::int AS count FROM video_plans`,
    ])) as unknown as [CountRow[], CountRow[], CountRow[]];

    return NextResponse.json({
      ok: true,
      storage: "postgres",
      databaseConfigured: true,
      counts: {
        analyses: Number(analysisCount[0]?.count ?? 0),
        channels: Number(channelCount[0]?.count ?? 0),
        videoPlans: Number(planCount[0]?.count ?? 0),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        storage: "postgres",
        databaseConfigured: true,
        error:
          error instanceof Error
            ? error.message
            : "저장소 상태 확인에 실패했습니다.",
      },
      { status: 500 },
    );
  }
}
