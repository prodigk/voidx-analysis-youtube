import { NextResponse } from "next/server";
import { getSavedAnalyses } from "@/lib/analysis-store";
import { requireApiUser } from "@/lib/auth";

export async function GET() {
  const { response } = await requireApiUser();

  if (response) {
    return response;
  }

  const analyses = await getSavedAnalyses();

  return NextResponse.json({ analyses });
}
