import { NextResponse } from "next/server";
import { setChannelFavorite } from "@/lib/app-store";
import { requireApiUser } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { response } = await requireApiUser();

    if (response) {
      return response;
    }

    const { id } = await params;
    const body = (await request.json()) as { favorite?: boolean };

    const channel = await setChannelFavorite(
      decodeURIComponent(id),
      Boolean(body.favorite),
    );

    return NextResponse.json({ channel });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "즐겨찾기 변경에 실패했습니다.",
      },
      { status: 400 },
    );
  }
}
