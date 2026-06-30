import { NextResponse } from "next/server";
import { clearSessionCookie, destroyCurrentSession } from "@/lib/auth";

export async function GET(request: Request) {
  await destroyCurrentSession();

  const response = NextResponse.redirect(new URL("/login", request.url));
  clearSessionCookie(response);

  return response;
}
