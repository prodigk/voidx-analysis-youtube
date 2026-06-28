import { NextResponse } from "next/server";
import { refreshYouTubeChannel } from "@/lib/youtube";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get("identifier") ?? "";

  try {
    const result = await refreshYouTubeChannel(identifier);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "데이터 새로고침에 실패했습니다." },
      { status: 400 },
    );
  }
}
