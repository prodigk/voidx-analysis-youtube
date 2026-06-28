import { NextResponse } from "next/server";
import { getSavedAnalyses } from "@/lib/analysis-store";

export async function GET() {
  const analyses = await getSavedAnalyses();

  return NextResponse.json({ analyses });
}
