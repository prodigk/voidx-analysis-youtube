import { NextResponse } from "next/server";
import type { UserRole } from "@/lib/auth";
import {
  createInvite,
  forbiddenResponse,
  getCurrentUser,
  unauthorizedResponse,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const actor = await getCurrentUser();

    if (!actor) {
      return unauthorizedResponse();
    }

    if (actor.role !== "admin") {
      return forbiddenResponse();
    }

    const body = (await request.json()) as {
      email?: string;
      role?: UserRole;
    };
    const role = body.role === "admin" ? "admin" : "member";
    const { invite, token } = await createInvite({
      email: body.email ?? "",
      role,
      invitedBy: actor.id,
    });
    const inviteUrl = new URL(`/signup/invite/${token}`, request.url).toString();

    return NextResponse.json({ invite, inviteUrl });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "초대 생성에 실패했습니다.",
      },
      { status: 400 },
    );
  }
}
