import { NextResponse } from "next/server";
import { getPopularVideos, getRecentVideos } from "@/lib/youtube";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get("identifier") ?? "";
  const type = searchParams.get("type") ?? "recent";
  const maxResults = Number.parseInt(searchParams.get("maxResults") ?? "8", 10);
  const limit = Number.isNaN(maxResults) ? 8 : maxResults;

  try {
    const videos =
      type === "popular"
        ? await getPopularVideos(identifier, limit)
        : await getRecentVideos(identifier, limit);

    return NextResponse.json({ videos });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "영상 정보를 불러오지 못했습니다." },
      { status: 400 },
    );
  }
}
