import { NextResponse } from "next/server";
import { createSession, loginWithPassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const user = await loginWithPassword(body.email ?? "", body.password ?? "");
    const token = await createSession(user.id);
    const response = NextResponse.json({ user });
    setSessionCookie(response, token);

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "로그인에 실패했습니다.",
      },
      { status: 401 },
    );
  }
}
