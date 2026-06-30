import { NextResponse } from "next/server";
import {
  cancelInvite,
  forbiddenResponse,
  getCurrentUser,
  unauthorizedResponse,
} from "@/lib/auth";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await getCurrentUser();

    if (!actor) {
      return unauthorizedResponse();
    }

    if (actor.role !== "admin") {
      return forbiddenResponse();
    }

    const { id } = await params;
    const invite = await cancelInvite(id, actor);

    return NextResponse.json({ invite });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "초대 취소에 실패했습니다.",
      },
      { status: 400 },
    );
  }
}
