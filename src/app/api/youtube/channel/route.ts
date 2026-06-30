import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getYouTubeChannel } from "@/lib/youtube";

export async function GET(request: Request) {
  const { response } = await requireApiUser();

  if (response) {
    return response;
  }

  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get("identifier") ?? "";

  try {
    const channel = await getYouTubeChannel(identifier);

    return NextResponse.json({ channel });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "채널 정보를 불러오지 못했습니다." },
      { status: 400 },
    );
  }
}
