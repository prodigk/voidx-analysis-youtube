import { NextResponse } from "next/server";
import { acceptInvite, createSession, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      name?: string;
      password?: string;
    };

    const user = await acceptInvite({
      token: body.token ?? "",
      name: body.name ?? "",
      password: body.password ?? "",
    });
    const sessionToken = await createSession(user.id);
    const response = NextResponse.json({ user });
    setSessionCookie(response, sessionToken);

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "초대 가입에 실패했습니다.",
      },
      { status: 400 },
    );
  }
}
