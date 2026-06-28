import { NextResponse } from "next/server";
import { searchCandidateChannels } from "@/lib/youtube";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? undefined;
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const maxResults = Number.parseInt(searchParams.get("maxResults") ?? "8", 10);

  try {
    const channels = await searchCandidateChannels({
      query,
      categoryId,
      maxResults: Number.isNaN(maxResults) ? 8 : maxResults,
    });

    return NextResponse.json({ channels });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "후보 채널 검색에 실패했습니다." },
      { status: 400 },
    );
  }
}
