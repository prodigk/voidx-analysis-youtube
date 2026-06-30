import { NextResponse } from "next/server";
import { getInviteByToken } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const invite = await getInviteByToken(token);

  if (!invite) {
    return NextResponse.json(
      { error: "초대 링크를 찾지 못했습니다." },
      { status: 404 },
    );
  }

  return NextResponse.json({ invite });
}
