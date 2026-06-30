import { NextResponse } from "next/server";
import { getSavedChannels, saveChannel } from "@/lib/app-store";
import { requireApiUser } from "@/lib/auth";
import type { YouTubeChannelStats } from "@/lib/youtube";

export async function GET() {
  const { response } = await requireApiUser();

  if (response) {
    return response;
  }

  const channels = await getSavedChannels();

  return NextResponse.json({ channels });
}

export async function POST(request: Request) {
  try {
    const { response } = await requireApiUser();

    if (response) {
      return response;
    }

    const body = (await request.json()) as { channel?: YouTubeChannelStats };

    if (!body.channel?.id) {
      return NextResponse.json(
        { error: "저장할 채널 데이터가 없습니다." },
        { status: 400 },
      );
    }

    const channel = await saveChannel(body.channel);

    return NextResponse.json({ channel });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "채널 저장에 실패했습니다.",
      },
      { status: 400 },
    );
  }
}
