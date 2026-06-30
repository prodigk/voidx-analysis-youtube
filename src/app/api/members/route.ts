import { NextResponse } from "next/server";
import {
  forbiddenResponse,
  getCurrentUser,
  listMembers,
  unauthorizedResponse,
} from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorizedResponse();
  }

  if (user.role !== "admin") {
    return forbiddenResponse();
  }

  const members = await listMembers();

  return NextResponse.json(members);
}
