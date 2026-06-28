import { NextResponse } from "next/server";
import { getSavedAnalysis } from "@/lib/analysis-store";
import { analysisToMarkdown, getAnalysisFilename } from "@/lib/export-format";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const analysis = await getSavedAnalysis(decodeURIComponent(id));

  if (!analysis) {
    return NextResponse.json(
      { error: "저장된 분석 결과를 찾지 못했습니다." },
      { status: 404 },
    );
  }

  return new Response(analysisToMarkdown(analysis), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(
        getAnalysisFilename(analysis, "md"),
      )}"`,
    },
  });
}
