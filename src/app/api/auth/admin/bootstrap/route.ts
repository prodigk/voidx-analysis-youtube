import { NextResponse } from "next/server";
import {
  createAdminUser,
  createSession,
  setSessionCookie,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      name?: string;
      password?: string;
    };

    const user = await createAdminUser({
      email: body.email ?? "",
      name: body.name ?? "",
      password: body.password ?? "",
    });
    const token = await createSession(user.id);
    const response = NextResponse.json({ user });
    setSessionCookie(response, token);

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Admin 계정 생성에 실패했습니다.",
      },
      { status: 400 },
    );
  }
}
