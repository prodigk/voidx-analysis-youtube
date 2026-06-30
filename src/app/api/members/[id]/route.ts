import { NextResponse } from "next/server";
import type { UserRole, UserStatus } from "@/lib/auth";
import {
  forbiddenResponse,
  getCurrentUser,
  unauthorizedResponse,
  updateMember,
} from "@/lib/auth";

export async function PATCH(
  request: Request,
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
    const body = (await request.json()) as {
      role?: UserRole;
      status?: UserStatus;
    };
    const role =
      body.role === "admin" || body.role === "member" ? body.role : undefined;
    const status =
      body.status === "active" || body.status === "inactive"
        ? body.status
        : undefined;
    const user = await updateMember({ id, role, status, actor });

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "회원 변경에 실패했습니다.",
      },
      { status: 400 },
    );
  }
}
